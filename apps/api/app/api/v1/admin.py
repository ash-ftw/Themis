from datetime import UTC, date, datetime, timedelta
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import Select, desc, func, or_, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import AuthenticatedUser, require_roles
from app.models.audit import AdminAction, AuditLog
from app.models.case import Case, Hearing
from app.models.document import Document
from app.models.enums import (
    AdminActionStatus,
    CaseStatus,
    CaseUrgency,
    LawReviewStatus,
    MalwareScanStatus,
    MatchRequestStatus,
    NotificationChannel,
    NotificationStatus,
    OcrStatus,
    UserRole,
    VerificationStatus,
)
from app.models.legal import LawSection
from app.models.legal_aid import MatchRequest
from app.models.notification import Notification
from app.models.user import LawyerProfile, User
from app.schemas.admin import (
    AdminAuditLogListResponse,
    AdminAuditLogResponse,
    AdminMetricsResponse,
    AdminNotificationFailureListResponse,
    AdminNotificationFailureResponse,
    AdminUserListResponse,
    AdminUserResponse,
    AdminUserStatusUpdateRequest,
    CountByLabel,
)
from app.services.audit import record_audit_log

router = APIRouter(prefix="/admin", tags=["admin operations"])


@router.get("/metrics", response_model=AdminMetricsResponse, response_model_by_alias=False)
def read_admin_metrics(
    admin: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
) -> AdminMetricsResponse:
    now = datetime.now(UTC)
    yesterday = now - timedelta(days=1)
    open_case_statuses = [CaseStatus.CLOSED, CaseStatus.ARCHIVED]

    users_by_role = [
        CountByLabel(label=str(role), count=count)
        for role, count in db.execute(
            select(User.role, func.count(User.id)).group_by(User.role).order_by(User.role)
        ).all()
    ]

    return AdminMetricsResponse(
        generated_at=now,
        users_total=_count(db, select(func.count()).select_from(User)),
        users_active=_count(
            db,
            select(func.count()).select_from(User).where(User.is_active.is_(True)),
        ),
        users_inactive=_count(
            db,
            select(func.count()).select_from(User).where(User.is_active.is_(False)),
        ),
        users_by_role=users_by_role,
        pending_lawyer_verifications=_count(
            db,
            select(func.count())
            .select_from(LawyerProfile)
            .where(LawyerProfile.verification_status == VerificationStatus.PENDING),
        ),
        law_sections_total=_count(db, select(func.count()).select_from(LawSection)),
        law_sections_pending_review=_count(
            db,
            select(func.count())
            .select_from(LawSection)
            .where(LawSection.review_status != LawReviewStatus.REVIEWED),
        ),
        cases_total=_count(db, select(func.count()).select_from(Case)),
        cases_open=_count(
            db,
            select(func.count()).select_from(Case).where(Case.status.notin_(open_case_statuses)),
        ),
        cases_urgent=_count(
            db,
            select(func.count())
            .select_from(Case)
            .where(
                Case.status.notin_(open_case_statuses),
                Case.urgency.in_([CaseUrgency.HIGH, CaseUrgency.EMERGENCY]),
            ),
        ),
        hearings_upcoming=_count(
            db,
            select(func.count()).select_from(Hearing).where(Hearing.hearing_date >= date.today()),
        ),
        documents_total=_count(
            db,
            select(func.count()).select_from(Document).where(Document.deleted_at.is_(None)),
        ),
        documents_pending_ocr=_count(
            db,
            select(func.count())
            .select_from(Document)
            .where(Document.ocr_status.in_([OcrStatus.NOT_STARTED, OcrStatus.PROCESSING])),
        ),
        documents_suspicious=_count(
            db,
            select(func.count())
            .select_from(Document)
            .where(Document.malware_scan_status == MalwareScanStatus.SUSPICIOUS),
        ),
        legal_aid_pending=_count(
            db,
            select(func.count())
            .select_from(MatchRequest)
            .where(MatchRequest.status == MatchRequestStatus.PENDING),
        ),
        notifications_failed=_count(
            db,
            select(func.count())
            .select_from(Notification)
            .where(Notification.status == NotificationStatus.FAILED),
        ),
        notifications_unread=_count(
            db,
            select(func.count()).select_from(Notification).where(Notification.read_at.is_(None)),
        ),
        audit_events_24h=_count(
            db,
            select(func.count()).select_from(AuditLog).where(AuditLog.created_at >= yesterday),
        ),
    )


@router.get("/users", response_model=AdminUserListResponse, response_model_by_alias=False)
def list_admin_users(
    admin: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
    role: UserRole | None = None,
    is_active: bool | None = None,
    q: Annotated[str | None, Query(min_length=1, max_length=160)] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> AdminUserListResponse:
    stmt = _filtered_users(role=role, is_active=is_active, q=q)
    total = _count(db, select(func.count()).select_from(stmt.subquery()))
    users = db.scalars(stmt.order_by(desc(User.created_at)).limit(limit).offset(offset)).all()

    return AdminUserListResponse(
        total=total,
        limit=limit,
        offset=offset,
        users=[AdminUserResponse.model_validate(user) for user in users],
    )


@router.post(
    "/users/{user_id}/suspend",
    response_model=AdminUserResponse,
    response_model_by_alias=False,
)
def suspend_user(
    user_id: UUID,
    payload: AdminUserStatusUpdateRequest,
    admin: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> AdminUserResponse:
    user = _get_target_user(db, user_id, admin)
    user.is_active = False
    _record_admin_user_status_change(
        db,
        admin=admin,
        user=user,
        action="user.suspended",
        reason=payload.reason,
        request=request,
    )
    db.commit()
    db.refresh(user)
    return AdminUserResponse.model_validate(user)


@router.post(
    "/users/{user_id}/reactivate",
    response_model=AdminUserResponse,
    response_model_by_alias=False,
)
def reactivate_user(
    user_id: UUID,
    payload: AdminUserStatusUpdateRequest,
    admin: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> AdminUserResponse:
    user = _get_target_user(db, user_id, admin)
    user.is_active = True
    _record_admin_user_status_change(
        db,
        admin=admin,
        user=user,
        action="user.reactivated",
        reason=payload.reason,
        request=request,
    )
    db.commit()
    db.refresh(user)
    return AdminUserResponse.model_validate(user)


@router.get("/audit-logs", response_model=AdminAuditLogListResponse, response_model_by_alias=False)
def list_audit_logs(
    admin: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
    action: Annotated[str | None, Query(max_length=120)] = None,
    entity_type: Annotated[str | None, Query(max_length=120)] = None,
    actor_id: UUID | None = None,
    created_after: datetime | None = None,
    created_before: datetime | None = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> AdminAuditLogListResponse:
    stmt = _filtered_audit_logs(
        action=action,
        entity_type=entity_type,
        actor_id=actor_id,
        created_after=created_after,
        created_before=created_before,
    )
    total = _count(db, select(func.count()).select_from(stmt.subquery()))
    rows = db.execute(
        stmt.outerjoin(User, AuditLog.actor_id == User.id)
        .add_columns(User.email)
        .order_by(desc(AuditLog.created_at))
        .limit(limit)
        .offset(offset)
    ).all()

    return AdminAuditLogListResponse(
        total=total,
        limit=limit,
        offset=offset,
        audit_logs=[_audit_log_response(log, email) for log, email in rows],
    )


@router.get(
    "/notifications/failures",
    response_model=AdminNotificationFailureListResponse,
    response_model_by_alias=False,
)
def list_notification_failures(
    admin: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
    channel: NotificationChannel | None = None,
    notification_type: Annotated[str | None, Query(max_length=100)] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> AdminNotificationFailureListResponse:
    stmt = select(Notification).where(Notification.status == NotificationStatus.FAILED)
    if channel is not None:
        stmt = stmt.where(Notification.channel == channel)
    if notification_type:
        stmt = stmt.where(Notification.type == notification_type)

    total = _count(db, select(func.count()).select_from(stmt.subquery()))
    rows = db.execute(
        stmt.outerjoin(User, Notification.user_id == User.id)
        .add_columns(User.email)
        .order_by(desc(Notification.created_at))
        .limit(limit)
        .offset(offset)
    ).all()

    return AdminNotificationFailureListResponse(
        total=total,
        limit=limit,
        offset=offset,
        notifications=[
            _notification_failure_response(notification, email) for notification, email in rows
        ],
    )


def _count(db: Session, stmt: Select[tuple[int]]) -> int:
    return int(db.scalar(stmt) or 0)


def _filtered_users(
    *,
    role: UserRole | None,
    is_active: bool | None,
    q: str | None,
) -> Select[tuple[User]]:
    stmt = select(User)
    if role is not None:
        stmt = stmt.where(User.role == role)
    if is_active is not None:
        stmt = stmt.where(User.is_active.is_(is_active))
    if q:
        like = f"%{q}%"
        stmt = stmt.where(or_(User.email.ilike(like), User.external_auth_id.ilike(like)))
    return stmt


def _filtered_audit_logs(
    *,
    action: str | None,
    entity_type: str | None,
    actor_id: UUID | None,
    created_after: datetime | None,
    created_before: datetime | None,
) -> Select[tuple[AuditLog]]:
    stmt = select(AuditLog)
    if action:
        stmt = stmt.where(AuditLog.action == action)
    if entity_type:
        stmt = stmt.where(AuditLog.entity_type == entity_type)
    if actor_id is not None:
        stmt = stmt.where(AuditLog.actor_id == actor_id)
    if created_after is not None:
        stmt = stmt.where(AuditLog.created_at >= created_after)
    if created_before is not None:
        stmt = stmt.where(AuditLog.created_at <= created_before)
    return stmt


def _get_target_user(db: Session, user_id: UUID, admin: AuthenticatedUser) -> User:
    if user_id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admins cannot change their own active status.",
        )

    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return user


def _record_admin_user_status_change(
    db: Session,
    *,
    admin: AuthenticatedUser,
    user: User,
    action: str,
    reason: str | None,
    request: Request,
) -> None:
    db.add(
        AdminAction(
            admin_id=admin.id,
            action=action,
            target_type="user",
            target_id=user.id,
            reason=reason,
            status=AdminActionStatus.SUCCESS,
            metadata_json={"target_email": user.email, "target_role": user.role.value},
            created_at=datetime.now(UTC),
        )
    )
    record_audit_log(
        db,
        actor_id=admin.id,
        action=action,
        entity_type="user",
        entity_id=user.id,
        metadata={"target_email": user.email, "target_role": user.role.value, "reason": reason},
        request=request,
    )


def _audit_log_response(log: AuditLog, actor_email: str | None) -> AdminAuditLogResponse:
    return AdminAuditLogResponse(
        id=log.id,
        actor_id=log.actor_id,
        actor_email=actor_email,
        action=log.action,
        entity_type=log.entity_type,
        entity_id=log.entity_id,
        metadata=log.metadata_json,
        ip_address=log.ip_address,
        user_agent=log.user_agent,
        created_at=log.created_at,
    )


def _notification_failure_response(
    notification: Notification,
    user_email: str | None,
) -> AdminNotificationFailureResponse:
    return AdminNotificationFailureResponse(
        id=notification.id,
        user_id=notification.user_id,
        user_email=user_email,
        type=notification.type,
        title=notification.title,
        message=notification.message,
        channel=notification.channel,
        status=notification.status,
        idempotency_key=notification.idempotency_key,
        metadata=notification.metadata_json,
        created_at=notification.created_at,
    )
