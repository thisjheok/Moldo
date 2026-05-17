from functools import lru_cache
import json
import os
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


REPO_ROOT = Path(__file__).resolve().parents[4]


class OpenAISettings(BaseModel):
    api_key: str | None
    stt_model: str
    evaluation_model: str


class AuthUserSettings(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    email: str
    password: str
    name: str


class AuthSettings(BaseModel):
    session_secret: str
    session_cookie: str
    session_max_age_seconds: int
    session_same_site: Literal["lax", "strict", "none"]
    session_https_only: bool
    session_domain: str | None
    users: list[AuthUserSettings] = Field(default_factory=list)


class DatabaseSettings(BaseModel):
    path: Path


def load_local_env() -> None:
    env_path = REPO_ROOT / ".env"
    if not env_path.exists():
        return

    for line in env_path.read_text(encoding="utf-8").splitlines():
        stripped_line = line.strip()
        if not stripped_line or stripped_line.startswith("#") or "=" not in stripped_line:
            continue

        key, value = stripped_line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def _load_auth_users() -> list[AuthUserSettings]:
    raw_users = os.getenv("MOLDO_AUTH_USERS")
    if raw_users:
        parsed_users = json.loads(raw_users)
        if not isinstance(parsed_users, list):
            raise ValueError("MOLDO_AUTH_USERS must be a JSON array.")
        return [AuthUserSettings.model_validate(user) for user in parsed_users]

    return [
        AuthUserSettings(
            id=os.getenv("MOLDO_DEFAULT_USER_ID", "user-1"),
            email=os.getenv("MOLDO_DEFAULT_USER_EMAIL", "hong@example.com"),
            password=os.getenv("MOLDO_DEFAULT_USER_PASSWORD", "password"),
            name=os.getenv("MOLDO_DEFAULT_USER_NAME", "홍길동"),
        )
    ]


def _get_session_same_site() -> Literal["lax", "strict", "none"]:
    raw_value = os.getenv("MOLDO_SESSION_SAME_SITE", "lax").lower()
    if raw_value == "lax":
        return "lax"
    if raw_value == "strict":
        return "strict"
    if raw_value == "none":
        return "none"
    raise ValueError("MOLDO_SESSION_SAME_SITE must be one of: lax, strict, none.")


@lru_cache
def get_openai_settings() -> OpenAISettings:
    load_local_env()
    return OpenAISettings(
        api_key=os.getenv("OPENAI_API_KEY"),
        stt_model=os.getenv("OPENAI_STT_MODEL", "gpt-4o-mini-transcribe"),
        evaluation_model=os.getenv("OPENAI_EVALUATION_MODEL", "gpt-4.1-mini"),
    )


@lru_cache
def get_auth_settings() -> AuthSettings:
    load_local_env()
    session_secret = os.getenv("MOLDO_SESSION_SECRET")
    if os.getenv("MOLDO_ENV") == "production" and not session_secret:
        raise ValueError("MOLDO_SESSION_SECRET is required when MOLDO_ENV=production.")

    return AuthSettings(
        session_secret=session_secret or "dev-only-moldo-session-secret",
        session_cookie=os.getenv("MOLDO_SESSION_COOKIE", "moldo_session"),
        session_max_age_seconds=int(os.getenv("MOLDO_SESSION_MAX_AGE_SECONDS", "1209600")),
        session_same_site=_get_session_same_site(),
        session_https_only=os.getenv("MOLDO_SESSION_HTTPS_ONLY", "false").lower() == "true",
        session_domain=os.getenv("MOLDO_SESSION_DOMAIN") or None,
        users=_load_auth_users(),
    )


@lru_cache
def get_database_settings() -> DatabaseSettings:
    load_local_env()
    database_path = os.getenv("MOLDO_DATABASE_PATH")
    resolved_path = (
        Path(database_path)
        if database_path
        else REPO_ROOT / "apps" / "api" / ".data" / "moldo.sqlite3"
    )
    if not resolved_path.is_absolute():
        resolved_path = REPO_ROOT / resolved_path
    return DatabaseSettings(
        path=resolved_path,
    )
