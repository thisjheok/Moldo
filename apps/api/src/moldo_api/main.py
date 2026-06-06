from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

from moldo_api.auth import require_current_user
from moldo_api.config import get_auth_settings, get_cors_settings
from moldo_api.data.audio_storage import DEFAULT_AUDIO_STORAGE
from moldo_api.database import initialize_database
from moldo_api.routes import attempts, auth, exams, health, histories, results, sessions


def create_app() -> FastAPI:
    auth_settings = get_auth_settings()
    cors_settings = get_cors_settings()
    initialize_database()
    app = FastAPI(
        title="Moldo API",
        version="0.1.0",
        description="API for Moldo speaking practice sessions and evaluation results.",
    )
    app.add_middleware(
        SessionMiddleware,
        secret_key=auth_settings.session_secret,
        session_cookie=auth_settings.session_cookie,
        max_age=auth_settings.session_max_age_seconds,
        same_site=auth_settings.session_same_site,
        https_only=auth_settings.session_https_only,
        domain=auth_settings.session_domain,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_settings.origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(health.router)
    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(exams.router, prefix="/exams", tags=["exams"])
    app.include_router(
        attempts.router,
        prefix="/attempts",
        tags=["attempts"],
        dependencies=[Depends(require_current_user)],
    )
    app.include_router(
        sessions.router,
        prefix="/sessions",
        tags=["sessions"],
        dependencies=[Depends(require_current_user)],
    )
    app.include_router(
        results.router,
        prefix="/results",
        tags=["results"],
        dependencies=[Depends(require_current_user)],
    )
    app.include_router(
        histories.router,
        prefix="/me",
        tags=["me"],
        dependencies=[Depends(require_current_user)],
    )
    DEFAULT_AUDIO_STORAGE.root_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=DEFAULT_AUDIO_STORAGE.root_dir), name="uploads")
    return app


app = create_app()
