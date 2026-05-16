from datetime import UTC, datetime, timedelta
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.api.v1.cases import get_owned_case
from app.core.database import get_db
from app.core.security import AuthenticatedUser, require_roles
from app.models.case import Case
from app.models.enums import (
    CaseStatus,
    MatchRequestStatus,
    NotificationChannel,
    NotificationStatus,
    UserRole,
    VerificationStatus,
)
from app.models.legal_aid import MatchRequest
from app.models.notification import Notification
from app.models.user import LawyerProfile, User
from app.schemas.legal_aid import (
    LawyerProfileDetailResponse,
    LawyerProfileUpsertRequest,
    LawyerSuggestionListResponse,
    LawyerSuggestionResponse,
    LawyerVerificationDecisionRequest,
    LawyerVerificationQueueResponse,
    MatchRequestCreate,
    MatchRequestListResponse,
    MatchRequestResponse,
)
from app.services.audit import record_audit_log
from app.services.timeline import add_case_timeline_event
from app.tasks.notifications import deliver_notification

lawyer_router = APIRouter(prefix="/lawyers", tags=["lawyer profile"])
admin_router = APIRouter(prefix="/admin/lawyers", tags=["admin lawyer verification"])
legal_aid_router = APIRouter(prefix="/legal-aid", tags=["legal aid"])


@lawyer_router.get(
    "/profile",
    response_model=LawyerProfileDetailResponse,
    response_model_by_alias=False,
)
def get_lawyer_profile(
    lawyer: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.LAWYER))],
    db: Annotated[Session, Depends(get_db)],
) -> LawyerProfileDetailResponse:
    user = _get_user(db, lawyer.id)
    profile = _get_lawyer_profile_or_404(user)
    return lawyer_profile_response(user, profile)


@lawyer_router.put(
    "/profile",
    response_model=LawyerProfileDetailResponse,
    response_model_by_alias=False,
)
def upsert_lawyer_profile(
    payload: LawyerProfileUpsertRequest,
    lawyer: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.LAWYER))],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> LawyerProfileDetailResponse:
    user = _get_user(db, lawyer.id)
    if user.lawyer_profile is None:
        user.lawyer_profile = LawyerProfile(
            user_id=user.id,
            **payload.model_dump(),
            verification_status=VerificationStatus.PENDING,
        )
    else:
        for key, value in payload.model_dump().items():
            setattr(user.lawyer_profile, key, value)
        if user.lawyer_profile.verification_status != VerificationStatus.APPROVED:
            user.lawyer_profile.verification_status = VerificationStatus.PENDING

    user.is_verified = user.lawyer_profile.verification_status == VerificationStatus.APPROVED
    db.flush()
    record_audit_log(
        db,
        actor_id=lawyer.id,
        action="lawyer.profile_upserted",
        entity_type="lawyer_profile",
        entity_id=user.lawyer_profile.id,
        metadata={"verification_status": user.lawyer_profile.verification_status.value},
        request=request,
    )
    db.commit()
    db.refresh(user)
    profile = _get_lawyer_profile_or_404(user)
    return lawyer_profile_response(user, profile)


@lawyer_router.get(
    "/legal-aid-requests",
    response_model=MatchRequestListResponse,
    response_model_by_alias=False,
)
def list_lawyer_legal_aid_requests(
    lawyer: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.LAWYER))],
    db: Annotated[Session, Depends(get_db)],
) -> MatchRequestListResponse:
    requests = db.scalars(
        select(MatchRequest)
        .where(MatchRequest.lawyer_id == lawyer.id)
        .order_by(desc(MatchRequest.requested_at))
    ).all()
    return MatchRequestListResponse(
        total=len(requests),
        requests=[match_request_response(db, match_request) for match_request in requests],
    )


@lawyer_router.post(
    "/legal-aid-requests/{request_id}/accept",
    response_model=MatchRequestResponse,
    response_model_by_alias=False,
)
def accept_legal_aid_request(
    request_id: UUID,
    lawyer: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.LAWYER))],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> MatchRequestResponse:
    user = _get_user(db, lawyer.id)
    profile = _get_lawyer_profile_or_404(user)
    if profile.verification_status != VerificationStatus.APPROVED or not user.is_verified:
        raise HTTPException(status_code=403, detail="Only verified lawyers can accept requests.")

    match_request = _get_lawyer_match_request(db, request_id, lawyer.id)
    _require_pending(match_request)
    case = db.get(Case, match_request.case_id)
    if case is None:
        raise HTTPException(status_code=404, detail="Case not found.")

    now = datetime.now(UTC)
    match_request.status = MatchRequestStatus.ACCEPTED
    match_request.responded_at = now
    case.lawyer_id = lawyer.id
    case.status = CaseStatus.LAWYER_ASSIGNED
    profile.active_case_count += 1
    add_case_timeline_event(
        db,
        case_id=case.id,
        actor_id=lawyer.id,
        event_type="legal_aid.accepted",
        title="Legal aid request accepted",
        metadata={"match_request_id": str(match_request.id), "lawyer_id": str(lawyer.id)},
    )
    _create_notification(
        db,
        user_id=case.citizen_id,
        notification_type="legal_aid.accepted",
        title="Legal aid request accepted",
        message="A lawyer accepted your legal aid request.",
        idempotency_key=f"legal-aid:{match_request.id}:accepted",
        metadata={"case_id": str(case.id), "match_request_id": str(match_request.id)},
    )
    record_audit_log(
        db,
        actor_id=lawyer.id,
        action="legal_aid.accepted",
        entity_type="match_request",
        entity_id=match_request.id,
        metadata={"case_id": str(case.id)},
        request=request,
    )
    db.commit()
    db.refresh(match_request)
    return match_request_response(db, match_request)


@lawyer_router.post(
    "/legal-aid-requests/{request_id}/decline",
    response_model=MatchRequestResponse,
    response_model_by_alias=False,
)
def decline_legal_aid_request(
    request_id: UUID,
    lawyer: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.LAWYER))],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> MatchRequestResponse:
    match_request = _get_lawyer_match_request(db, request_id, lawyer.id)
    _require_pending(match_request)
    match_request.status = MatchRequestStatus.DECLINED
    match_request.responded_at = datetime.now(UTC)
    case = db.get(Case, match_request.case_id)
    if case is not None:
        add_case_timeline_event(
            db,
            case_id=case.id,
            actor_id=lawyer.id,
            event_type="legal_aid.declined",
            title="Legal aid request declined",
            metadata={"match_request_id": str(match_request.id)},
        )
        _create_notification(
            db,
            user_id=case.citizen_id,
            notification_type="legal_aid.declined",
            title="Legal aid request declined",
            message="A lawyer declined your legal aid request.",
            idempotency_key=f"legal-aid:{match_request.id}:declined",
            metadata={"case_id": str(case.id), "match_request_id": str(match_request.id)},
        )
    record_audit_log(
        db,
        actor_id=lawyer.id,
        action="legal_aid.declined",
        entity_type="match_request",
        entity_id=match_request.id,
        metadata={},
        request=request,
    )
    db.commit()
    db.refresh(match_request)
    return match_request_response(db, match_request)


@admin_router.get(
    "/verifications",
    response_model=LawyerVerificationQueueResponse,
    response_model_by_alias=False,
)
def list_lawyer_verifications(
    admin: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
    verification_status: VerificationStatus = VerificationStatus.PENDING,
) -> LawyerVerificationQueueResponse:
    rows = db.execute(
        select(User, LawyerProfile)
        .join(LawyerProfile, LawyerProfile.user_id == User.id)
        .where(
            User.role == UserRole.LAWYER,
            LawyerProfile.verification_status == verification_status,
        )
        .order_by(User.created_at)
    ).all()
    return LawyerVerificationQueueResponse(
        total=len(rows),
        lawyers=[lawyer_profile_response(user, profile) for user, profile in rows],
    )


@admin_router.post(
    "/{lawyer_id}/approve",
    response_model=LawyerProfileDetailResponse,
    response_model_by_alias=False,
)
def approve_lawyer(
    lawyer_id: UUID,
    payload: LawyerVerificationDecisionRequest,
    admin: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> LawyerProfileDetailResponse:
    user, profile = _get_lawyer_user_and_profile(db, lawyer_id)
    profile.verification_status = VerificationStatus.APPROVED
    profile.verification_notes = payload.notes
    user.is_verified = True
    record_audit_log(
        db,
        actor_id=admin.id,
        action="lawyer.verification.approved",
        entity_type="lawyer_profile",
        entity_id=profile.id,
        metadata={"lawyer_id": str(lawyer_id)},
        request=request,
    )
    _create_notification(
        db,
        user_id=lawyer_id,
        notification_type="lawyer.verification.approved",
        title="Lawyer profile approved",
        message="Your lawyer profile has been approved for legal aid requests.",
        idempotency_key=f"lawyer:{lawyer_id}:approved",
        metadata={},
    )
    db.commit()
    db.refresh(user)
    return lawyer_profile_response(user, _get_lawyer_profile_or_404(user))


@admin_router.post(
    "/{lawyer_id}/reject",
    response_model=LawyerProfileDetailResponse,
    response_model_by_alias=False,
)
def reject_lawyer(
    lawyer_id: UUID,
    payload: LawyerVerificationDecisionRequest,
    admin: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> LawyerProfileDetailResponse:
    user, profile = _get_lawyer_user_and_profile(db, lawyer_id)
    profile.verification_status = VerificationStatus.REJECTED
    profile.verification_notes = payload.notes
    user.is_verified = False
    record_audit_log(
        db,
        actor_id=admin.id,
        action="lawyer.verification.rejected",
        entity_type="lawyer_profile",
        entity_id=profile.id,
        metadata={"lawyer_id": str(lawyer_id), "notes": payload.notes},
        request=request,
    )
    _create_notification(
        db,
        user_id=lawyer_id,
        notification_type="lawyer.verification.rejected",
        title="Lawyer profile needs attention",
        message=payload.notes or "Your lawyer profile was rejected. Please update your profile.",
        idempotency_key=f"lawyer:{lawyer_id}:rejected",
        metadata={},
    )
    db.commit()
    db.refresh(user)
    return lawyer_profile_response(user, _get_lawyer_profile_or_404(user))


@legal_aid_router.get(
    "/cases/{case_id}/suggestions",
    response_model=LawyerSuggestionListResponse,
    response_model_by_alias=False,
)
def suggest_lawyers_for_case(
    case_id: UUID,
    citizen: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.CITIZEN))],
    db: Annotated[Session, Depends(get_db)],
) -> LawyerSuggestionListResponse:
    case = get_owned_case(db, case_id, citizen.id)
    suggestions = score_verified_lawyers(db, case)
    return LawyerSuggestionListResponse(case_id=case.id, suggestions=suggestions)


@legal_aid_router.post(
    "/cases/{case_id}/requests",
    response_model=MatchRequestResponse,
    response_model_by_alias=False,
    status_code=status.HTTP_201_CREATED,
)
def create_legal_aid_request(
    case_id: UUID,
    payload: MatchRequestCreate,
    citizen: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.CITIZEN))],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> MatchRequestResponse:
    case = get_owned_case(db, case_id, citizen.id)
    lawyer_user, lawyer_profile = _get_lawyer_user_and_profile(db, payload.lawyer_id)
    if (
        lawyer_profile.verification_status != VerificationStatus.APPROVED
        or not lawyer_user.is_verified
    ):
        raise HTTPException(status_code=400, detail="Lawyer is not verified for legal aid.")

    existing = db.scalar(
        select(MatchRequest).where(
            MatchRequest.case_id == case.id,
            MatchRequest.lawyer_id == payload.lawyer_id,
            MatchRequest.status == MatchRequestStatus.PENDING,
        )
    )
    if existing is not None:
        return match_request_response(db, existing)

    score, score_breakdown = score_lawyer_for_case(case, lawyer_profile)
    now = datetime.now(UTC)
    match_request = MatchRequest(
        case_id=case.id,
        citizen_id=citizen.id,
        lawyer_id=payload.lawyer_id,
        score=score,
        score_breakdown=score_breakdown,
        status=MatchRequestStatus.PENDING,
        message=payload.message,
        requested_at=now,
        expires_at=now + timedelta(days=7),
    )
    case.status = CaseStatus.LEGAL_AID_REQUESTED
    db.add(match_request)
    db.flush()
    add_case_timeline_event(
        db,
        case_id=case.id,
        actor_id=citizen.id,
        event_type="legal_aid.requested",
        title="Legal aid requested",
        metadata={"match_request_id": str(match_request.id), "lawyer_id": str(payload.lawyer_id)},
    )
    _create_notification(
        db,
        user_id=payload.lawyer_id,
        notification_type="legal_aid.requested",
        title="New legal aid request",
        message=f"A citizen requested legal aid for {case.title}.",
        idempotency_key=f"legal-aid:{match_request.id}:requested",
        metadata={"case_id": str(case.id), "match_request_id": str(match_request.id)},
    )
    record_audit_log(
        db,
        actor_id=citizen.id,
        action="legal_aid.requested",
        entity_type="match_request",
        entity_id=match_request.id,
        metadata={"case_id": str(case.id), "lawyer_id": str(payload.lawyer_id)},
        request=request,
    )
    db.commit()
    db.refresh(match_request)
    return match_request_response(db, match_request)


@legal_aid_router.get(
    "/requests",
    response_model=MatchRequestListResponse,
    response_model_by_alias=False,
)
def list_citizen_legal_aid_requests(
    citizen: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.CITIZEN))],
    db: Annotated[Session, Depends(get_db)],
) -> MatchRequestListResponse:
    requests = db.scalars(
        select(MatchRequest)
        .where(MatchRequest.citizen_id == citizen.id)
        .order_by(desc(MatchRequest.requested_at))
    ).all()
    return MatchRequestListResponse(
        total=len(requests),
        requests=[match_request_response(db, match_request) for match_request in requests],
    )


@legal_aid_router.post(
    "/requests/{request_id}/cancel",
    response_model=MatchRequestResponse,
    response_model_by_alias=False,
)
def cancel_legal_aid_request(
    request_id: UUID,
    citizen: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.CITIZEN))],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> MatchRequestResponse:
    match_request = _get_citizen_match_request(db, request_id, citizen.id)
    _require_pending(match_request)
    match_request.status = MatchRequestStatus.CANCELLED
    match_request.responded_at = datetime.now(UTC)
    record_audit_log(
        db,
        actor_id=citizen.id,
        action="legal_aid.cancelled",
        entity_type="match_request",
        entity_id=match_request.id,
        metadata={},
        request=request,
    )
    db.commit()
    db.refresh(match_request)
    return match_request_response(db, match_request)


@legal_aid_router.post(
    "/requests/{request_id}/expire",
    response_model=MatchRequestResponse,
    response_model_by_alias=False,
)
def expire_legal_aid_request(
    request_id: UUID,
    citizen: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.CITIZEN))],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> MatchRequestResponse:
    match_request = _get_citizen_match_request(db, request_id, citizen.id)
    _require_pending(match_request)
    match_request.status = MatchRequestStatus.EXPIRED
    match_request.responded_at = datetime.now(UTC)
    record_audit_log(
        db,
        actor_id=citizen.id,
        action="legal_aid.expired",
        entity_type="match_request",
        entity_id=match_request.id,
        metadata={},
        request=request,
    )
    db.commit()
    db.refresh(match_request)
    return match_request_response(db, match_request)


def score_verified_lawyers(db: Session, case: Case) -> list[LawyerSuggestionResponse]:
    rows = db.execute(
        select(User, LawyerProfile)
        .join(LawyerProfile, LawyerProfile.user_id == User.id)
        .where(
            User.role == UserRole.LAWYER,
            User.is_verified.is_(True),
            LawyerProfile.verification_status == VerificationStatus.APPROVED,
            LawyerProfile.active_case_count < LawyerProfile.max_active_cases,
        )
    ).all()
    suggestions: list[LawyerSuggestionResponse] = []
    for user, profile in rows:
        score, breakdown = score_lawyer_for_case(case, profile)
        suggestions.append(
            LawyerSuggestionResponse(
                lawyer_id=user.id,
                email=user.email,
                phone=user.phone,
                district=profile.district,
                state_bar_council=profile.state_bar_council,
                specializations=profile.specializations,
                languages=profile.languages,
                is_pro_bono=profile.is_pro_bono,
                active_case_count=profile.active_case_count,
                max_active_cases=profile.max_active_cases,
                score=score,
                score_breakdown=breakdown,
            )
        )
    return sorted(suggestions, key=lambda item: item.score, reverse=True)


def score_lawyer_for_case(case: Case, profile: LawyerProfile) -> tuple[int, dict[str, int]]:
    normalized_category = case.category.lower().replace("_", " ")
    specializations = {item.lower().replace("_", " ") for item in profile.specializations}
    category_match = any(
        normalized_category in specialization or specialization in normalized_category
        for specialization in specializations
    )
    state_match = case.state.lower() in profile.state_bar_council.lower()
    low_caseload = profile.active_case_count < max(profile.max_active_cases, 1)
    breakdown = {
        "district": 25 if profile.district.lower() == case.district.lower() else 0,
        "state": 15 if state_match else 0,
        "specialization": 25 if category_match else 0,
        "language": 10 if profile.languages else 0,
        "pro_bono": 15 if profile.is_pro_bono else 0,
        "caseload": 10 if low_caseload else 0,
        "availability": 10 if profile.availability else 0,
        "reliability": 5,
    }
    return sum(breakdown.values()), breakdown


def lawyer_profile_response(user: User, profile: LawyerProfile) -> LawyerProfileDetailResponse:
    return LawyerProfileDetailResponse(
        user_id=user.id,
        email=user.email,
        phone=user.phone,
        is_verified=user.is_verified,
        bar_number=profile.bar_number,
        state_bar_council=profile.state_bar_council,
        district=profile.district,
        specializations=profile.specializations,
        languages=profile.languages,
        is_pro_bono=profile.is_pro_bono,
        availability=profile.availability,
        max_active_cases=profile.max_active_cases,
        active_case_count=profile.active_case_count,
        verification_status=profile.verification_status,
        verification_notes=profile.verification_notes,
        verification_document_id=profile.verification_document_id,
        rating=float(profile.rating) if profile.rating is not None else None,
    )


def match_request_response(db: Session, match_request: MatchRequest) -> MatchRequestResponse:
    case = db.get(Case, match_request.case_id)
    lawyer = db.get(User, match_request.lawyer_id)
    return MatchRequestResponse(
        id=match_request.id,
        case_id=match_request.case_id,
        citizen_id=match_request.citizen_id,
        lawyer_id=match_request.lawyer_id,
        score=match_request.score,
        score_breakdown=_score_breakdown(match_request.score_breakdown),
        status=match_request.status,
        message=match_request.message,
        requested_at=match_request.requested_at,
        responded_at=match_request.responded_at,
        expires_at=match_request.expires_at,
        case_title=case.title if case is not None else None,
        case_category=case.category if case is not None else None,
        case_district=case.district if case is not None else None,
        lawyer_email=lawyer.email if lawyer is not None else None,
    )


def _get_user(db: Session, user_id: UUID) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


def _score_breakdown(value: dict[str, object]) -> dict[str, int]:
    breakdown: dict[str, int] = {}
    for key, score in value.items():
        if isinstance(score, int):
            breakdown[key] = score
        elif isinstance(score, str) and score.isdigit():
            breakdown[key] = int(score)
    return breakdown


def _get_lawyer_user_and_profile(db: Session, lawyer_id: UUID) -> tuple[User, LawyerProfile]:
    user = _get_user(db, lawyer_id)
    if user.role != UserRole.LAWYER or user.lawyer_profile is None:
        raise HTTPException(status_code=404, detail="Lawyer profile not found.")
    return user, user.lawyer_profile


def _get_lawyer_profile_or_404(user: User) -> LawyerProfile:
    if user.lawyer_profile is None:
        raise HTTPException(status_code=404, detail="Lawyer profile not found.")
    return user.lawyer_profile


def _get_lawyer_match_request(db: Session, request_id: UUID, lawyer_id: UUID) -> MatchRequest:
    match_request = db.get(MatchRequest, request_id)
    if match_request is None or match_request.lawyer_id != lawyer_id:
        raise HTTPException(status_code=404, detail="Legal aid request not found.")
    return match_request


def _get_citizen_match_request(db: Session, request_id: UUID, citizen_id: UUID) -> MatchRequest:
    match_request = db.get(MatchRequest, request_id)
    if match_request is None or match_request.citizen_id != citizen_id:
        raise HTTPException(status_code=404, detail="Legal aid request not found.")
    return match_request


def _require_pending(match_request: MatchRequest) -> None:
    if match_request.status != MatchRequestStatus.PENDING:
        raise HTTPException(status_code=400, detail="Legal aid request is no longer pending.")


def _create_notification(
    db: Session,
    *,
    user_id: UUID,
    notification_type: str,
    title: str,
    message: str,
    idempotency_key: str,
    metadata: dict[str, object],
) -> Notification:
    existing = db.scalar(
        select(Notification).where(Notification.idempotency_key == idempotency_key)
    )
    if existing is not None:
        return existing

    notification = Notification(
        user_id=user_id,
        type=notification_type,
        title=title,
        message=message,
        channel=NotificationChannel.IN_APP,
        status=NotificationStatus.PENDING,
        idempotency_key=idempotency_key,
        metadata_json=metadata,
        created_at=datetime.now(UTC),
    )
    db.add(notification)
    db.flush()
    deliver_notification(str(notification.id))
    return notification
