from fastapi import APIRouter

from ditto_api.repositories.mock_repository import get_my_profile, list_my_results
from ditto_api.schemas.history import ExamHistoryItem, MyPageProfile

router = APIRouter()


@router.get("/profile", response_model=MyPageProfile)
def get_profile() -> MyPageProfile:
    return get_my_profile()


@router.get("/results", response_model=list[ExamHistoryItem])
def list_results() -> list[ExamHistoryItem]:
    return list_my_results()


@router.get("/histories", response_model=list[ExamHistoryItem])
def list_histories() -> list[ExamHistoryItem]:
    return list_my_results()
