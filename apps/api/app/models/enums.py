from enum import StrEnum


class UserRole(StrEnum):
    CITIZEN = "citizen"
    LAWYER = "lawyer"
    ADMIN = "admin"
    ORG_USER = "org_user"


class VerificationStatus(StrEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class CaseUrgency(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    EMERGENCY = "emergency"


class CaseStatus(StrEnum):
    DRAFT = "draft"
    ASSESSMENT_COMPLETED = "assessment_completed"
    COMPLAINT_PREPARED = "complaint_prepared"
    COMPLAINT_SUBMITTED = "complaint_submitted"
    FIR_FILED = "fir_filed"
    UNDER_INVESTIGATION = "under_investigation"
    LEGAL_AID_REQUESTED = "legal_aid_requested"
    LAWYER_ASSIGNED = "lawyer_assigned"
    IN_COURT = "in_court"
    HEARING_SCHEDULED = "hearing_scheduled"
    AWAITING_ORDER = "awaiting_order"
    CLOSED = "closed"
    ARCHIVED = "archived"


class LawReviewStatus(StrEnum):
    DRAFT = "draft"
    REVIEWED = "reviewed"
    DEPRECATED = "deprecated"


class DraftStatus(StrEnum):
    DRAFT = "draft"
    EXPORTED = "exported"
    SAVED_TO_CASE = "saved_to_case"


class OcrStatus(StrEnum):
    NOT_STARTED = "not_started"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class DocumentAccessLevel(StrEnum):
    CASE_PRIVATE = "case_private"
    LAWYER_PRIVATE = "lawyer_private"
    ADMIN_REVIEW = "admin_review"


class MalwareScanStatus(StrEnum):
    NOT_SCANNED = "not_scanned"
    CLEAN = "clean"
    SUSPICIOUS = "suspicious"
    FAILED = "failed"


class MatchRequestStatus(StrEnum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    REASSIGNED = "reassigned"


class NotificationChannel(StrEnum):
    EMAIL = "email"
    SMS = "sms"
    IN_APP = "in_app"


class NotificationStatus(StrEnum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"


class AdminActionStatus(StrEnum):
    SUCCESS = "success"
    FAILED = "failed"


class SystemEventSeverity(StrEnum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"
