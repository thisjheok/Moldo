from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, ConfigDict

from moldo_api.auth import require_current_user
from moldo_api.queues.grading_queue import enqueue_grading_job
from moldo_api.repositories.mock_repository import (
    create_attempt,
    get_attempt,
    save_attempt_answer_audio,
    submit_attempt,
)
from moldo_api.schemas.auth import AuthenticatedUser
from moldo_api.schemas.attempt import ExamAttempt

router = APIRouter()
MAX_GRADABLE_ANSWER_SECONDS = 120


class CreateAttemptRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    examId: str


@router.post("", response_model=ExamAttempt, status_code=201)
def create_exam_attempt(
    request: CreateAttemptRequest,
    user: AuthenticatedUser = Depends(require_current_user),
) -> ExamAttempt:
    attempt = create_attempt(request.examId, user.id)
    if attempt is None:
        raise HTTPException(status_code=404, detail="Exam not found")
    return attempt


@router.get("/{attemptId}", response_model=ExamAttempt)
def get_exam_attempt(
    attemptId: str,
    user: AuthenticatedUser = Depends(require_current_user),
) -> ExamAttempt:
    attempt = get_attempt(attemptId, user.id)
    if attempt is None:
        raise HTTPException(status_code=404, detail="Attempt not found")
    return attempt


@router.post("/{attemptId}/answers/{questionId}/audio", response_model=ExamAttempt)
async def upload_attempt_answer_audio(
    attemptId: str,
    questionId: str,
    request: Request,
    user: AuthenticatedUser = Depends(require_current_user),
    questionOrder: int = Query(..., gt=0),
    durationSeconds: int = Query(..., ge=0),
    audioFileName: str | None = Query(default=None),
) -> ExamAttempt:
    content = await request.body()
    if not content:
        raise HTTPException(status_code=400, detail="Audio file is required")

    attempt = save_attempt_answer_audio(
        attemptId,
        user_id=user.id,
        question_id=questionId,
        question_order=questionOrder,
        duration_seconds=min(durationSeconds, MAX_GRADABLE_ANSWER_SECONDS),
        content=content,
        mime_type=request.headers.get("content-type"),
        audio_file_name=audioFileName,
    )
    if attempt is None:
        raise HTTPException(status_code=404, detail="Attempt not found")
    return attempt


@router.post("/{attemptId}/submit", response_model=ExamAttempt)
def submit_exam_attempt(
    attemptId: str,
    user: AuthenticatedUser = Depends(require_current_user),
) -> ExamAttempt:
    attempt = submit_attempt(attemptId, user.id)
    if attempt is None:
        raise HTTPException(status_code=404, detail="Attempt not found")
    enqueue_grading_job(attemptId)
    return attempt
