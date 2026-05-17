from fastapi import APIRouter, HTTPException

from moldo_api.repositories.mock_repository import (
    get_exam_by_id as repo_get_exam_by_id,
    list_exams as repo_list_exams,
    list_questions_by_exam_id as repo_list_questions_by_exam_id,
)
from moldo_api.schemas.exam import ExamQuestion, ExamSummary

router = APIRouter()


@router.get("", response_model=list[ExamSummary])
def list_exams() -> list[ExamSummary]:
    return repo_list_exams()


@router.get("/{examId}", response_model=ExamSummary)
def get_exam(examId: str) -> ExamSummary:
    exam = repo_get_exam_by_id(examId)
    if exam is None:
        raise HTTPException(status_code=404, detail="Exam not found")
    return exam


@router.get("/{examId}/questions", response_model=list[ExamQuestion])
def list_exam_questions(examId: str) -> list[ExamQuestion]:
    if repo_get_exam_by_id(examId) is None:
        raise HTTPException(status_code=404, detail="Exam not found")
    return repo_list_questions_by_exam_id(examId)
