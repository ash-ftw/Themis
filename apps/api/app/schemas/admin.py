from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import NotificationChannel, NotificationStatus, UserRole


class CountByLabel(BaseModel):
    label: str
    count: int


class AdminMetricsResponse(BaseModel):
    generated_at: datetime
    users_total: int
    users_active: int
    users_inactive: int
    users_by_role: list[CountByLabel]
    pending_lawyer_verifications: int
    law_sections_total: int
    law_sections_pending_review: int
    cases_total: int
    cases_open: int
    cases_urgent: int
    hearings_upcoming: int
    documents_total: int
    documents_pending_ocr: int
    documents_suspicious: int
    legal_aid_pending: int
    notifications_failed: int
    notifications_unread: int
    audit_events_24h: int


class AdminUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    external_auth_id: str
    role: UserRole
    email: str
    phone: str | None
    is_active: bool
    is_verified: bool
    last_login_at: datetime | None
    created_at: datetime
    updated_at: datetime


class AdminUserListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    users: list[AdminUserResponse]


class AdminUserStatusUpdateRequest(BaseModel):
    reason: str | None = Field(default=None, max_length=500)


class AdminAuditLogResponse(BaseModel):
    id: UUID
    actor_id: UUID | None
    actor_email: str | None
    action: str
    entity_type: str
    entity_id: UUID | None
    metadata: dict[str, object]
    ip_address: str | None
    user_agent: str | None
    created_at: datetime


class AdminAuditLogListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    audit_logs: list[AdminAuditLogResponse]


class AdminNotificationFailureResponse(BaseModel):
    id: UUID
    user_id: UUID
    user_email: str | None
    type: str
    title: str
    message: str
    channel: NotificationChannel
    status: NotificationStatus
    idempotency_key: str
    metadata: dict[str, object]
    created_at: datetime


class AdminNotificationFailureListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    notifications: list[AdminNotificationFailureResponse]
