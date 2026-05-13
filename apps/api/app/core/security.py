from collections.abc import Callable
from dataclasses import dataclass
from typing import Annotated, Protocol
from uuid import UUID

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.database import get_db
from app.models.enums import UserRole
from app.models.user import User


class AuthError(ValueError):
    pass


@dataclass(frozen=True)
class AuthPrincipal:
    external_auth_id: str
    email: str
    role: UserRole
    phone: str | None = None


@dataclass(frozen=True)
class AuthenticatedUser:
    id: UUID
    external_auth_id: str
    email: str
    role: UserRole
    is_active: bool
    is_verified: bool
    phone: str | None = None


class AuthProvider(Protocol):
    def verify(self, token: str) -> AuthPrincipal:
        pass


class LocalDevAuthProvider:
    shortcuts: dict[str, AuthPrincipal] = {
        "dev-citizen": AuthPrincipal(
            external_auth_id="local-citizen",
            email="citizen@themis.local",
            role=UserRole.CITIZEN,
        ),
        "dev-lawyer": AuthPrincipal(
            external_auth_id="local-lawyer",
            email="lawyer@themis.local",
            role=UserRole.LAWYER,
        ),
        "dev-admin": AuthPrincipal(
            external_auth_id="local-admin",
            email="admin@themis.local",
            role=UserRole.ADMIN,
        ),
    }

    def verify(self, token: str) -> AuthPrincipal:
        if token in self.shortcuts:
            return self.shortcuts[token]

        parts = token.split(":")
        if len(parts) not in {4, 5} or parts[0] != "dev":
            raise AuthError("Invalid local development token.")

        _, external_auth_id, email, role_value, *phone = parts
        if not external_auth_id or not email:
            raise AuthError("Local development token is missing identity fields.")

        try:
            role = UserRole(role_value)
        except ValueError as exc:
            raise AuthError("Local development token has an invalid role.") from exc

        return AuthPrincipal(
            external_auth_id=external_auth_id,
            email=email,
            role=role,
            phone=phone[0] if phone else None,
        )


class CognitoJwtAuthProvider:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def verify(self, token: str) -> AuthPrincipal:
        if not token:
            raise AuthError("Missing JWT.")

        raise AuthError("Cognito JWT validation is not configured for this environment.")


def _auth_exception(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def _extract_bearer_token(authorization: str | None) -> str:
    if authorization is None:
        raise _auth_exception("Missing bearer token.")

    scheme, separator, token = authorization.partition(" ")
    if separator != " " or scheme.lower() != "bearer" or not token.strip():
        raise _auth_exception("Invalid authorization header.")

    return token.strip()


def _provider_for_settings(settings: Settings) -> AuthProvider:
    if settings.local_auth_enabled:
        return LocalDevAuthProvider()

    return CognitoJwtAuthProvider(settings)


def get_auth_principal(
    settings: Annotated[Settings, Depends(get_settings)],
    authorization: Annotated[str | None, Header()] = None,
) -> AuthPrincipal:
    token = _extract_bearer_token(authorization)
    provider = _provider_for_settings(settings)

    try:
        return provider.verify(token)
    except AuthError as exc:
        raise _auth_exception(str(exc)) from exc


def get_current_user(
    principal: Annotated[AuthPrincipal, Depends(get_auth_principal)],
    db: Annotated[Session, Depends(get_db)],
) -> AuthenticatedUser:
    user = db.scalar(select(User).where(User.external_auth_id == principal.external_auth_id))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Authenticated user has not been synced.",
        )

    authenticated_user = AuthenticatedUser(
        id=user.id,
        external_auth_id=user.external_auth_id,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,
        phone=user.phone,
    )
    require_role(authenticated_user, set(UserRole))
    return authenticated_user


def require_role(user: AuthenticatedUser, allowed_roles: set[UserRole]) -> None:
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive users cannot access protected resources.",
        )

    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User role is not allowed to access this resource.",
        )


def require_roles(*allowed_roles: UserRole) -> Callable[..., AuthenticatedUser]:
    allowed = set(allowed_roles)

    def dependency(
        user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    ) -> AuthenticatedUser:
        require_role(user, allowed)
        return user

    return dependency
