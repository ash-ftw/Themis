from datetime import date, datetime, time
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.enums import CaseStatus, CaseUrgency


class CaseBase(BaseModel):
    title: str = Field(min_length=1, max_length=240)
    category: str = Field(min_length=1, max_length=120)
    state: str = Field(min_length=1, max_length=80)
    district: str = Field(min_length=1, max_length=120)
    urgency: CaseUrgency = CaseUrgency.MEDIUM
    fir_number: str | None = Field(default=None, max_length=120)
    police_station: str | None = Field(default=None, max_length=180)
    court_name: str | None = Field(default=None, max_length=180)
    case_number: str | None = Field(default=None, max_length=120)
    status: CaseStatus = CaseStatus.DRAFT
    sections: list[str] = Field(default_factory=list)
    description: str = Field(min_length=1)
    metadata: dict[str, Any] = Field(default_factory=dict)


class CaseCreate(CaseBase):
    pass


class CaseUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=240)
    category: str | None = Field(default=None, min_length=1, max_length=120)
    state: str | None = Field(default=None, min_length=1, max_length=80)
    district: str | None = Field(default=None, min_length=1, max_length=120)
    urgency: CaseUrgency | None = None
    fir_number: str | None = Field(default=None, max_length=120)
    police_station: str | None = Field(default=None, max_length=180)
    court_name: str | None = Field(default=None, max_length=180)
    case_number: str | None = Field(default=None, max_length=120)
    status: CaseStatus | None = None
    sections: list[str] | None = None
    description: str | None = Field(default=None, min_length=1)
    metadata: dict[str, Any] | None = None


class CaseResponse(BaseModel):
    id: UUID
    citizen_id: UUID
    lawyer_id: UUID | None
    title: str
    category: str
    state: str
    district: str
    urgency: CaseUrgency
    fir_number: str | None
    police_station: str | None
    court_name: str | None
    case_number: str | None
    status: CaseStatus
    sections: list[str]
    description: str
    metadata: dict[str, Any]
    archived_at: datetime | None
    created_at: datetime
    updated_at: datetime


class CaseListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    results: list[CaseResponse]


class CaseTimelineEventResponse(BaseModel):
    id: UUID
    case_id: UUID
    actor_id: UUID | None
    event_type: str
    title: str
    description: str | None
    metadata: dict[str, Any]
    created_at: datetime


class CaseTimelineResponse(BaseModel):
    case_id: UUID
    events: list[CaseTimelineEventResponse]


class HearingBase(BaseModel):
    hearing_date: date
    hearing_time: time | None = None
    court: str = Field(min_length=1, max_length=180)
    court_room: str | None = Field(default=None, max_length=80)
    judge: str | None = Field(default=None, max_length=160)
    purpose: str = Field(min_length=1)
    outcome: str | None = None
    next_date: date | None = None
    notes: str | None = None


class HearingCreate(HearingBase):
    pass


class HearingUpdate(BaseModel):
    hearing_date: date | None = None
    hearing_time: time | None = None
    court: str | None = Field(default=None, min_length=1, max_length=180)
    court_room: str | None = Field(default=None, max_length=80)
    judge: str | None = Field(default=None, max_length=160)
    purpose: str | None = Field(default=None, min_length=1)
    outcome: str | None = None
    next_date: date | None = None
    notes: str | None = None


class HearingResponse(BaseModel):
    id: UUID
    case_id: UUID
    hearing_date: date
    hearing_time: time | None
    court: str
    court_room: str | None
    judge: str | None
    purpose: str
    outcome: str | None
    next_date: date | None
    notes: str | None
    added_by: UUID
    reminder_status: str
    created_at: datetime
    updated_at: datetime


class HearingListResponse(BaseModel):
    case_id: UUID
    hearings: list[HearingResponse]


class HearingReminderResponse(BaseModel):
    hearing: HearingResponse
    status: str
    reminder_key: str
