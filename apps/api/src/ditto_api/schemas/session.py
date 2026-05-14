from typing import Literal

from pydantic import BaseModel, ConfigDict


SessionStatus = Literal["in_progress", "submitted", "grading", "completed", "failed"]


class ApiDto(BaseModel):
    model_config = ConfigDict(extra="forbid")


class SessionAnswerMetadata(ApiDto):
    questionId: str
    questionOrder: int
    durationSeconds: int
    audioFileName: str | None = None
    mimeType: str | None = None
    recordedAt: str


class ExamSession(ApiDto):
    id: str
    examId: str
    status: SessionStatus
    resultId: str | None = None
    startedAt: str
    currentQuestionOrder: int
    answers: list[SessionAnswerMetadata]
    submittedAt: str | None = None
