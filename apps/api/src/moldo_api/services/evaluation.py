from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, cast
import importlib
import json

from pydantic import BaseModel, ConfigDict, Field

from moldo_api.config import OpenAISettings, get_openai_settings
from moldo_api.schemas.attempt import AttemptAnswerMetadata
from moldo_api.schemas.exam import ExamQuestion
from moldo_api.schemas.result import ScoreCategory, ScoreItem


@dataclass(frozen=True)
class AnswerEvaluation:
    model_answer: str
    scores: list[ScoreItem]
    strengths: list[str]
    improvements: list[str]


@dataclass(frozen=True)
class AttemptEvaluation:
    total_score: int
    scores: list[ScoreItem]


class OpenAIAnswerEvaluationPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    modelAnswer: str
    relevance: int = Field(ge=0, le=100)
    coherence: int = Field(ge=0, le=100)
    grammar: int = Field(ge=0, le=100)
    expression: int = Field(ge=0, le=100)
    strengths: list[str] = Field(min_length=1, max_length=2)
    improvements: list[str] = Field(min_length=1, max_length=2)


class OpenAIAttemptEvaluationPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    relevance: int = Field(ge=0, le=100)
    coherence: int = Field(ge=0, le=100)
    grammar: int = Field(ge=0, le=100)
    expression: int = Field(ge=0, le=100)


SCORE_WEIGHTS = {
    "relevance": 0.35,
    "coherence": 0.25,
    "grammar": 0.25,
    "expression": 0.15,
}

SCORE_LABELS = {
    "relevance": "질문 적합성",
    "coherence": "답변 구성",
    "grammar": "문법 정확성",
    "expression": "표현 다양성",
}


class EvaluationService(ABC):
    @abstractmethod
    def evaluate_answer(
        self,
        *,
        question: ExamQuestion | None,
        answer: AttemptAnswerMetadata,
        transcript: str,
    ) -> AnswerEvaluation:
        pass

    @abstractmethod
    def evaluate_attempt(
        self,
        answer_evaluations: list[tuple[AttemptAnswerMetadata, str, ExamQuestion | None]],
    ) -> AttemptEvaluation:
        pass


class MockEvaluationService(EvaluationService):
    def evaluate_answer(
        self,
        *,
        question: ExamQuestion | None,
        answer: AttemptAnswerMetadata,
        transcript: str,
    ) -> AnswerEvaluation:
        return AnswerEvaluation(
            model_answer=(
                "A stronger answer would directly address the question, add one or two specific "
                "details, and connect the ideas with clear transitions."
            ),
            scores=_build_score_items(
                relevance=78,
                coherence=74,
                grammar=80,
                expression=72,
            ),
            strengths=[
                "답변이 문항과 연결되어 있고 핵심 의도를 전달했습니다.",
                "녹음 파일이 문항별로 정상 저장되어 채점 흐름에 사용할 수 있습니다.",
            ],
            improvements=[
                "구체적인 예시를 한 가지 더 추가하면 답변의 설득력이 높아집니다.",
                "문장 사이에 because, however, for example 같은 연결어를 사용해 보세요.",
            ],
        )

    def evaluate_attempt(
        self,
        answer_evaluations: list[tuple[AttemptAnswerMetadata, str, ExamQuestion | None]],
    ) -> AttemptEvaluation:
        if not answer_evaluations:
            return AttemptEvaluation(
                total_score=0,
                scores=[
                    ScoreItem(category="relevance", label="질문 적합성", score=0, maxScore=100),
                    ScoreItem(category="coherence", label="답변 구성", score=0, maxScore=100),
                    ScoreItem(category="grammar", label="문법 정확성", score=0, maxScore=100),
                    ScoreItem(category="expression", label="표현 다양성", score=0, maxScore=100),
                ],
            )

        duration_scores = [
            min(90, max(65, 65 + round(answer.durationSeconds / 3)))
            for answer, _transcript, _question in answer_evaluations
        ]
        base_score = round(sum(duration_scores) / len(duration_scores))
        scores = _build_score_items(
            relevance=min(100, base_score + 4),
            coherence=max(0, base_score - 2),
            grammar=min(100, base_score + 1),
            expression=max(0, base_score - 4),
        )

        return AttemptEvaluation(
            total_score=_calculate_total_score(scores),
            scores=scores,
        )


class OpenAIEvaluationService(EvaluationService):
    def __init__(self, *, settings: OpenAISettings | None = None) -> None:
        self.settings = settings or get_openai_settings()
        self.fallback = MockEvaluationService()

    def evaluate_answer(
        self,
        *,
        question: ExamQuestion | None,
        answer: AttemptAnswerMetadata,
        transcript: str,
    ) -> AnswerEvaluation:
        if not self.settings.api_key:
            return self.fallback.evaluate_answer(
                question=question,
                answer=answer,
                transcript=transcript,
            )

        payload = _parse_structured_response(
            client=_create_openai_client(self.settings.api_key),
            model=self.settings.evaluation_model,
            schema_name="answer_evaluation",
            schema=OpenAIAnswerEvaluationPayload.model_json_schema(),
            prompt=_build_answer_evaluation_prompt(question, transcript),
        )
        parsed_payload = OpenAIAnswerEvaluationPayload.model_validate(payload)
        return AnswerEvaluation(
            model_answer=parsed_payload.modelAnswer,
            scores=_build_score_items(
                relevance=parsed_payload.relevance,
                coherence=parsed_payload.coherence,
                grammar=parsed_payload.grammar,
                expression=parsed_payload.expression,
            ),
            strengths=parsed_payload.strengths,
            improvements=parsed_payload.improvements,
        )

    def evaluate_attempt(
        self,
        answer_evaluations: list[tuple[AttemptAnswerMetadata, str, ExamQuestion | None]],
    ) -> AttemptEvaluation:
        if not answer_evaluations or not self.settings.api_key:
            return self.fallback.evaluate_attempt(answer_evaluations)

        answer_summaries = [
            {
                "questionId": answer.questionId,
                "questionOrder": answer.questionOrder,
                "questionPrompt": question.ttsScriptEn if question else "Unknown question",
                "durationSeconds": answer.durationSeconds,
                "transcript": transcript,
            }
            for answer, transcript, question in answer_evaluations
        ]
        payload = _parse_structured_response(
            client=_create_openai_client(self.settings.api_key),
            model=self.settings.evaluation_model,
            schema_name="attempt_evaluation",
            schema=OpenAIAttemptEvaluationPayload.model_json_schema(),
            prompt=(
                "Evaluate this English speaking test attempt using a transcript-based speaking "
                "assessment rubric inspired by interview-style proficiency tests such as OPIc. "
                "Return JSON only.\n\n"
                "Score scale:\n"
                "- All scores must be integers from 0 to 100, where 0 is no credit and 100 is full credit.\n"
                "- Do not use a 0-5, 0-10, or raw summed rubric scale.\n"
                "- Return only normalized category sub-scores. Do not return or invent totalScore.\n"
                "- Treat category scores as normalized sub-scores on the same 0-100 scale.\n"
                "- The server will calculate the final total score using fixed weights: "
                "relevance 35%, coherence 25%, grammar 25%, expression 15%.\n\n"
                "Transcript-only constraints:\n"
                "- Evaluate only what can be inferred from the transcript.\n"
                "- Do not evaluate pronunciation, accent, audio quality, pauses, speed, or spoken fluency.\n"
                "- For short practice tests with limited response time, do not penalize brevity by itself. "
                "Penalize only when brevity causes missing content, unclear organization, or failure to answer.\n\n"
                "Rubric:\n"
                "- relevance: how directly the answer addresses the expected prompt/task and provides appropriate content.\n"
                "- coherence: how clearly the ideas are organized and connected into an understandable response.\n"
                "- grammar: how accurately grammar and sentence structure support comprehensibility.\n"
                "- expression: how appropriate, specific, and varied the vocabulary and phrasing are.\n\n"
                "Score bands:\n"
                "- 90-100: strong task completion, clear organization, accurate language, and specific expression.\n"
                "- 70-89: generally effective response with minor gaps or errors that do not block understanding.\n"
                "- 50-69: partially effective response with limited detail, simple organization, or noticeable errors.\n"
                "- 30-49: weak response with unclear relevance, fragmented organization, or frequent errors.\n"
                "- 0-29: mostly unrelated, mostly incomprehensible, or too little language to assess.\n\n"
                f"Answers metadata: {json.dumps(answer_summaries, ensure_ascii=False)}"
            ),
        )
        parsed_payload = OpenAIAttemptEvaluationPayload.model_validate(payload)
        scores = _build_score_items(
            relevance=parsed_payload.relevance,
            coherence=parsed_payload.coherence,
            grammar=parsed_payload.grammar,
            expression=parsed_payload.expression,
        )
        return AttemptEvaluation(
            total_score=_calculate_total_score(scores),
            scores=scores,
        )


def _build_answer_evaluation_prompt(question: ExamQuestion | None, transcript: str) -> str:
    question_prompt = question.ttsScriptEn if question else "Unknown question"
    return (
        "Evaluate the learner's English speaking answer. Return JSON only.\n"
        "Focus only on transcript-based evaluation: relevance, coherence, grammar, and expression. "
        "Do not evaluate pronunciation, delivery, audio quality, or spoken fluency. "
        "Do not mention official test names or official scores.\n\n"
        "For modelAnswer, write a stronger sample answer as if you are the test taker responding "
        "directly to the prompt. Use first person when appropriate. Do not summarize or describe "
        "what the learner did. Do not start with phrases like 'The learner' or 'The speaker'. "
        "Keep the sample answer natural, concise, and close to the learner's intended meaning while "
        "fixing relevance, grammar, coherence, and expression.\n\n"
        "Also score this individual answer using the same 0-100 transcript-based rubric:\n"
        "- relevance: how directly the answer addresses this prompt and provides appropriate content.\n"
        "- coherence: how clearly the ideas are organized and connected.\n"
        "- grammar: how accurately grammar and sentence structure support comprehensibility.\n"
        "- expression: how appropriate, specific, and varied the vocabulary and phrasing are.\n"
        "All category scores must be integers from 0 to 100. Do not use a 0-5 or 0-10 scale.\n\n"
        "For strengths and improvements, write feedback in Korean. "
        "Each improvement should be specific, actionable, and learner-friendly. "
        "Do not write strengths or improvements in English. "
        "Do not force criticism when the answer already addresses the prompt clearly. "
        "Only mention issues that materially affect relevance, clarity, grammar, or naturalness. "
        "Avoid generic advice such as 'use more varied sentence structures' or 'use richer vocabulary' "
        "unless you can point to a specific phrase and a concrete rewrite. "
        "If there is no meaningful issue, return one improvement that says "
        "'큰 개선점은 없습니다. 현재 답변은 질문에 잘 맞고 자연스럽습니다.' "
        "Return at most two strengths and at most two improvements.\n\n"
        f"Question: {question_prompt}\n"
        f"Transcript: {transcript}"
    )


def _build_score_items(
    *,
    relevance: int,
    coherence: int,
    grammar: int,
    expression: int,
) -> list[ScoreItem]:
    raw_scores = {
        "relevance": relevance,
        "coherence": coherence,
        "grammar": grammar,
        "expression": expression,
    }
    return [
        ScoreItem(
            category=cast(ScoreCategory, category),
            label=SCORE_LABELS[category],
            score=max(0, min(100, score)),
            maxScore=100,
        )
        for category, score in raw_scores.items()
    ]


def _calculate_total_score(scores: list[ScoreItem]) -> int:
    scores_by_category: dict[str, int] = {score.category: score.score for score in scores}
    weighted_score = sum(
        scores_by_category.get(category, 0) * weight
        for category, weight in SCORE_WEIGHTS.items()
    )
    return round(weighted_score)


def _parse_structured_response(
    *,
    client: Any,
    model: str,
    schema_name: str,
    schema: dict[str, Any],
    prompt: str,
) -> dict[str, Any]:
    response = client.responses.create(
        model=model,
        input=[
            {
                "role": "system",
                "content": "You are an English speaking assessment assistant. Return valid JSON.",
            },
            {"role": "user", "content": prompt},
        ],
        text={
            "format": {
                "type": "json_schema",
                "name": schema_name,
                "schema": schema,
                "strict": True,
            }
        },
    )
    output_text = getattr(response, "output_text", "")
    if not output_text:
        raise ValueError("OpenAI response did not include output_text")
    parsed = json.loads(output_text)
    if not isinstance(parsed, dict):
        raise ValueError("OpenAI response was not a JSON object")
    return parsed


def _create_openai_client(api_key: str) -> Any:
    openai_module = importlib.import_module("openai")
    return openai_module.OpenAI(api_key=api_key)
