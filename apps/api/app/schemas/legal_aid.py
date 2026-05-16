from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.enums import MatchRequestStatus, VerificationStatus


class LawyerProfileUpsertRequest(BaseModel):
    bar_number: str = Field(min_length=1, max_length=80)
    state_bar_council: str = Field(min_length=1, max_length=120)
    district: str = Field(min_length=1, max_length=120)
    specializations: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)
    is_pro_bono: bool = False
    availability: dict[str, Any] = Field(default_factory=dict)
    max_active_cases: int = Field(default=3, ge=1, le=100)


class LawyerProfileDetailResponse(BaseModel):
    user_id: UUID
    email: str
    phone: str | None
    is_verified: bool
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


class LawyerVerificationDecisionRequest(BaseModel):
    notes: str | None = None


class LawyerVerificationQueueResponse(BaseModel):
    total: int
    lawyers: list[LawyerProfileDetailResponse]


class LawyerSuggestionResponse(BaseModel):
    lawyer_id: UUID
    email: str
    phone: str | None
    district: str
    state_bar_council: str
    specializations: list[str]
    languages: list[str]
    is_pro_bono: bool
    active_case_count: int
    max_active_cases: int
    score: int
    score_breakdown: dict[str, int]


class LawyerSuggestionListResponse(BaseModel):
    case_id: UUID
    suggestions: list[LawyerSuggestionResponse]


class MatchRequestCreate(BaseModel):
    lawyer_id: UUID
    message: str | None = None


class MatchRequestResponse(BaseModel):
    id: UUID
    case_id: UUID
    citizen_id: UUID
    lawyer_id: UUID
    score: int
    score_breakdown: dict[str, int]
    status: MatchRequestStatus
    message: str | None
    requested_at: datetime
    responded_at: datetime | None
    expires_at: datetime | None
    case_title: str | None = None
    case_category: str | None = None
    case_district: str | None = None
    lawyer_email: str | None = None


class MatchRequestListResponse(BaseModel):
    total: int
    requests: list[MatchRequestResponse]
