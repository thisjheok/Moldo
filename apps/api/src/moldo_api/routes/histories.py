from fastapi import APIRouter, Depends

from moldo_api.auth import require_current_user
from moldo_api.repositories.mock_repository import get_my_profile, list_my_results
from moldo_api.schemas.auth import AuthenticatedUser
from moldo_api.schemas.history import ExamHistoryItem, MyPageProfile

router = APIRouter()


@router.get("/profile", response_model=MyPageProfile)
def get_profile(user: AuthenticatedUser = Depends(require_current_user)) -> MyPageProfile:
    return get_my_profile(user.id, username=user.username, email=user.email, name=user.name)


@router.get("/results", response_model=list[ExamHistoryItem])
def list_results(user: AuthenticatedUser = Depends(require_current_user)) -> list[ExamHistoryItem]:
    return list_my_results(user.id)


@router.get("/histories", response_model=list[ExamHistoryItem])
def list_histories(user: AuthenticatedUser = Depends(require_current_user)) -> list[ExamHistoryItem]:
    return list_my_results(user.id)
