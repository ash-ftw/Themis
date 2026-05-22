from fastapi.testclient import TestClient
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import Settings, get_settings
from app.core.database import get_db
from app.main import app


def test_health_check() -> None:
    client = TestClient(app)

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_readiness_check_reports_database_ok() -> None:
    client = TestClient(app)
    app.dependency_overrides[get_db] = _fake_db
    app.dependency_overrides[get_settings] = _sqlite_settings

    try:
        response = client.get("/api/v1/health/ready")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["status"] == "ready"
    assert response.json()["checks"]["database"]["status"] == "ok"


def test_readiness_check_reports_database_failure() -> None:
    client = TestClient(app)
    app.dependency_overrides[get_db] = _failing_db
    app.dependency_overrides[get_settings] = _sqlite_settings

    try:
        response = client.get("/api/v1/health/ready")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 503
    assert response.json()["detail"]["status"] == "not_ready"
    assert response.json()["detail"]["checks"]["database"]["status"] == "failed"


class FakeSession:
    def execute(self, statement: object) -> None:
        self.statement = statement


class FailingSession:
    def execute(self, statement: object) -> None:
        raise SQLAlchemyError("database unavailable")


def _fake_db() -> FakeSession:
    return FakeSession()


def _failing_db() -> FailingSession:
    return FailingSession()


def _sqlite_settings() -> Settings:
    return Settings(database_url="sqlite://")
