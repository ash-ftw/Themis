from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.database import get_db
from app.core.security import AuthenticatedUser, AuthPrincipal, get_auth_principal, get_current_user
from app.models.enums import UserRole
from app.models.user import LawyerProfile, User, UserProfile
from app.schemas.auth import (
    AuthMeResponse,
    AuthSyncRequest,
    CitizenProfilePayload,
    LawyerProfilePayload,
    ProfileUpdateRequest,
    UserResponse,
)
from app.services.audit import record_audit_log

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me", response_model=AuthMeResponse, response_model_by_alias=False)
def read_current_user(
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> AuthMeResponse:
    user = db.get(User, current_user.id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    return _auth_response(user)


@router.post("/sync-profile", response_model=AuthMeResponse, response_model_by_alias=False)
def sync_profile(
    payload: AuthSyncRequest,
    principal: Annotated[AuthPrincipal, Depends(get_auth_principal)],
    db: Annotated[Session, Depends(get_db)],
    settings: Annotated[Settings, Depends(get_settings)],
    request: Request,
) -> AuthMeResponse:
    role = _role_for_principal(principal, settings)
    _validate_profile_payload(role, payload)

    user = db.scalar(select(User).where(User.external_auth_id == principal.external_auth_id))
    if user is None:
        user = User(
            external_auth_id=principal.external_auth_id,
            role=role,
            email=principal.email,
            phone=payload.phone or principal.phone,
            is_active=True,
            is_verified=role == UserRole.ADMIN,
            last_login_at=datetime.now(UTC),
        )
        db.add(user)
    else:
        user.role = role
        user.email = principal.email
        user.phone = payload.phone or principal.phone or user.phone
        user.is_verified = user.is_verified or role == UserRole.ADMIN
        user.last_login_at = datetime.now(UTC)

    if payload.citizen_profile is not None:
        _apply_citizen_profile(user, payload.citizen_profile)

    if payload.lawyer_profile is not None:
        _apply_lawyer_profile(user, payload.lawyer_profile)

    db.flush()
    record_audit_log(
        db,
        actor_id=user.id,
        action="auth.profile_synced",
        entity_type="user",
        entity_id=user.id,
        metadata={"role": role.value},
        request=request,
    )
    db.commit()
    db.refresh(user)

    return _auth_response(user)


@router.put("/profile", response_model=AuthMeResponse, response_model_by_alias=False)
def update_profile(
    payload: ProfileUpdateRequest,
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> AuthMeResponse:
    user = db.get(User, current_user.id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if current_user.role == UserRole.CITIZEN:
        if payload.citizen_profile is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Citizen profile payload is required.",
            )
        _apply_citizen_profile(user, payload.citizen_profile)
    elif current_user.role == UserRole.LAWYER:
        if payload.lawyer_profile is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lawyer profile payload is required.",
            )
        _apply_lawyer_profile(user, payload.lawyer_profile)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admins do not require a role-specific profile.",
        )

    db.flush()
    record_audit_log(
        db,
        actor_id=user.id,
        action="auth.profile_updated",
        entity_type="user",
        entity_id=user.id,
        metadata={"role": current_user.role.value},
        request=request,
    )
    db.commit()
    db.refresh(user)

    return _auth_response(user)


def _role_for_principal(principal: AuthPrincipal, settings: Settings) -> UserRole:
    admin_emails = {email.lower() for email in settings.admin_bootstrap_emails}
    if principal.email.lower() in admin_emails:
        return UserRole.ADMIN

    return principal.role


def _validate_profile_payload(role: UserRole, payload: AuthSyncRequest) -> None:
    if role == UserRole.CITIZEN and payload.lawyer_profile is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Citizen users cannot sync a lawyer profile.",
        )

    if role == UserRole.LAWYER and payload.citizen_profile is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lawyer users cannot sync a citizen profile.",
        )


def _apply_citizen_profile(user: User, payload: CitizenProfilePayload) -> None:
    data = payload.model_dump()
    metadata = data.pop("metadata")

    if user.profile is None:
        user.profile = UserProfile(**data, metadata_json=metadata)
        return

    for key, value in data.items():
        setattr(user.profile, key, value)
    user.profile.metadata_json = metadata


def _apply_lawyer_profile(user: User, payload: LawyerProfilePayload) -> None:
    data = payload.model_dump()

    if user.lawyer_profile is None:
        user.lawyer_profile = LawyerProfile(**data)
        return

    for key, value in data.items():
        setattr(user.lawyer_profile, key, value)


def _auth_response(user: User) -> AuthMeResponse:
    return AuthMeResponse(user=UserResponse.model_validate(user))
