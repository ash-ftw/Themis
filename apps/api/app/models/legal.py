from datetime import datetime
from uuid import UUID

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, TSVECTOR
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import LawReviewStatus


class LawSection(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "law_sections"

    act_name: Mapped[str] = mapped_column(String(180), nullable=False)
    section_number: Mapped[str] = mapped_column(String(80), nullable=False)
    title: Mapped[str] = mapped_column(String(240), nullable=False)
    original_text: Mapped[str | None] = mapped_column(Text)
    plain_language: Mapped[str] = mapped_column(Text, nullable=False)
    example_scenarios: Mapped[list[str]] = mapped_column(ARRAY(Text), nullable=False, default=list)
    punishment: Mapped[str | None] = mapped_column(Text)
    is_bailable: Mapped[bool | None] = mapped_column(Boolean)
    is_cognizable: Mapped[bool | None] = mapped_column(Boolean)
    ipc_mapping: Mapped[str | None] = mapped_column(String(80))
    related_sections: Mapped[list[str]] = mapped_column(ARRAY(Text), nullable=False, default=list)
    category_tags: Mapped[list[str]] = mapped_column(ARRAY(Text), nullable=False, default=list)
    jurisdiction_notes: Mapped[str | None] = mapped_column(Text)
    source_reference: Mapped[str | None] = mapped_column(Text)
    review_status: Mapped[LawReviewStatus] = mapped_column(
        Enum(LawReviewStatus, name="law_review_status"),
        nullable=False,
        default=LawReviewStatus.DRAFT,
    )
    last_reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    search_vector: Mapped[str | None] = mapped_column(TSVECTOR)


class Bookmark(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "bookmarks"

    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    law_section_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("law_sections.id", ondelete="CASCADE"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
