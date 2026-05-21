from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import DraftStatus
from app.schemas.assessment import CaseSummaryResponse


class RTIGenerateRequest(BaseModel):
    case_id: UUID | None = None
    public_authority: str = Field(min_length=1, max_length=240)
    department: str | None = Field(default=None, max_length=180)
    information_requested: str = Field(min_length=1)
    time_period: str | None = Field(default=None, max_length=120)
    preferred_response_format: str | None = Field(default=None, max_length=80)
    bpl_status: bool | None = None
    applicant_name: str | None = Field(default=None, max_length=160)
    applicant_address: str | None = None


class RTIUpdateRequest(BaseModel):
    public_authority: str | None = Field(default=None, min_length=1, max_length=240)
    department: str | None = Field(default=None, max_length=180)
    information_requested: str | None = Field(default=None, min_length=1)
    time_period: str | None = Field(default=None, max_length=120)
    preferred_response_format: str | None = Field(default=None, max_length=80)
    bpl_status: bool | None = None
    draft_text: str | None = Field(default=None, min_length=1)
    structured_fields: dict[str, object] | None = None


class RTISaveToCaseRequest(BaseModel):
    case_id: UUID | None = None
    title: str | None = Field(default=None, max_length=240)
    description: str | None = None


class RTIDraftResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    case_id: UUID | None
    public_authority: str
    department: str | None
    information_requested: str
    time_period: str | None
    preferred_response_format: str | None
    bpl_status: bool | None
    draft_text: str
    structured_fields: dict[str, object]
    status: DraftStatus
    pdf_document_id: UUID | None
    created_at: datetime
    updated_at: datetime


class RTIListResponse(BaseModel):
    total: int
    drafts: list[RTIDraftResponse]


class RTIExportResponse(BaseModel):
    draft: RTIDraftResponse
    document_id: UUID
    status: str
    object_key: str


class RTISaveToCaseResponse(BaseModel):
    case: CaseSummaryResponse
    document_id: UUID
