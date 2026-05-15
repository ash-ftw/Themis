from uuid import UUID

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.core.security import (
    AuthenticatedUser,
    AuthError,
    CognitoJwtAuthProvider,
    LocalDevAuthProvider,
    require_role,
)
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


def test_cognito_provider_requires_issuer_and_audience() -> None:
    provider = CognitoJwtAuthProvider(Settings(local_auth_enabled=False))

    with pytest.raises(AuthError, match="issuer and audience"):
        provider.verify("token")


def test_cognito_provider_derives_jwks_url_from_issuer() -> None:
    provider = CognitoJwtAuthProvider(
        Settings(
            auth_issuer="https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_example",
            auth_audience="client-id",
            local_auth_enabled=False,
        )
    )

    assert (
        provider._jwks_url()
        == "https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_example/.well-known/jwks.json"
    )


def test_cognito_provider_maps_custom_role_claim() -> None:
    provider = CognitoJwtAuthProvider(
        Settings(auth_issuer="https://issuer.example", auth_audience="client-id")
    )

    assert provider._role_from_claims({"custom:role": "lawyer"}) == UserRole.LAWYER


def test_cognito_provider_maps_groups_and_defaults_to_citizen() -> None:
    provider = CognitoJwtAuthProvider(
        Settings(auth_issuer="https://issuer.example", auth_audience="client-id")
    )

    assert provider._role_from_claims({"cognito:groups": ["admin"]}) == UserRole.ADMIN
    assert provider._role_from_claims({"cognito:groups": ["lawyer"]}) == UserRole.LAWYER
    assert provider._role_from_claims({}) == UserRole.CITIZEN
