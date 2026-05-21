from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.enums import NotificationChannel, NotificationStatus


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    type: str
    title: str
    message: str
    channel: NotificationChannel
    status: NotificationStatus
    idempotency_key: str
    metadata: dict[str, object]
    sent_at: datetime | None
    read_at: datetime | None
    created_at: datetime


class NotificationListResponse(BaseModel):
    total: int
    unread_count: int
    notifications: list[NotificationResponse]


class NotificationPreferenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: UUID
    email_enabled: bool
    sms_enabled: bool
    in_app_enabled: bool
    hearing_reminders_enabled: bool
    legal_aid_updates_enabled: bool
    digest_enabled: bool


class NotificationPreferenceUpdateRequest(BaseModel):
    email_enabled: bool | None = None
    sms_enabled: bool | None = None
    in_app_enabled: bool | None = None
    hearing_reminders_enabled: bool | None = None
    legal_aid_updates_enabled: bool | None = None
    digest_enabled: bool | None = None
