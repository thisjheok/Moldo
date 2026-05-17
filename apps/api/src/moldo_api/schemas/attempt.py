from typing import Literal

from pydantic import BaseModel, ConfigDict


AttemptStatus = Literal["in_progress", "submitted", "grading", "completed", "failed"]


class ApiDto(BaseModel):
    model_config = ConfigDict(extra="forbid")


class AttemptAnswerMetadata(ApiDto):
    questionId: str
    questionOrder: int
    durationSeconds: int
    audioFileName: str | None = None
    mimeType: str | None = None
    audioStorageKey: str | None = None
    audioUrl: str | None = None
    uploadedAt: str | None = None
    recordedAt: str


class ExamAttempt(ApiDto):
    id: str
    examId: str
    status: AttemptStatus
    resultId: str | None = None
    startedAt: str
    currentQuestionOrder: int
    answers: list[AttemptAnswerMetadata]
    submittedAt: str | None = None
