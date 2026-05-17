from datetime import UTC, datetime
import json
from pathlib import Path
import sqlite3
from uuid import uuid4

from moldo_api.data.audio_storage import DEFAULT_AUDIO_STORAGE, AudioStorage
from moldo_api.database import connect
from moldo_api.schemas.attempt import AttemptAnswerMetadata, ExamAttempt
from moldo_api.schemas.exam import ExamQuestion, ExamSummary
from moldo_api.schemas.history import ExamHistoryItem, MyPageProfile
from moldo_api.schemas.result import ExamResult
from moldo_api.schemas.session import ExamSession, SessionAnswerMetadata

REPO_ROOT = Path(__file__).resolve().parents[5]
MOCK_DATA_DIR = REPO_ROOT / "packages" / "mock-data"

def _load_json(filename: str) -> object:
    with (MOCK_DATA_DIR / filename).open(encoding="utf-8") as file:
        return json.load(file)


def _now_iso() -> str:
    return datetime.now(UTC).isoformat()


def _dump_model(model: ExamAttempt | ExamSession | ExamResult | AttemptAnswerMetadata | SessionAnswerMetadata) -> str:
    return json.dumps(model.model_dump(mode="json"), ensure_ascii=False)


def _dump_models(models: list[AttemptAnswerMetadata] | list[SessionAnswerMetadata]) -> str:
    return json.dumps([model.model_dump(mode="json") for model in models], ensure_ascii=False)


def _load_attempt_answers(payload: str) -> list[AttemptAnswerMetadata]:
    data = json.loads(payload)
    if not isinstance(data, list):
        return []
    return [AttemptAnswerMetadata.model_validate(item) for item in data]


def _load_session_answers(payload: str) -> list[SessionAnswerMetadata]:
    data = json.loads(payload)
    if not isinstance(data, list):
        return []
    return [SessionAnswerMetadata.model_validate(item) for item in data]


def _row_to_attempt(row: sqlite3.Row) -> ExamAttempt:
    return ExamAttempt(
        id=row["id"],
        examId=row["exam_id"],
        status=row["status"],
        resultId=row["result_id"],
        startedAt=row["started_at"],
        currentQuestionOrder=row["current_question_order"],
        answers=_load_attempt_answers(row["answers_json"]),
        submittedAt=row["submitted_at"],
    )


def _row_to_session(row: sqlite3.Row) -> ExamSession:
    return ExamSession(
        id=row["id"],
        examId=row["exam_id"],
        status=row["status"],
        resultId=row["result_id"],
        startedAt=row["started_at"],
        currentQuestionOrder=row["current_question_order"],
        answers=_load_session_answers(row["answers_json"]),
        submittedAt=row["submitted_at"],
    )


def _save_attempt(attempt: ExamAttempt) -> None:
    with connect() as connection:
        connection.execute(
            """
            INSERT INTO attempts (
                id,
                exam_id,
                status,
                result_id,
                started_at,
                current_question_order,
                answers_json,
                submitted_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                exam_id = excluded.exam_id,
                status = excluded.status,
                result_id = excluded.result_id,
                started_at = excluded.started_at,
                current_question_order = excluded.current_question_order,
                answers_json = excluded.answers_json,
                submitted_at = excluded.submitted_at
            """,
            (
                attempt.id,
                attempt.examId,
                attempt.status,
                attempt.resultId,
                attempt.startedAt,
                attempt.currentQuestionOrder,
                _dump_models(attempt.answers),
                attempt.submittedAt,
            ),
        )


def _save_session(session: ExamSession) -> None:
    with connect() as connection:
        connection.execute(
            """
            INSERT INTO sessions (
                id,
                exam_id,
                status,
                result_id,
                started_at,
                current_question_order,
                answers_json,
                submitted_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                exam_id = excluded.exam_id,
                status = excluded.status,
                result_id = excluded.result_id,
                started_at = excluded.started_at,
                current_question_order = excluded.current_question_order,
                answers_json = excluded.answers_json,
                submitted_at = excluded.submitted_at
            """,
            (
                session.id,
                session.examId,
                session.status,
                session.resultId,
                session.startedAt,
                session.currentQuestionOrder,
                _dump_models(session.answers),
                session.submittedAt,
            ),
        )


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
    _save_session(session)
    return session


def create_attempt(exam_id: str) -> ExamAttempt | None:
    exam = get_exam_by_id(exam_id)
    if exam is None:
        return None
    questions = list_questions_by_exam_id(exam_id)
    starting_order = questions[0].order if questions else 1

    attempt = ExamAttempt(
        id=f"attempt-{uuid4()}",
        examId=exam_id,
        status="in_progress",
        startedAt=_now_iso(),
        currentQuestionOrder=starting_order,
        answers=[],
    )
    _save_attempt(attempt)
    return attempt


def get_attempt(attempt_id: str) -> ExamAttempt | None:
    with connect() as connection:
        row = connection.execute("SELECT * FROM attempts WHERE id = ?", (attempt_id,)).fetchone()
    return _row_to_attempt(row) if row is not None else None


def save_attempt_answer_audio(
    attempt_id: str,
    *,
    question_id: str,
    question_order: int,
    duration_seconds: int,
    content: bytes,
    mime_type: str | None = None,
    audio_file_name: str | None = None,
    storage: AudioStorage = DEFAULT_AUDIO_STORAGE,
) -> ExamAttempt | None:
    attempt = get_attempt(attempt_id)
    if attempt is None:
        return None

    stored_audio = storage.save_attempt_answer_audio(
        attempt_id=attempt_id,
        question_id=question_id,
        content=content,
        mime_type=mime_type,
        original_file_name=audio_file_name,
    )
    answer = AttemptAnswerMetadata(
        questionId=question_id,
        questionOrder=question_order,
        durationSeconds=duration_seconds,
        audioFileName=audio_file_name or stored_audio.file_name,
        mimeType=mime_type,
        audioStorageKey=stored_audio.key,
        audioUrl=stored_audio.url,
        uploadedAt=_now_iso(),
        recordedAt=_now_iso(),
    )

    questions = list_questions_by_exam_id(attempt.examId)
    question_orders = sorted(question.order for question in questions)
    next_order = next((order for order in question_orders if order > answer.questionOrder), answer.questionOrder)

    updated_answers = [
        existing_answer
        for existing_answer in attempt.answers
        if existing_answer.questionId != answer.questionId
    ]
    updated_answers.append(answer)
    updated_answers.sort(key=lambda item: item.questionOrder)

    updated_attempt = attempt.model_copy(
        update={
            "answers": updated_answers,
            "currentQuestionOrder": next_order,
            "status": "in_progress",
        }
    )
    _save_attempt(updated_attempt)
    return updated_attempt


def submit_attempt(attempt_id: str) -> ExamAttempt | None:
    attempt = get_attempt(attempt_id)
    if attempt is None:
        return None

    submitted_attempt = attempt.model_copy(
        update={
            "status": "grading",
            "submittedAt": _now_iso(),
        }
    )
    _save_attempt(submitted_attempt)
    return submitted_attempt


def complete_attempt_with_result(attempt_id: str, result: ExamResult) -> ExamAttempt | None:
    attempt = get_attempt(attempt_id)
    if attempt is None:
        return None

    completed_attempt = attempt.model_copy(
        update={
            "status": "completed",
            "resultId": result.id,
        }
    )
    with connect() as connection:
        connection.execute(
            """
            INSERT INTO results (id, payload_json)
            VALUES (?, ?)
            ON CONFLICT(id) DO UPDATE SET payload_json = excluded.payload_json
            """,
            (result.id, _dump_model(result)),
        )
    _save_attempt(completed_attempt)
    return completed_attempt


def fail_attempt(attempt_id: str) -> ExamAttempt | None:
    attempt = get_attempt(attempt_id)
    if attempt is None:
        return None

    failed_attempt = attempt.model_copy(update={"status": "failed"})
    _save_attempt(failed_attempt)
    return failed_attempt


def get_session(session_id: str) -> ExamSession | None:
    with connect() as connection:
        row = connection.execute("SELECT * FROM sessions WHERE id = ?", (session_id,)).fetchone()
    return _row_to_session(row) if row is not None else None


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
    _save_session(updated_session)
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
    _save_session(submitted_session)
    return submitted_session


def get_result(result_id: str) -> ExamResult | None:
    with connect() as connection:
        row = connection.execute("SELECT payload_json FROM results WHERE id = ?", (result_id,)).fetchone()
    if row is not None:
        return ExamResult.model_validate(json.loads(row["payload_json"]))

    data = _load_json("results.json")
    if not isinstance(data, list):
        return None
    results = [ExamResult.model_validate(item) for item in data]
    return next((result for result in results if result.id == result_id), None)


def list_my_results() -> list[ExamHistoryItem]:
    data = _load_json("histories.json")
    saved_histories = []
    if isinstance(data, list):
        saved_histories = [ExamHistoryItem.model_validate(item) for item in data]

    with connect() as connection:
        rows = connection.execute("SELECT payload_json FROM results").fetchall()

    generated_results = [ExamResult.model_validate(json.loads(row["payload_json"])) for row in rows]
    generated_histories = [
        ExamHistoryItem(
            id=f"history-{result.id.removeprefix('result-')}",
            resultId=result.id,
            examId=result.examId,
            examTitle=result.examTitle,
            takenAt=result.takenAt,
            questionCount=result.questionCount,
            totalScore=result.totalScore,
            maxScore=result.maxScore,
            durationSeconds=sum(answer.durationSeconds for answer in result.answers),
        )
        for result in generated_results
    ]
    generated_result_ids = {history.resultId for history in generated_histories}
    return sorted(
        generated_histories
        + [history for history in saved_histories if history.resultId not in generated_result_ids],
        key=lambda history: history.takenAt,
        reverse=True,
    )


def get_my_profile() -> MyPageProfile:
    profile = MyPageProfile.model_validate(_load_json("profile.json"))
    return profile.model_copy(update={"totalExamCount": len(list_my_results())})


listExams = list_exams
getExamById = get_exam_by_id
listQuestionsByExamId = list_questions_by_exam_id
createSession = create_session
getSession = get_session
saveSessionAnswer = save_session_answer
submitSession = submit_session
createAttempt = create_attempt
getAttempt = get_attempt
saveAttemptAnswerAudio = save_attempt_answer_audio
submitAttempt = submit_attempt
completeAttemptWithResult = complete_attempt_with_result
failAttempt = fail_attempt
getResult = get_result
listMyResults = list_my_results
