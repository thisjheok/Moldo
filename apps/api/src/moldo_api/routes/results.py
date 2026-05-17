from fastapi import APIRouter, HTTPException

from moldo_api.repositories.mock_repository import get_result as repo_get_result
from moldo_api.schemas.result import ExamResult

router = APIRouter()


@router.get("/{resultId}", response_model=ExamResult)
def get_result(resultId: str) -> ExamResult:
    result = repo_get_result(resultId)
    if result is None:
        raise HTTPException(status_code=404, detail="Result not found")
    return result
