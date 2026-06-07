from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any
import importlib
import json

from pydantic import BaseModel, ConfigDict, Field

from moldo_api.config import OpenAISettings, get_openai_settings
from moldo_api.schemas.attempt import AttemptAnswerMetadata
from moldo_api.schemas.exam import ExamQuestion


@dataclass(frozen=True)
class AnswerEvaluation:
    model_answer: str
    score: int
    improvements: list[str]


class OpenAIAnswerEvaluationPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    modelAnswer: str
    score: int = Field(ge=0, le=100)
    improvements: list[str] = Field(min_length=1, max_length=2)


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
            score=76,
            improvements=[
                "구체적인 예시를 한 가지 더 추가하면 답변의 설득력이 높아집니다.",
                "문장 사이에 because, however, for example 같은 연결어를 사용해 보세요.",
            ],
        )


class OpenAIEvaluationService(EvaluationService):
    def __init__(self, *, settings: OpenAISettings | None = None) -> None:
        self.settings = settings or get_openai_settings()

    def evaluate_answer(
        self,
        *,
        question: ExamQuestion | None,
        answer: AttemptAnswerMetadata,
        transcript: str,
    ) -> AnswerEvaluation:
        if not self.settings.api_key:
            raise RuntimeError("OpenAI API key is required for answer evaluation.")

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
            score=parsed_payload.score,
            improvements=parsed_payload.improvements,
        )


def _build_answer_evaluation_prompt(question: ExamQuestion | None, transcript: str) -> str:
    question_prompt = question.ttsScriptEn if question else "Unknown question"
    return (
        "Evaluate the learner's English speaking answer. Return JSON only.\n"
        "Focus only on transcript-based evaluation for this single answer. "
        "Do not evaluate pronunciation, delivery, audio quality, or spoken fluency. "
        "Do not mention official test names or official scores.\n\n"
        "For modelAnswer, write a stronger sample answer as if you are the test taker responding "
        "directly to the prompt. Use first person when appropriate. Do not summarize or describe "
        "what the learner did. Do not start with phrases like 'The learner' or 'The speaker'. "
        "Keep the sample answer natural, concise, and close to the learner's intended meaning while "
        "fixing relevance, grammar, coherence, and expression.\n\n"
        "Also score this individual answer with one integer score from 0 to 100. "
        "Consider prompt relevance, clarity, grammar, and natural expression together, but do not "
        "return separate category scores. Do not use a 0-5 or 0-10 scale.\n\n"
        "For improvements, write feedback in Korean. "
        "Each improvement should be specific, actionable, and learner-friendly. "
        "Do not write improvements in English. "
        "Do not force criticism when the answer already addresses the prompt clearly. "
        "Only mention issues that materially affect relevance, clarity, grammar, or naturalness. "
        "Avoid generic advice such as 'use more varied sentence structures' or 'use richer vocabulary' "
        "unless you can point to a specific phrase and a concrete rewrite. "
        "If there is no meaningful issue, return one improvement that says "
        "'큰 개선점은 없습니다. 현재 답변은 질문에 잘 맞고 자연스럽습니다.' "
        "Return at most two improvements.\n\n"
        f"Question: {question_prompt}\n"
        f"Transcript: {transcript}"
    )


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
