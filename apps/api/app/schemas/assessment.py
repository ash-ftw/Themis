from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import CaseUrgency, DraftStatus

QuestionType = Literal["text", "textarea", "select", "date", "boolean"]
ConfidenceLabel = Literal["low", "medium", "high"]


class AssessmentQuestionResponse(BaseModel):
    key: str
    label: str
    input_type: QuestionType
    required: bool
    options: list[str] = Field(default_factory=list)
    help_text: str | None = None


class AssessmentCategoryResponse(BaseModel):
    key: str
    label: str
    description: str
    questions: list[AssessmentQuestionResponse]


class AssessmentCategoriesResponse(BaseModel):
    ruleset_version: str
    categories: list[AssessmentCategoryResponse]


class SectionSuggestion(BaseModel):
    section: str
    confidence: ConfidenceLabel
    rationale: str


class EvidenceChecklistItem(BaseModel):
    label: str
    required: bool
    reason: str


class AssessmentStartRequest(BaseModel):
    issue_category: str = Field(min_length=1, max_length=120)
    state: str | None = Field(default=None, max_length=80)
    district: str | None = Field(default=None, max_length=120)
    disclaimer_accepted: bool


class AssessmentAnswerRequest(BaseModel):
    answers: dict[str, Any] = Field(default_factory=dict)


class AssessmentSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    issue_category: str
    state: str | None
    district: str | None
    answers: dict[str, Any]
    suggested_sections: list[str]
    suggested_categories: list[str]
    section_suggestions: list[SectionSuggestion] = Field(default_factory=list)
    evidence_checklist: list[EvidenceChecklistItem]
    next_steps: list[str] = Field(default_factory=list)
    result_summary: str | None
    ruleset_version: str
    disclaimer_accepted: bool
    complaint_eligible: bool = False
    rti_eligible: bool = False
    legal_aid_recommended: bool = False
    case_id: UUID | None
    created_at: datetime
    updated_at: datetime


class SaveAssessmentToCaseRequest(BaseModel):
    title: str | None = Field(default=None, max_length=240)
    description: str | None = None
    urgency: CaseUrgency = CaseUrgency.MEDIUM


class CaseSummaryResponse(BaseModel):
    id: UUID
    title: str
    category: str
    status: str
    created_at: datetime


class ComplaintStructuredFields(BaseModel):
    complainant_name: str | None = Field(default=None, max_length=160)
    address: str | None = None
    phone: str | None = Field(default=None, max_length=32)
    email: str | None = Field(default=None, max_length=255)
    authority_name: str | None = Field(default=None, max_length=240)
    incident_date_time: str | None = Field(default=None, max_length=120)
    incident_location: str | None = None
    accused_details: str | None = None
    incident_description: str | None = None
    witnesses: str | None = None
    evidence: list[str] = Field(default_factory=list)
    possible_sections: list[str] = Field(default_factory=list)
    requested_action: str | None = None
    place: str | None = Field(default=None, max_length=120)


class ComplaintGenerateRequest(BaseModel):
    assessment_id: UUID | None = None
    structured_fields: ComplaintStructuredFields = Field(default_factory=ComplaintStructuredFields)


class ComplaintDraftUpdateRequest(BaseModel):
    draft_text: str | None = Field(default=None, min_length=1)
    structured_fields: ComplaintStructuredFields | None = None


class ComplaintDraftResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    case_id: UUID | None
    assessment_id: UUID | None
    draft_text: str
    structured_fields: dict[str, Any]
    status: DraftStatus
    pdf_document_id: UUID | None
    created_at: datetime
    updated_at: datetime


class ComplaintExportResponse(BaseModel):
    draft: ComplaintDraftResponse
    document_id: UUID
    status: str
    object_key: str
