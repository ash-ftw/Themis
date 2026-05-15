from datetime import UTC, datetime
from uuid import UUID

from fastapi.testclient import TestClient

from app.domain.assessment_rules import (
    analyze_assessment,
    build_complaint_draft,
    questions_for_category,
)
from app.main import app
from app.schemas.assessment import (
    AssessmentSessionResponse,
    EvidenceChecklistItem,
    SectionSuggestion,
)


def test_assessment_start_rejects_missing_auth() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/v1/assessments/start",
        json={
            "issue_category": "consumer_complaint",
            "state": "Maharashtra",
            "district": "Mumbai",
            "disclaimer_accepted": True,
        },
    )

    assert response.status_code == 401


def test_complaint_generate_rejects_missing_auth() -> None:
    client = TestClient(app)

    response = client.post("/api/v1/complaints/generate", json={})

    assert response.status_code == 401


def test_category_questions_include_common_and_dynamic_fields() -> None:
    question_keys = {question.key for question in questions_for_category("cyber_fraud")}

    assert "description" in question_keys
    assert "transaction_amount" in question_keys
    assert "platform_name" in question_keys


def test_assessment_analysis_generates_sections_and_evidence() -> None:
    analysis = analyze_assessment(
        issue_category="cyber_fraud",
        state="Maharashtra",
        district="Mumbai",
        answers={
            "description": "I paid after a fake support call.",
            "incident_date": "2026-05-01",
            "incident_location": "Online",
            "money_or_property": True,
            "digital_evidence": True,
            "documents_available": True,
        },
    )

    suggested_sections = analysis["suggested_sections"]
    section_suggestions = analysis["section_suggestions"]
    evidence_checklist = analysis["evidence_checklist"]
    assert isinstance(suggested_sections, list)
    assert isinstance(section_suggestions, list)
    assert isinstance(evidence_checklist, list)
    first_suggestion = section_suggestions[0]
    assert isinstance(first_suggestion, dict)

    assert analysis["suggested_categories"] == ["cyber_fraud"]
    assert "BNS Section 318 - Cheating" in suggested_sections
    assert first_suggestion["confidence"] == "high"
    evidence_labels = {
        item["label"] for item in evidence_checklist if isinstance(item, dict)
    }
    assert "Transaction IDs" in evidence_labels
    assert "Digital screenshots and URLs" in evidence_labels


def test_complaint_draft_includes_disclaimer_and_sections() -> None:
    draft = build_complaint_draft(
        fields={
            "complainant_name": "Asha Rao",
            "authority_name": "Station House Officer",
            "incident_description": "A fraudulent transfer occurred.",
        },
        assessment_result={
            "section_suggestions": [{"section": "BNS Section 318 - Cheating"}],
            "evidence_checklist": [{"label": "Transaction IDs"}],
        },
    )

    assert "Asha Rao" in draft
    assert "BNS Section 318 - Cheating" in draft
    assert "not legal advice" in draft


def test_assessment_response_accepts_analysis_fields() -> None:
    response = AssessmentSessionResponse(
        id=UUID("00000000-0000-0000-0000-000000000001"),
        issue_category="consumer_complaint",
        state="Maharashtra",
        district="Mumbai",
        answers={},
        suggested_sections=["Consumer Protection Act Section 35"],
        suggested_categories=["consumer_complaint"],
        section_suggestions=[
            SectionSuggestion(
                section="Consumer Protection Act Section 35",
                confidence="medium",
                rationale="Matched from consumer complaint.",
            )
        ],
        evidence_checklist=[
            EvidenceChecklistItem(
                label="Invoice",
                required=True,
                reason="Category-specific supporting material.",
            )
        ],
        next_steps=["Review before submission."],
        result_summary="Informational match.",
        ruleset_version="phase4-mvp-2026-05-15",
        disclaimer_accepted=True,
        case_id=None,
        created_at=datetime(2026, 5, 15, tzinfo=UTC),
        updated_at=datetime(2026, 5, 15, tzinfo=UTC),
    )

    assert response.section_suggestions[0].confidence == "medium"
