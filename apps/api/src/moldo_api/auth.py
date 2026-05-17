from hmac import compare_digest

from fastapi import HTTPException, Request, status

from moldo_api.database import connect
from moldo_api.schemas.auth import AuthenticatedUser

SESSION_USER_ID_KEY = "user_id"


def _find_user_by_id(user_id: str) -> AuthenticatedUser | None:
    with connect() as connection:
        row = connection.execute(
            "SELECT id, email, name FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()

    if row is None:
        return None
    return AuthenticatedUser(id=row["id"], email=row["email"], name=row["name"])


def authenticate_user(email: str, password: str) -> AuthenticatedUser | None:
    normalized_email = email.strip().lower()

    with connect() as connection:
        row = connection.execute(
            "SELECT id, email, password, name FROM users WHERE lower(email) = ?",
            (normalized_email,),
        ).fetchone()

    if row is None or not compare_digest(row["password"], password):
        return None

    return AuthenticatedUser(id=row["id"], email=row["email"], name=row["name"])


def require_current_user(request: Request) -> AuthenticatedUser:
    user_id = request.session.get(SESSION_USER_ID_KEY)
    if not isinstance(user_id, str):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    user = _find_user_by_id(user_id)
    if user is None:
        request.session.clear()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    return user
