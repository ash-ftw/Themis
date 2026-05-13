from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import UserRole, VerificationStatus


class CitizenProfilePayload(BaseModel):
    full_name: str = Field(min_length=1, max_length=160)
    state: str = Field(min_length=1, max_length=80)
    district: str = Field(min_length=1, max_length=120)
    preferred_language: str = Field(default="English", min_length=1, max_length=80)
    address: str | None = None
    emergency_contact: dict[str, Any] | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class LawyerProfilePayload(BaseModel):
    bar_number: str = Field(min_length=1, max_length=80)
    state_bar_council: str = Field(min_length=1, max_length=120)
    district: str = Field(min_length=1, max_length=120)
    specializations: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)
    is_pro_bono: bool = False
    availability: dict[str, Any] = Field(default_factory=dict)
    max_active_cases: int = Field(default=3, ge=1, le=100)


class AuthSyncRequest(BaseModel):
    phone: str | None = Field(default=None, max_length=32)
    citizen_profile: CitizenProfilePayload | None = None
    lawyer_profile: LawyerProfilePayload | None = None


class ProfileUpdateRequest(BaseModel):
    citizen_profile: CitizenProfilePayload | None = None
    lawyer_profile: LawyerProfilePayload | None = None


class CitizenProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: UUID
    full_name: str
    state: str
    district: str
    preferred_language: str
    address: str | None
    emergency_contact: dict[str, Any] | None
    metadata: dict[str, Any] = Field(alias="metadata_json")


class LawyerProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    bar_number: str
    state_bar_council: str
    district: str
    specializations: list[str]
    languages: list[str]
    is_pro_bono: bool
    availability: dict[str, Any]
    max_active_cases: int
    active_case_count: int
    verification_status: VerificationStatus
    verification_notes: str | None
    verification_document_id: UUID | None
    rating: float | None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    external_auth_id: str
    role: UserRole
    email: str
    phone: str | None
    is_active: bool
    is_verified: bool
    last_login_at: datetime | None
    profile: CitizenProfileResponse | None
    lawyer_profile: LawyerProfileResponse | None


class AuthMeResponse(BaseModel):
    user: UserResponse
