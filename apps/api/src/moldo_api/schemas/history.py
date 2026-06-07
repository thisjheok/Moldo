from pydantic import BaseModel, ConfigDict


class ApiDto(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ExamHistoryItem(ApiDto):
    id: str
    resultId: str
    examId: str
    examTitle: str
    takenAt: str
    questionCount: int
    totalScore: int
    maxScore: int
    durationSeconds: int


class MyPageProfile(ApiDto):
    id: str
    username: str
    email: str
    name: str
    totalExamCount: int
