from typing import Literal

from pydantic import BaseModel, ConfigDict


ScoreCategory = Literal[
    "relevance",
    "coherence",
    "grammar",
    "expression",
]


class ApiDto(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ScoreItem(ApiDto):
    category: ScoreCategory
    label: str
    score: int
    maxScore: int


class ResultAnswer(ApiDto):
    questionId: str
    questionOrder: int
    questionPrompt: str
    transcript: str
    modelAnswer: str
    scores: list[ScoreItem]
    audioUrl: str | None = None
    durationSeconds: int
    modelAnswerAudioUrl: str | None = None
    modelAnswerDurationSeconds: int | None = None
    strengths: list[str]
    improvements: list[str]


class ExamResult(ApiDto):
    id: str
    examId: str
    examTitle: str
    takenAt: str
    questionCount: int
    totalScore: int
    maxScore: int
    scores: list[ScoreItem]
    answers: list[ResultAnswer]
