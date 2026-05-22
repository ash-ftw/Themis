from socket import create_connection
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.engine import make_url
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.database import get_db
from app.schemas.health import HealthResponse, ReadinessCheck, ReadinessResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check(
    settings: Annotated[Settings, Depends(get_settings)],
) -> HealthResponse:
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
    )


@router.get("/health/ready", response_model=ReadinessResponse)
def readiness_check(
    db: Annotated[Session, Depends(get_db)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> ReadinessResponse:
    checks = {"database": database_readiness_check(db, settings)}
    ready = all(check.status == "ok" for check in checks.values())
    response = ReadinessResponse(
        status="ready" if ready else "not_ready",
        service=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
        checks=checks,
    )

    if not ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=response.model_dump(mode="json"),
        )

    return response


def database_readiness_check(db: Session, settings: Settings) -> ReadinessCheck:
    socket_error = database_socket_error(
        settings.database_url,
        timeout_seconds=settings.readiness_socket_timeout_seconds,
    )
    if socket_error is not None:
        return ReadinessCheck(status="failed", detail=socket_error)

    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError as exc:
        return ReadinessCheck(status="failed", detail=exc.__class__.__name__)

    return ReadinessCheck(status="ok")


def database_socket_error(database_url: str, *, timeout_seconds: float) -> str | None:
    url = make_url(database_url)
    if not url.drivername.startswith("postgresql"):
        return None
    if url.host is None:
        return "missing_database_host"

    try:
        with create_connection((url.host, url.port or 5432), timeout=timeout_seconds):
            return None
    except OSError as exc:
        return exc.__class__.__name__
