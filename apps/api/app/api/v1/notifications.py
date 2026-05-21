from datetime import UTC, datetime
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import AuthenticatedUser, get_current_user
from app.models.notification import Notification
from app.schemas.notification import (
    NotificationListResponse,
    NotificationPreferenceResponse,
    NotificationPreferenceUpdateRequest,
    NotificationResponse,
)
from app.services.audit import record_audit_log
from app.services.notifications import get_or_create_preferences, mark_notification_read

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=NotificationListResponse, response_model_by_alias=False)
def list_notifications(
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    unread_only: bool = False,
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> NotificationListResponse:
    stmt = select(Notification).where(Notification.user_id == current_user.id)
    if unread_only:
        stmt = stmt.where(Notification.read_at.is_(None))
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    unread_count = (
        db.scalar(
            select(func.count())
            .select_from(Notification)
            .where(Notification.user_id == current_user.id, Notification.read_at.is_(None))
        )
        or 0
    )
    notifications = db.scalars(
        stmt.order_by(desc(Notification.created_at)).limit(limit).offset(offset)
    ).all()
    return NotificationListResponse(
        total=total,
        unread_count=unread_count,
        notifications=[notification_response(item) for item in notifications],
    )


@router.post(
    "/{notification_id}/read",
    response_model=NotificationResponse,
    response_model_by_alias=False,
)
def mark_read(
    notification_id: UUID,
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> NotificationResponse:
    notification = _get_owned_notification(db, notification_id, current_user.id)
    mark_notification_read(db, notification)
    record_audit_log(
        db,
        actor_id=current_user.id,
        action="notification.read",
        entity_type="notification",
        entity_id=notification.id,
        metadata={},
        request=request,
    )
    db.commit()
    db.refresh(notification)
    return notification_response(notification)


@router.post(
    "/mark-all-read",
    response_model=NotificationListResponse,
    response_model_by_alias=False,
)
def mark_all_read(
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> NotificationListResponse:
    now = datetime.now(UTC)
    notifications = db.scalars(
        select(Notification).where(Notification.user_id == current_user.id)
    ).all()
    for notification in notifications:
        if notification.read_at is None:
            notification.read_at = now
    record_audit_log(
        db,
        actor_id=current_user.id,
        action="notification.read_all",
        entity_type="notification",
        metadata={"count": len(notifications)},
        request=request,
    )
    db.commit()
    return list_notifications(current_user, db)


@router.get(
    "/preferences",
    response_model=NotificationPreferenceResponse,
    response_model_by_alias=False,
)
def get_preferences(
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> NotificationPreferenceResponse:
    preferences = get_or_create_preferences(db, current_user.id)
    db.commit()
    return NotificationPreferenceResponse.model_validate(preferences)


@router.put(
    "/preferences",
    response_model=NotificationPreferenceResponse,
    response_model_by_alias=False,
)
def update_preferences(
    payload: NotificationPreferenceUpdateRequest,
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> NotificationPreferenceResponse:
    preferences = get_or_create_preferences(db, current_user.id)
    for key, value in payload.model_dump(exclude_none=True).items():
        setattr(preferences, key, value)
    record_audit_log(
        db,
        actor_id=current_user.id,
        action="notification.preferences_updated",
        entity_type="notification_preference",
        entity_id=preferences.id,
        metadata={"fields": sorted(payload.model_dump(exclude_none=True).keys())},
        request=request,
    )
    db.commit()
    db.refresh(preferences)
    return NotificationPreferenceResponse.model_validate(preferences)


def notification_response(notification: Notification) -> NotificationResponse:
    return NotificationResponse(
        id=notification.id,
        user_id=notification.user_id,
        type=notification.type,
        title=notification.title,
        message=notification.message,
        channel=notification.channel,
        status=notification.status,
        idempotency_key=notification.idempotency_key,
        metadata=notification.metadata_json,
        sent_at=notification.sent_at,
        read_at=notification.read_at,
        created_at=notification.created_at,
    )


def _get_owned_notification(db: Session, notification_id: UUID, user_id: UUID) -> Notification:
    notification = db.get(Notification, notification_id)
    if notification is None or notification.user_id != user_id:
        raise HTTPException(status_code=404, detail="Notification not found.")
    return notification
