from typing import Literal

from pydantic import BaseModel, ConfigDict


ExamDifficulty = Literal["easy", "medium", "hard"]
ExamMode = Literal["mock"]
ExamIconName = Literal["document", "message", "target"]
QuestionType = Literal[
    "self_intro",
    "personal_prompt",
    "role_play",
    "past_experience",
    "comparison",
    "problem_solving",
]


class ApiDto(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ExamSummary(ApiDto):
    id: str
    title: str
    tag: str
    questionCount: int
    estimatedMinutes: int
    difficulty: ExamDifficulty
    mode: ExamMode
    icon: ExamIconName
    description: str | None = None


class ExamQuestion(ApiDto):
    id: str
    examId: str
    order: int
    type: QuestionType
    ttsScriptEn: str
    prepSeconds: int
    answerSeconds: int
