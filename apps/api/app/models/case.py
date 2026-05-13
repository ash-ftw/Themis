from datetime import date, datetime, time
from uuid import UUID

from sqlalchemy import Date, DateTime, Enum, ForeignKey, String, Text, Time
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import CaseStatus, CaseUrgency


class Case(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "cases"

    citizen_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    lawyer_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
    )
    title: Mapped[str] = mapped_column(String(240), nullable=False)
    category: Mapped[str] = mapped_column(String(120), nullable=False)
    state: Mapped[str] = mapped_column(String(80), nullable=False)
    district: Mapped[str] = mapped_column(String(120), nullable=False)
    urgency: Mapped[CaseUrgency] = mapped_column(
        Enum(CaseUrgency, name="case_urgency"),
        nullable=False,
        default=CaseUrgency.MEDIUM,
    )
    fir_number: Mapped[str | None] = mapped_column(String(120))
    police_station: Mapped[str | None] = mapped_column(String(180))
    court_name: Mapped[str | None] = mapped_column(String(180))
    case_number: Mapped[str | None] = mapped_column(String(120))
    status: Mapped[CaseStatus] = mapped_column(
        Enum(CaseStatus, name="case_status"),
        nullable=False,
        default=CaseStatus.DRAFT,
    )
    sections: Mapped[list[str]] = mapped_column(ARRAY(Text), nullable=False, default=list)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    metadata_json: Mapped[dict[str, object]] = mapped_column(
        "metadata",
        JSONB,
        nullable=False,
        default=dict,
    )
    archived_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class CaseTimelineEvent(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "case_timeline_events"

    case_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("cases.id", ondelete="CASCADE"),
        nullable=False,
    )
    actor_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
    )
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    metadata_json: Mapped[dict[str, object]] = mapped_column(
        "metadata",
        JSONB,
        nullable=False,
        default=dict,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class Hearing(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "hearings"

    case_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("cases.id", ondelete="CASCADE"),
        nullable=False,
    )
    hearing_date: Mapped[date] = mapped_column(Date, nullable=False)
    hearing_time: Mapped[time | None] = mapped_column(Time)
    court: Mapped[str] = mapped_column(String(180), nullable=False)
    court_room: Mapped[str | None] = mapped_column(String(80))
    judge: Mapped[str | None] = mapped_column(String(160))
    purpose: Mapped[str] = mapped_column(Text, nullable=False)
    outcome: Mapped[str | None] = mapped_column(Text)
    next_date: Mapped[date | None] = mapped_column(Date)
    notes: Mapped[str | None] = mapped_column(Text)
    added_by: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )
    reminder_status: Mapped[str] = mapped_column(
        String(80),
        nullable=False,
        default="not_scheduled",
    )
