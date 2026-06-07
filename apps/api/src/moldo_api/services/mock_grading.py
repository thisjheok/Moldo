from time import sleep

from moldo_api.repositories.mock_repository import (
    complete_attempt_with_result,
    fail_attempt,
    get_attempt,
    get_exam_by_id,
    list_questions_by_exam_id,
)
from moldo_api.schemas.attempt import AttemptAnswerMetadata
from moldo_api.schemas.exam import ExamQuestion
from moldo_api.schemas.result import ExamResult, ResultAnswer
from moldo_api.services.evaluation import EvaluationService, OpenAIEvaluationService
from moldo_api.services.transcription import OpenAITranscriptionService, TranscriptionService


def run_mock_grading_worker(
    attempt_id: str,
    transcription_service: TranscriptionService | None = None,
    evaluation_service: EvaluationService | None = None,
) -> None:
    try:
        sleep(1)
        transcription_service = transcription_service or OpenAITranscriptionService()
        evaluation_service = evaluation_service or OpenAIEvaluationService()

        attempt = get_attempt(attempt_id)
        if attempt is None:
            fail_attempt(attempt_id)
            return

        exam = get_exam_by_id(attempt.examId)
        questions = list_questions_by_exam_id(attempt.examId)
        questions_by_id = {question.id: question for question in questions}
        transcripts_by_question_id = {
            answer.questionId: transcription_service.transcribe(answer)
            for answer in attempt.answers
        }
        result_answers = [
            _build_result_answer(
                answer,
                questions_by_id.get(answer.questionId),
                transcripts_by_question_id.get(answer.questionId, ""),
                evaluation_service,
            )
            for answer in attempt.answers
        ]
        result = ExamResult(
            id=f"result-{attempt.id.removeprefix('attempt-')}",
            examId=attempt.examId,
            examTitle=exam.title if exam else attempt.examId,
            takenAt=attempt.submittedAt or attempt.startedAt,
            questionCount=len(questions),
            totalScore=_calculate_average_score(result_answers),
            maxScore=100,
            answers=result_answers,
        )
        complete_attempt_with_result(attempt_id, result)
    except Exception:
        fail_attempt(attempt_id)


def _build_result_answer(
    answer: AttemptAnswerMetadata,
    question: ExamQuestion | None,
    transcript: str,
    evaluation_service: EvaluationService,
) -> ResultAnswer:
    prompt = question.ttsScriptEn if question else answer.questionId
    answer_evaluation = evaluation_service.evaluate_answer(
        question=question,
        answer=answer,
        transcript=transcript,
    )
    return ResultAnswer(
        questionId=answer.questionId,
        questionOrder=answer.questionOrder,
        questionPrompt=prompt,
        transcript=transcript,
        modelAnswer=answer_evaluation.model_answer,
        score=answer_evaluation.score,
        maxScore=100,
        audioUrl=answer.audioUrl,
        durationSeconds=answer.durationSeconds,
        modelAnswerAudioUrl=None,
        modelAnswerDurationSeconds=None,
        improvements=answer_evaluation.improvements,
    )


def _calculate_average_score(result_answers: list[ResultAnswer]) -> int:
    if not result_answers:
        return 0
    return round(sum(answer.score for answer in result_answers) / len(result_answers))
