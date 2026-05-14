from datetime import UTC, datetime
import json
from pathlib import Path
from uuid import uuid4

from ditto_api.schemas.exam import ExamQuestion, ExamSummary
from ditto_api.schemas.history import ExamHistoryItem, MyPageProfile
from ditto_api.schemas.result import ExamResult
from ditto_api.schemas.session import ExamSession, SessionAnswerMetadata

REPO_ROOT = Path(__file__).resolve().parents[5]
MOCK_DATA_DIR = REPO_ROOT / "packages" / "mock-data"

_sessions: dict[str, ExamSession] = {}


def _load_json(filename: str) -> object:
    with (MOCK_DATA_DIR / filename).open(encoding="utf-8") as file:
        return json.load(file)


def _now_iso() -> str:
    return datetime.now(UTC).isoformat()


def list_exams() -> list[ExamSummary]:
    data = _load_json("exams.json")
    if not isinstance(data, list):
        return []
    return [ExamSummary.model_validate(item) for item in data]


def get_exam_by_id(exam_id: str) -> ExamSummary | None:
    return next((exam for exam in list_exams() if exam.id == exam_id), None)


def list_questions_by_exam_id(exam_id: str) -> list[ExamQuestion]:
    data = _load_json("exam-questions.json")
    if not isinstance(data, list):
        return []
    questions = [ExamQuestion.model_validate(item) for item in data]
    return sorted(
        (question for question in questions if question.examId == exam_id),
        key=lambda question: question.order,
    )


def create_session(exam_id: str) -> ExamSession | None:
    exam = get_exam_by_id(exam_id)
    if exam is None:
        return None
    questions = list_questions_by_exam_id(exam_id)
    starting_order = questions[0].order if questions else 1

    session = ExamSession(
        id=f"session-{uuid4()}",
        examId=exam_id,
        status="in_progress",
        startedAt=_now_iso(),
        currentQuestionOrder=starting_order,
        answers=[],
    )
    _sessions[session.id] = session
    return session


def get_session(session_id: str) -> ExamSession | None:
    return _sessions.get(session_id)


def save_session_answer(
    session_id: str,
    *,
    question_id: str,
    question_order: int,
    duration_seconds: int,
    audio_file_name: str | None = None,
    mime_type: str | None = None,
) -> ExamSession | None:
    session = get_session(session_id)
    if session is None:
        return None

    answer = SessionAnswerMetadata(
        questionId=question_id,
        questionOrder=question_order,
        durationSeconds=duration_seconds,
        audioFileName=audio_file_name,
        mimeType=mime_type,
        recordedAt=_now_iso(),
    )

    questions = list_questions_by_exam_id(session.examId)
    question_orders = sorted(question.order for question in questions)
    next_order = next((order for order in question_orders if order > answer.questionOrder), answer.questionOrder)

    updated_answers = [
        existing_answer
        for existing_answer in session.answers
        if existing_answer.questionId != answer.questionId
    ]
    updated_answers.append(answer)
    updated_answers.sort(key=lambda item: item.questionOrder)

    updated_session = session.model_copy(
        update={
            "answers": updated_answers,
            "currentQuestionOrder": next_order,
            "status": "in_progress",
        }
    )
    _sessions[session_id] = updated_session
    return updated_session


def submit_session(session_id: str) -> ExamSession | None:
    session = get_session(session_id)
    if session is None:
        return None

    submitted_session = session.model_copy(
        update={
            "status": "submitted",
            "submittedAt": _now_iso(),
        }
    )
    _sessions[session_id] = submitted_session
    return submitted_session


def get_result(result_id: str) -> ExamResult | None:
    data = _load_json("results.json")
    if not isinstance(data, list):
        return None
    results = [ExamResult.model_validate(item) for item in data]
    return next((result for result in results if result.id == result_id), None)


def list_my_results() -> list[ExamHistoryItem]:
    data = _load_json("histories.json")
    if not isinstance(data, list):
        return []
    return [ExamHistoryItem.model_validate(item) for item in data]


def get_my_profile() -> MyPageProfile:
    return MyPageProfile.model_validate(_load_json("profile.json"))


listExams = list_exams
getExamById = get_exam_by_id
listQuestionsByExamId = list_questions_by_exam_id
createSession = create_session
getSession = get_session
saveSessionAnswer = save_session_answer
submitSession = submit_session
getResult = get_result
listMyResults = list_my_results
