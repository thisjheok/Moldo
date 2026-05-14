from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ditto_api.routes import exams, health, histories, results, sessions


def create_app() -> FastAPI:
    app = FastAPI(
        title="Ditto API",
        version="0.1.0",
        description="API for Ditto speaking practice sessions and evaluation results.",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(health.router)
    app.include_router(exams.router, prefix="/exams", tags=["exams"])
    app.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
    app.include_router(results.router, prefix="/results", tags=["results"])
    app.include_router(histories.router, prefix="/me", tags=["me"])
    return app


app = create_app()
