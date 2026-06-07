from pydantic import BaseModel, ConfigDict


class ApiDto(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ResultAnswer(ApiDto):
    questionId: str
    questionOrder: int
    questionPrompt: str
    transcript: str
    modelAnswer: str
    score: int
    maxScore: int
    audioUrl: str | None = None
    durationSeconds: int
    modelAnswerAudioUrl: str | None = None
    modelAnswerDurationSeconds: int | None = None
    improvements: list[str]


class ExamResult(ApiDto):
    id: str
    examId: str
    examTitle: str
    takenAt: str
    questionCount: int
    totalScore: int
    maxScore: int
    answers: list[ResultAnswer]
