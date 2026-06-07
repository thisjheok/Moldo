from sqlite3 import IntegrityError
from uuid import uuid4

from fastapi import HTTPException, Request, status

from moldo_api.database import connect
from moldo_api.password_hashing import hash_password, is_password_hash, verify_password
from moldo_api.schemas.auth import AuthenticatedUser

SESSION_USER_ID_KEY = "user_id"


def _find_user_by_id(user_id: str) -> AuthenticatedUser | None:
    with connect() as connection:
        row = connection.execute(
            "SELECT id, username, email, name FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()

    if row is None:
        return None
    return AuthenticatedUser(
        id=row["id"],
        username=row["username"],
        email=row["email"],
        name=row["name"],
    )


def authenticate_user(username: str, password: str) -> AuthenticatedUser | None:
    normalized_username = username.strip().lower()

    with connect() as connection:
        row = connection.execute(
            """
            SELECT id, username, email, password, name
            FROM users
            WHERE lower(username) = ?
            """,
            (normalized_username,),
        ).fetchone()

        if row is None:
            return None

        stored_password = row["password"]
        if is_password_hash(stored_password):
            is_valid_password = verify_password(password, stored_password)
        else:
            is_valid_password = stored_password == password
            if is_valid_password:
                connection.execute(
                    "UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    (hash_password(password), row["id"]),
                )

    if not is_valid_password:
        return None

    return AuthenticatedUser(
        id=row["id"],
        username=row["username"],
        email=row["email"],
        name=row["name"],
    )


def create_user(username: str, email: str, password: str, name: str) -> AuthenticatedUser:
    normalized_username = username.strip()
    normalized_email = email.strip().lower()
    normalized_name = name.strip()
    user_id = f"user-{uuid4()}"

    try:
        with connect() as connection:
            connection.execute(
                """
                INSERT INTO users (id, username, email, password, name)
                VALUES (?, ?, ?, ?, ?)
                """,
                (user_id, normalized_username, normalized_email, hash_password(password), normalized_name),
            )
    except IntegrityError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email already exists",
        ) from exc

    return AuthenticatedUser(
        id=user_id,
        username=normalized_username,
        email=normalized_email,
        name=normalized_name,
    )


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
