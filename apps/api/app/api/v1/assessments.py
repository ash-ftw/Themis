from typing import Annotated, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import AuthenticatedUser, require_roles
from app.domain.assessment_rules import (
    ASSESSMENT_RULESET_VERSION,
    analyze_assessment,
    list_categories,
)
from app.models.assessment import AssessmentSession
from app.models.case import Case
from app.models.enums import CaseStatus, UserRole
from app.schemas.assessment import (
    AssessmentAnswerRequest,
    AssessmentCategoriesResponse,
    AssessmentCategoryResponse,
    AssessmentSessionResponse,
    AssessmentStartRequest,
    CaseSummaryResponse,
    EvidenceChecklistItem,
    SaveAssessmentToCaseRequest,
    SectionSuggestion,
)
from app.services.audit import record_audit_log
from app.services.timeline import add_case_timeline_event

router = APIRouter(prefix="/assessments", tags=["assessments"])


@router.get(
    "/categories",
    response_model=AssessmentCategoriesResponse,
    response_model_by_alias=False,
)
def get_assessment_categories(
    citizen: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.CITIZEN))],
) -> AssessmentCategoriesResponse:
    return AssessmentCategoriesResponse(
        ruleset_version=ASSESSMENT_RULESET_VERSION,
        categories=[
            AssessmentCategoryResponse.model_validate(category) for category in list_categories()
        ],
    )


@router.post(
    "/start",
    response_model=AssessmentSessionResponse,
    response_model_by_alias=False,
    status_code=status.HTTP_201_CREATED,
)
def start_assessment(
    payload: AssessmentStartRequest,
    citizen: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.CITIZEN))],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> AssessmentSessionResponse:
    if not payload.disclaimer_accepted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The informational disclaimer must be accepted before assessment.",
        )

    assessment = AssessmentSession(
        user_id=citizen.id,
        issue_category=payload.issue_category,
        state=payload.state,
        district=payload.district,
        answers={},
        suggested_sections=[],
        suggested_categories=[],
        evidence_checklist=[],
        ruleset_version=ASSESSMENT_RULESET_VERSION,
        disclaimer_accepted=payload.disclaimer_accepted,
    )
    db.add(assessment)
    db.flush()
    record_audit_log(
        db,
        actor_id=citizen.id,
        action="assessment.started",
        entity_type="assessment_session",
        entity_id=assessment.id,
        metadata={"issue_category": assessment.issue_category},
        request=request,
    )
    db.commit()
    db.refresh(assessment)

    return _assessment_response(assessment)


@router.post(
    "/{assessment_id}/answer",
    response_model=AssessmentSessionResponse,
    response_model_by_alias=False,
)
def answer_assessment(
    assessment_id: UUID,
    payload: AssessmentAnswerRequest,
    citizen: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.CITIZEN))],
    db: Annotated[Session, Depends(get_db)],
) -> AssessmentSessionResponse:
    assessment = _get_owned_assessment(db, assessment_id, citizen.id)
    answers = dict(assessment.answers)
    answers.update(payload.answers)
    assessment.answers = answers
    db.commit()
    db.refresh(assessment)

    return _assessment_response(assessment)


@router.post(
    "/{assessment_id}/analyze",
    response_model=AssessmentSessionResponse,
    response_model_by_alias=False,
)
def analyze_assessment_session(
    assessment_id: UUID,
    citizen: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.CITIZEN))],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> AssessmentSessionResponse:
    assessment = _get_owned_assessment(db, assessment_id, citizen.id)
    analysis = analyze_assessment(
        issue_category=assessment.issue_category,
        state=assessment.state,
        district=assessment.district,
        answers=assessment.answers,
    )
    assessment.suggested_sections = _string_list(analysis["suggested_sections"])
    assessment.suggested_categories = _string_list(analysis["suggested_categories"])
    assessment.evidence_checklist = _dict_list(analysis["evidence_checklist"])
    assessment.result_summary = str(analysis["result_summary"])
    assessment.ruleset_version = str(analysis["ruleset_version"])
    assessment.answers = {**assessment.answers, "_analysis": analysis}
    db.flush()
    record_audit_log(
        db,
        actor_id=citizen.id,
        action="assessment.analyzed",
        entity_type="assessment_session",
        entity_id=assessment.id,
        metadata={"ruleset_version": assessment.ruleset_version},
        request=request,
    )
    db.commit()
    db.refresh(assessment)

    return _assessment_response(assessment)


@router.get(
    "/{assessment_id}",
    response_model=AssessmentSessionResponse,
    response_model_by_alias=False,
)
def get_assessment(
    assessment_id: UUID,
    citizen: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.CITIZEN))],
    db: Annotated[Session, Depends(get_db)],
) -> AssessmentSessionResponse:
    return _assessment_response(_get_owned_assessment(db, assessment_id, citizen.id))


@router.post(
    "/{assessment_id}/save-to-case",
    response_model=CaseSummaryResponse,
    response_model_by_alias=False,
    status_code=status.HTTP_201_CREATED,
)
def save_assessment_to_case(
    assessment_id: UUID,
    payload: SaveAssessmentToCaseRequest,
    citizen: Annotated[AuthenticatedUser, Depends(require_roles(UserRole.CITIZEN))],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> CaseSummaryResponse:
    assessment = _get_owned_assessment(db, assessment_id, citizen.id)
    if assessment.case_id is not None:
        existing_case = db.get(Case, assessment.case_id)
        if existing_case is not None and existing_case.citizen_id == citizen.id:
            return _case_summary(existing_case)

    case = _case_from_assessment(assessment, citizen.id, payload)
    db.add(case)
    db.flush()
    assessment.case_id = case.id
    add_case_timeline_event(
        db,
        case_id=case.id,
        actor_id=citizen.id,
        event_type="assessment.saved_to_case",
        title="Assessment saved to case",
        description=assessment.result_summary,
        metadata={"assessment_id": str(assessment.id)},
    )
    record_audit_log(
        db,
        actor_id=citizen.id,
        action="assessment.saved_to_case",
        entity_type="case",
        entity_id=case.id,
        metadata={"assessment_id": str(assessment.id)},
        request=request,
    )
    db.commit()
    db.refresh(case)

    return _case_summary(case)


def _get_owned_assessment(db: Session, assessment_id: UUID, user_id: UUID) -> AssessmentSession:
    assessment = db.get(AssessmentSession, assessment_id)
    if assessment is None or assessment.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found.")
    return assessment


def _case_from_assessment(
    assessment: AssessmentSession,
    user_id: UUID,
    payload: SaveAssessmentToCaseRequest,
) -> Case:
    description = payload.description or assessment.result_summary or _answer_text(
        assessment.answers,
        "description",
        "Assessment result saved from guided flow.",
    )
    title = payload.title or f"{assessment.issue_category.replace('_', ' ').title()} assessment"

    return Case(
        citizen_id=user_id,
        title=title,
        category=assessment.issue_category,
        state=assessment.state or "Unknown",
        district=assessment.district or "Unknown",
        urgency=payload.urgency,
        status=CaseStatus.ASSESSMENT_COMPLETED,
        sections=assessment.suggested_sections,
        description=description,
        metadata_json={"assessment_id": str(assessment.id)},
    )


def _assessment_response(assessment: AssessmentSession) -> AssessmentSessionResponse:
    analysis = _analysis_from_assessment(assessment)
    return AssessmentSessionResponse(
        id=assessment.id,
        issue_category=assessment.issue_category,
        state=assessment.state,
        district=assessment.district,
        answers=assessment.answers,
        suggested_sections=assessment.suggested_sections,
        suggested_categories=assessment.suggested_categories,
        section_suggestions=[
            SectionSuggestion.model_validate(item)
            for item in _dict_list(analysis.get("section_suggestions", []))
        ],
        evidence_checklist=[
            EvidenceChecklistItem.model_validate(item)
            for item in _dict_list(assessment.evidence_checklist)
        ],
        next_steps=_string_list(analysis.get("next_steps", [])),
        result_summary=assessment.result_summary,
        ruleset_version=assessment.ruleset_version,
        disclaimer_accepted=assessment.disclaimer_accepted,
        complaint_eligible=bool(analysis.get("complaint_eligible", False)),
        rti_eligible=bool(analysis.get("rti_eligible", False)),
        legal_aid_recommended=bool(analysis.get("legal_aid_recommended", False)),
        case_id=assessment.case_id,
        created_at=assessment.created_at,
        updated_at=assessment.updated_at,
    )


def _analysis_from_assessment(assessment: AssessmentSession) -> dict[str, object]:
    value = assessment.answers.get("_analysis")
    if isinstance(value, dict):
        return value
    return {}


def _case_summary(case: Case) -> CaseSummaryResponse:
    return CaseSummaryResponse(
        id=case.id,
        title=case.title,
        category=case.category,
        status=case.status.value,
        created_at=case.created_at,
    )


def _string_list(value: object) -> list[str]:
    if isinstance(value, list):
        return [str(item) for item in value if item is not None]
    return []


def _dict_list(value: object) -> list[dict[str, object]]:
    if isinstance(value, list):
        return [item for item in value if isinstance(item, dict)]
    return []


def _answer_text(answers: dict[str, Any], key: str, fallback: str) -> str:
    value = answers.get(key)
    if isinstance(value, str) and value.strip():
        return value
    return fallback
