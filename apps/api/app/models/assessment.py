from uuid import UUID

from sqlalchemy import Boolean, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import DraftStatus


class AssessmentSession(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "assessment_sessions"

    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    case_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("cases.id", ondelete="SET NULL"),
    )
    issue_category: Mapped[str] = mapped_column(String(120), nullable=False)
    state: Mapped[str | None] = mapped_column(String(80))
    district: Mapped[str | None] = mapped_column(String(120))
    answers: Mapped[dict[str, object]] = mapped_column(JSONB, nullable=False, default=dict)
    suggested_sections: Mapped[list[str]] = mapped_column(ARRAY(Text), nullable=False, default=list)
    suggested_categories: Mapped[list[str]] = mapped_column(
        ARRAY(Text),
        nullable=False,
        default=list,
    )
    evidence_checklist: Mapped[list[dict[str, object]]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )
    result_summary: Mapped[str | None] = mapped_column(Text)
    ruleset_version: Mapped[str] = mapped_column(String(60), nullable=False)
    disclaimer_accepted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)


class ComplaintDraft(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "complaint_drafts"

    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    case_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("cases.id", ondelete="SET NULL"),
    )
    assessment_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("assessment_sessions.id", ondelete="SET NULL"),
    )
    draft_text: Mapped[str] = mapped_column(Text, nullable=False)
    structured_fields: Mapped[dict[str, object]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )
    status: Mapped[DraftStatus] = mapped_column(
        Enum(DraftStatus, name="draft_status"),
        nullable=False,
        default=DraftStatus.DRAFT,
    )
    pdf_document_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="SET NULL"),
    )


class RTIDraft(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "rti_drafts"

    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    case_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("cases.id", ondelete="SET NULL"),
    )
    public_authority: Mapped[str] = mapped_column(String(240), nullable=False)
    department: Mapped[str | None] = mapped_column(String(180))
    information_requested: Mapped[str] = mapped_column(Text, nullable=False)
    time_period: Mapped[str | None] = mapped_column(String(120))
    preferred_response_format: Mapped[str | None] = mapped_column(String(80))
    bpl_status: Mapped[bool | None] = mapped_column(Boolean)
    draft_text: Mapped[str] = mapped_column(Text, nullable=False)
    structured_fields: Mapped[dict[str, object]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )
    status: Mapped[DraftStatus] = mapped_column(
        Enum(DraftStatus, name="draft_status"),
        nullable=False,
        default=DraftStatus.DRAFT,
    )
    pdf_document_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="SET NULL"),
    )
