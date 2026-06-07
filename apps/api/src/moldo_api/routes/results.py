from fastapi import APIRouter, Depends, HTTPException

from moldo_api.auth import require_current_user
from moldo_api.repositories.mock_repository import get_result as repo_get_result
from moldo_api.schemas.auth import AuthenticatedUser
from moldo_api.schemas.result import ExamResult

router = APIRouter()


@router.get("/{resultId}", response_model=ExamResult)
def get_result(
    resultId: str,
    user: AuthenticatedUser = Depends(require_current_user),
) -> ExamResult:
    result = repo_get_result(resultId, user.id)
    if result is None:
        raise HTTPException(status_code=404, detail="Result not found")
    return result
