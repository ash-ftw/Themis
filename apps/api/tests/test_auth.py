from uuid import UUID

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.core.security import AuthenticatedUser, LocalDevAuthProvider, require_role
from app.main import app
from app.models.enums import UserRole


def test_auth_me_rejects_missing_token() -> None:
    client = TestClient(app)

    response = client.get("/api/v1/auth/me")

    assert response.status_code == 401


def test_auth_me_rejects_invalid_token() -> None:
    client = TestClient(app)

    response = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer bad-token"})

    assert response.status_code == 401


def test_local_dev_auth_provider_supports_shortcuts() -> None:
    principal = LocalDevAuthProvider().verify("dev-lawyer")

    assert principal.external_auth_id == "local-lawyer"
    assert principal.email == "lawyer@themis.local"
    assert principal.role == UserRole.LAWYER


def test_local_dev_auth_provider_supports_explicit_identity() -> None:
    principal = LocalDevAuthProvider().verify(
        "dev:external-123:person@example.test:citizen:+919999999999"
    )

    assert principal.external_auth_id == "external-123"
    assert principal.email == "person@example.test"
    assert principal.role == UserRole.CITIZEN
    assert principal.phone == "+919999999999"


def test_role_guard_blocks_inactive_users() -> None:
    user = AuthenticatedUser(
        id=UUID("00000000-0000-0000-0000-000000000001"),
        external_auth_id="external-123",
        email="person@example.test",
        role=UserRole.CITIZEN,
        is_active=False,
        is_verified=False,
    )

    with pytest.raises(HTTPException) as exc_info:
        require_role(user, {UserRole.CITIZEN})

    assert exc_info.value.status_code == 403
