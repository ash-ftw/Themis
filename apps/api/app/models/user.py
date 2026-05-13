from datetime import datetime
from uuid import UUID

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import UserRole, VerificationStatus


class User(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "users"

    external_auth_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="user_role"), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(32))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    profile: Mapped["UserProfile | None"] = relationship(back_populates="user")
    lawyer_profile: Mapped["LawyerProfile | None"] = relationship(back_populates="user")


class UserProfile(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "user_profiles"

    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    full_name: Mapped[str] = mapped_column(String(160), nullable=False)
    state: Mapped[str] = mapped_column(String(80), nullable=False)
    district: Mapped[str] = mapped_column(String(120), nullable=False)
    preferred_language: Mapped[str] = mapped_column(String(80), nullable=False, default="English")
    address: Mapped[str | None] = mapped_column(Text)
    emergency_contact: Mapped[dict[str, object] | None] = mapped_column(JSONB)
    metadata_json: Mapped[dict[str, object]] = mapped_column(
        "metadata",
        JSONB,
        nullable=False,
        default=dict,
    )

    user: Mapped[User] = relationship(back_populates="profile")


class LawyerProfile(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "lawyer_profiles"

    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    bar_number: Mapped[str] = mapped_column(String(80), nullable=False)
    state_bar_council: Mapped[str] = mapped_column(String(120), nullable=False)
    district: Mapped[str] = mapped_column(String(120), nullable=False)
    specializations: Mapped[list[str]] = mapped_column(ARRAY(Text), nullable=False, default=list)
    languages: Mapped[list[str]] = mapped_column(ARRAY(Text), nullable=False, default=list)
    is_pro_bono: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    availability: Mapped[dict[str, object]] = mapped_column(JSONB, nullable=False, default=dict)
    max_active_cases: Mapped[int] = mapped_column(Integer, nullable=False, default=3)
    active_case_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    verification_status: Mapped[VerificationStatus] = mapped_column(
        Enum(VerificationStatus, name="verification_status"),
        nullable=False,
        default=VerificationStatus.PENDING,
    )
    verification_notes: Mapped[str | None] = mapped_column(Text)
    verification_document_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="SET NULL"),
    )
    rating: Mapped[float | None] = mapped_column(Numeric(3, 2))

    user: Mapped[User] = relationship(back_populates="lawyer_profile")
