from dataclasses import dataclass
from typing import Literal

ASSESSMENT_RULESET_VERSION = "phase4-mvp-2026-05-15"

QuestionType = Literal["text", "textarea", "select", "date", "boolean"]
ConfidenceLabel = Literal["low", "medium", "high"]


@dataclass(frozen=True)
class AssessmentQuestion:
    key: str
    label: str
    input_type: QuestionType
    required: bool = True
    options: tuple[str, ...] = ()
    help_text: str | None = None


@dataclass(frozen=True)
class CategoryRule:
    key: str
    label: str
    description: str
    base_sections: tuple[str, ...]
    evidence_items: tuple[str, ...]
    next_steps: tuple[str, ...]
    dynamic_questions: tuple[AssessmentQuestion, ...] = ()
    complaint_eligible: bool = True
    rti_eligible: bool = False


COMMON_QUESTIONS: tuple[AssessmentQuestion, ...] = (
    AssessmentQuestion("incident_date", "Incident date", "date"),
    AssessmentQuestion("incident_location", "Incident location", "text"),
    AssessmentQuestion("description", "Incident description", "textarea"),
    AssessmentQuestion(
        "urgency",
        "Urgency level",
        "select",
        options=("low", "medium", "high", "emergency"),
    ),
    AssessmentQuestion("physical_harm", "Physical harm occurred", "boolean", required=False),
    AssessmentQuestion(
        "money_or_property", "Money or property involved", "boolean", required=False
    ),
    AssessmentQuestion("digital_evidence", "Digital evidence available", "boolean", required=False),
    AssessmentQuestion("minor_involved", "Minor involved", "boolean", required=False),
    AssessmentQuestion("accused_known", "Accused person is known", "boolean", required=False),
    AssessmentQuestion("police_contacted", "Police were contacted", "boolean", required=False),
    AssessmentQuestion(
        "documents_available", "Supporting documents available", "boolean", required=False
    ),
    AssessmentQuestion("preferred_language", "Preferred language", "text", required=False),
)


CATEGORY_RULES: dict[str, CategoryRule] = {
    "theft": CategoryRule(
        key="theft",
        label="Theft",
        description="Property was taken without consent.",
        base_sections=("BNS Section 303 - Theft", "BNS Section 317 - Stolen property"),
        evidence_items=("Ownership proof", "Purchase invoices", "CCTV or witness details"),
        next_steps=(
            "Preserve proof of ownership.",
            "Record when and where the item was last seen.",
        ),
    ),
    "assault": CategoryRule(
        key="assault",
        label="Assault",
        description="Physical force, hurt, or threat of hurt.",
        base_sections=(
            "BNS Section 115 - Voluntarily causing hurt",
            "BNS Section 118 - Grievous hurt",
        ),
        evidence_items=("Medical report", "Photographs of injuries", "Witness names"),
        next_steps=("Seek medical help if needed.", "Keep medical records and photographs."),
    ),
    "harassment": CategoryRule(
        key="harassment",
        label="Harassment",
        description="Repeated unwanted contact, intimidation, or abusive conduct.",
        base_sections=(
            "BNS Section 351 - Criminal intimidation",
            "BNS Section 352 - Intentional insult",
        ),
        evidence_items=("Message screenshots", "Call logs", "Witness details"),
        next_steps=("Preserve communication records.", "Avoid deleting messages or call logs."),
    ),
    "domestic_violence": CategoryRule(
        key="domestic_violence",
        label="Domestic violence",
        description="Abuse or violence within a domestic relationship.",
        base_sections=(
            "Protection of Women from Domestic Violence Act Section 12",
            "BNS Section 85 - Cruelty",
        ),
        evidence_items=("Medical records", "Photos or messages", "Prior complaint details"),
        next_steps=("Consider contacting a protection officer or local support service.",),
        dynamic_questions=(
            AssessmentQuestion(
                "shared_household", "Shared household involved", "boolean", required=False
            ),
        ),
    ),
    "cyber_fraud": CategoryRule(
        key="cyber_fraud",
        label="Cyber fraud",
        description="Online deception, payment fraud, or impersonation.",
        base_sections=("BNS Section 318 - Cheating", "Information Technology Act Section 66D"),
        evidence_items=("Transaction IDs", "Screenshots", "Bank or wallet statements"),
        next_steps=("Preserve transaction references.", "Consider contacting the bank promptly."),
        dynamic_questions=(
            AssessmentQuestion(
                "transaction_amount", "Approximate transaction amount", "text", required=False
            ),
            AssessmentQuestion("platform_name", "Platform or app involved", "text", required=False),
        ),
    ),
    "online_harassment": CategoryRule(
        key="online_harassment",
        label="Online harassment",
        description="Threats, stalking, or abuse through digital channels.",
        base_sections=(
            "BNS Section 351 - Criminal intimidation",
            "Information Technology Act Section 67",
        ),
        evidence_items=("Profile URLs", "Screenshots", "Message timestamps"),
        next_steps=(
            "Capture URLs and timestamps.",
            "Use platform reporting tools where appropriate.",
        ),
    ),
    "road_accident": CategoryRule(
        key="road_accident",
        label="Road accident",
        description="Traffic accident, injury, vehicle damage, or insurance support.",
        base_sections=("BNS Section 281 - Rash driving", "Motor Vehicles Act claim provisions"),
        evidence_items=("Vehicle number", "Insurance papers", "Medical and repair records"),
        next_steps=("Collect vehicle and insurance details.", "Keep medical and repair bills."),
    ),
    "property_dispute": CategoryRule(
        key="property_dispute",
        label="Property dispute",
        description="Dispute about land, possession, rent, or property documents.",
        base_sections=("Specific Relief Act remedies", "Transfer of Property Act records"),
        evidence_items=("Title documents", "Revenue records", "Possession proof"),
        next_steps=(
            "Collect title and possession documents.",
            "Avoid informal transfers or signatures.",
        ),
        complaint_eligible=False,
    ),
    "consumer_complaint": CategoryRule(
        key="consumer_complaint",
        label="Consumer complaint",
        description="Defective goods, deficient service, refund, or billing dispute.",
        base_sections=("Consumer Protection Act Section 35",),
        evidence_items=("Invoice", "Warranty or service terms", "Email or chat history"),
        next_steps=("Send a written grievance to the seller or service provider.",),
        dynamic_questions=(
            AssessmentQuestion("seller_name", "Seller or service provider", "text", required=False),
            AssessmentQuestion(
                "purchase_amount", "Purchase or service amount", "text", required=False
            ),
        ),
    ),
    "police_inaction": CategoryRule(
        key="police_inaction",
        label="Police inaction",
        description="Police complaint not received, acknowledged, or acted on.",
        base_sections=("BNSS complaint escalation provisions",),
        evidence_items=("Complaint copy", "Acknowledgement number", "Dates of police contact"),
        next_steps=("Keep copies of written complaints.", "Escalate with documented chronology."),
    ),
    "missing_person": CategoryRule(
        key="missing_person",
        label="Missing person",
        description="A person cannot be located and safety may be at risk.",
        base_sections=("Police missing person report process",),
        evidence_items=("Recent photograph", "Last known location", "Phone and contact details"),
        next_steps=("Contact local police promptly.", "Share recent photo and last known details."),
    ),
    "workplace_harassment": CategoryRule(
        key="workplace_harassment",
        label="Workplace harassment",
        description="Harassment or misconduct at work.",
        base_sections=("POSH Act complaint process", "BNS Section 351 - Criminal intimidation"),
        evidence_items=("HR emails", "Witness details", "Internal complaint record"),
        next_steps=("Check internal complaints committee availability.",),
        dynamic_questions=(
            AssessmentQuestion("employer_name", "Employer or organization", "text", required=False),
        ),
    ),
    "rti_request": CategoryRule(
        key="rti_request",
        label="RTI request",
        description="Seeking records or information from a public authority.",
        base_sections=("Right to Information Act Section 6",),
        evidence_items=("Public authority name", "Information requested", "Relevant dates"),
        next_steps=("Identify the public authority that holds the information.",),
        complaint_eligible=False,
        rti_eligible=True,
    ),
    "cheque_bounce": CategoryRule(
        key="cheque_bounce",
        label="Cheque bounce",
        description="Dishonoured cheque or unpaid cheque amount.",
        base_sections=("Negotiable Instruments Act Section 138",),
        evidence_items=("Cheque copy", "Bank return memo", "Notice proof"),
        next_steps=("Track limitation dates carefully.", "Preserve bank memo and notice records."),
    ),
    "defamation": CategoryRule(
        key="defamation",
        label="Defamation",
        description="False statement harming reputation.",
        base_sections=("BNS defamation provisions",),
        evidence_items=("Copy of statement", "Publication details", "Harm details"),
        next_steps=("Preserve the exact words and publication context.",),
    ),
    "document_loss": CategoryRule(
        key="document_loss",
        label="Document loss",
        description="Lost identity, property, education, or official document.",
        base_sections=("Police lost document report process",),
        evidence_items=("Document number", "Old photocopy", "Loss location details"),
        next_steps=("Prepare a lost document report and replacement request.",),
    ),
    "threat_intimidation": CategoryRule(
        key="threat_intimidation",
        label="Threat or intimidation",
        description="Threat of harm, coercion, or intimidation.",
        base_sections=("BNS Section 351 - Criminal intimidation",),
        evidence_items=("Threat messages", "Call logs", "Witness details"),
        next_steps=(
            "Preserve threats with timestamps.",
            "Seek urgent help if there is immediate risk.",
        ),
    ),
    "public_authority_grievance": CategoryRule(
        key="public_authority_grievance",
        label="Public authority grievance",
        description="Grievance involving a public office or government service.",
        base_sections=("Administrative grievance process", "Right to Information Act Section 6"),
        evidence_items=(
            "Application copy",
            "Receipt or reference number",
            "Department correspondence",
        ),
        next_steps=("Keep a timeline of applications and replies.",),
        rti_eligible=True,
    ),
}


def list_categories() -> list[dict[str, object]]:
    return [
        {
            "key": rule.key,
            "label": rule.label,
            "description": rule.description,
            "questions": [
                question_to_dict(question) for question in questions_for_category(rule.key)
            ],
        }
        for rule in CATEGORY_RULES.values()
    ]


def questions_for_category(category_key: str) -> tuple[AssessmentQuestion, ...]:
    rule = CATEGORY_RULES.get(category_key)
    if rule is None:
        return COMMON_QUESTIONS

    return COMMON_QUESTIONS + rule.dynamic_questions


def question_to_dict(question: AssessmentQuestion) -> dict[str, object]:
    return {
        "key": question.key,
        "label": question.label,
        "input_type": question.input_type,
        "required": question.required,
        "options": list(question.options),
        "help_text": question.help_text,
    }


def analyze_assessment(
    *,
    issue_category: str,
    state: str | None,
    district: str | None,
    answers: dict[str, object],
) -> dict[str, object]:
    rule = CATEGORY_RULES.get(issue_category)
    if rule is None:
        rule = CATEGORY_RULES["public_authority_grievance"]

    confidence = _confidence_for_answers(answers)
    suggested_sections = [
        {
            "section": section,
            "confidence": confidence,
            "rationale": _section_rationale(rule, answers),
        }
        for section in rule.base_sections
    ]
    evidence = _evidence_for_answers(rule, answers)
    next_steps = _next_steps_for_answers(rule, answers)
    location = ", ".join(part for part in (district, state) if part)
    location_suffix = f" in {location}" if location else ""
    summary = (
        f"Based on the selected {rule.label.lower()} issue{location_suffix}, Themis found "
        f"informational matches with {confidence} confidence. These are starting points "
        "for review, not a legal conclusion."
    )

    return {
        "ruleset_version": ASSESSMENT_RULESET_VERSION,
        "suggested_categories": [rule.key],
        "section_suggestions": suggested_sections,
        "suggested_sections": [item["section"] for item in suggested_sections],
        "evidence_checklist": evidence,
        "next_steps": next_steps,
        "result_summary": summary,
        "complaint_eligible": rule.complaint_eligible,
        "rti_eligible": rule.rti_eligible,
        "legal_aid_recommended": _legal_aid_recommended(answers),
    }


def _confidence_for_answers(answers: dict[str, object]) -> ConfidenceLabel:
    score = 0
    for key in ("description", "incident_date", "incident_location"):
        if str(answers.get(key) or "").strip():
            score += 1
    if bool(answers.get("documents_available")):
        score += 1
    if bool(answers.get("digital_evidence")):
        score += 1
    if bool(answers.get("physical_harm")):
        score += 1

    if score >= 5:
        return "high"
    if score >= 3:
        return "medium"
    return "low"


def _section_rationale(rule: CategoryRule, answers: dict[str, object]) -> str:
    signals: list[str] = [rule.label]
    if bool(answers.get("physical_harm")):
        signals.append("physical harm")
    if bool(answers.get("money_or_property")):
        signals.append("money or property involvement")
    if bool(answers.get("digital_evidence")):
        signals.append("digital evidence")
    if bool(answers.get("minor_involved")):
        signals.append("minor involvement")

    return "Matched from: " + ", ".join(signals) + "."


def _evidence_for_answers(
    rule: CategoryRule,
    answers: dict[str, object],
) -> list[dict[str, object]]:
    items = [
        {"label": item, "required": True, "reason": "Category-specific supporting material."}
        for item in rule.evidence_items
    ]
    conditional_items: list[tuple[str, str, bool]] = [
        ("Medical records", "Physical harm was indicated.", bool(answers.get("physical_harm"))),
        (
            "Digital screenshots and URLs",
            "Digital evidence was indicated.",
            bool(answers.get("digital_evidence")),
        ),
        (
            "Police diary or acknowledgement",
            "Police contact was indicated.",
            bool(answers.get("police_contacted")),
        ),
        (
            "Guardian or minor details",
            "A minor was indicated.",
            bool(answers.get("minor_involved")),
        ),
        ("Identity and address proof", "Useful for complaint and case records.", True),
    ]
    for label, reason, include in conditional_items:
        if include and label not in {str(item["label"]) for item in items}:
            items.append({"label": label, "required": False, "reason": reason})

    return items


def _next_steps_for_answers(rule: CategoryRule, answers: dict[str, object]) -> list[str]:
    steps = list(rule.next_steps)
    urgency = str(answers.get("urgency") or "").lower()
    if urgency == "emergency":
        steps.insert(
            0, "Contact emergency services or the nearest appropriate authority immediately."
        )
    if not bool(answers.get("documents_available")):
        steps.append("Prepare a written timeline while details are fresh.")
    steps.append("Review suggestions with a qualified lawyer or relevant authority before acting.")
    return steps


def _legal_aid_recommended(answers: dict[str, object]) -> bool:
    return (
        str(answers.get("urgency") or "").lower() in {"high", "emergency"}
        or bool(answers.get("minor_involved"))
        or bool(answers.get("physical_harm"))
    )


def build_complaint_draft(
    *,
    fields: dict[str, object],
    assessment_result: dict[str, object] | None = None,
) -> str:
    section_suggestions = _object_list(
        assessment_result.get("section_suggestions", []) if assessment_result else []
    )
    possible_sections = fields.get("possible_sections") or [
        item.get("section") for item in section_suggestions if isinstance(item, dict)
    ]
    evidence = fields.get("evidence") or []
    if assessment_result and not evidence:
        checklist = _object_list(assessment_result.get("evidence_checklist", []))
        evidence = [item.get("label") for item in checklist if isinstance(item, dict)]

    incident_date_time = (
        fields.get("incident_date_time") or fields.get("incident_date") or "[Date and time]"
    )
    requested_action = (
        fields.get("requested_action")
        or "Please receive this complaint, record it as appropriate, and take action "
        "under applicable law."
    )
    disclaimer = (
        "Disclaimer: This is an informational draft for review. It is not legal advice "
        "and should be checked before submission."
    )

    return "\n".join(
        [
            "Draft Complaint / FIR Support Information",
            "",
            f"To: {fields.get('authority_name') or 'The appropriate authority'}",
            "",
            "Complainant details",
            f"Name: {fields.get('complainant_name') or '[Complainant name]'}",
            f"Address: {fields.get('address') or '[Address]'}",
            f"Phone: {fields.get('phone') or '[Phone]'}",
            f"Email: {fields.get('email') or '[Email]'}",
            "",
            "Incident details",
            f"Date and time: {incident_date_time}",
            f"Location: {fields.get('incident_location') or '[Incident location]'}",
            f"Accused details: {fields.get('accused_details') or '[If known]'}",
            "",
            "Statement of facts",
            str(
                fields.get("incident_description")
                or fields.get("description")
                or "[Describe the incident]"
            ),
            "",
            "Witnesses",
            str(fields.get("witnesses") or "[Witness names and contact details, if any]"),
            "",
            "Evidence and attachments",
            _format_list(evidence),
            "",
            "Possible legal references for review",
            _format_list(possible_sections),
            "",
            "Requested action",
            str(requested_action),
            "",
            f"Place: {fields.get('place') or '[Place]'}",
            "Date: [Date]",
            "Signature: ____________________",
            "",
            disclaimer,
        ]
    )


def _format_list(value: object) -> str:
    if isinstance(value, list) and value:
        return "\n".join(f"- {item}" for item in value if item)
    if isinstance(value, str) and value.strip():
        return value
    return "- [Add details]"


def _object_list(value: object) -> list[object]:
    if isinstance(value, list):
        return value
    return []
