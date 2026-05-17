from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict

from moldo_api.repositories.mock_repository import (
    create_session,
    get_session,
    save_session_answer,
    submit_session,
)
from moldo_api.schemas.session import ExamSession

router = APIRouter()


class CreateSessionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    examId: str


class SaveSessionAnswerRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    questionId: str
    questionOrder: int
    durationSeconds: int
    audioFileName: str | None = None
    mimeType: str | None = None


@router.post("", response_model=ExamSession, status_code=201)
def create_exam_session(request: CreateSessionRequest) -> ExamSession:
    session = create_session(request.examId)
    if session is None:
        raise HTTPException(status_code=404, detail="Exam not found")
    return session


@router.get("/{sessionId}", response_model=ExamSession)
def get_exam_session(sessionId: str) -> ExamSession:
    session = get_session(sessionId)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("/{sessionId}/answers", response_model=ExamSession)
def save_exam_session_answer(sessionId: str, request: SaveSessionAnswerRequest) -> ExamSession:
    session = save_session_answer(
        sessionId,
        question_id=request.questionId,
        question_order=request.questionOrder,
        duration_seconds=request.durationSeconds,
        audio_file_name=request.audioFileName,
        mime_type=request.mimeType,
    )
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("/{sessionId}/submit", response_model=ExamSession)
def submit_exam_session(sessionId: str) -> ExamSession:
    session = submit_session(sessionId)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
