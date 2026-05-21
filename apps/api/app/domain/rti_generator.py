from dataclasses import dataclass


@dataclass(frozen=True)
class RTIDraftInput:
    public_authority: str
    department: str | None
    information_requested: str
    time_period: str | None
    preferred_response_format: str | None
    bpl_status: bool | None
    applicant_name: str | None
    applicant_address: str | None


def build_rti_draft(fields: RTIDraftInput) -> str:
    department_line = f"\nDepartment: {fields.department}" if fields.department else ""
    time_period_line = f"\nTime period: {fields.time_period}" if fields.time_period else ""
    response_format = fields.preferred_response_format or "certified copies / written reply"
    bpl_line = (
        "I state that I am below the poverty line and request fee waiver under the RTI rules."
        if fields.bpl_status
        else "I am ready to pay the prescribed RTI application fee and copying charges."
    )
    applicant_name = fields.applicant_name or "[Applicant name]"
    applicant_address = fields.applicant_address or "[Applicant address]"

    return f"""To,
The Public Information Officer
{fields.public_authority}{department_line}

Subject: Application under the Right to Information Act, 2005

Respected Sir/Madam,

I request the following information under Section 6(1) of the Right to Information Act, 2005:

{fields.information_requested.strip()}
{time_period_line}

I request that the information be provided in the following format: {response_format}.

{bpl_line}

Applicant details:
Name: {applicant_name}
Address: {applicant_address}

Date: [Date]
Place: [Place]

Yours faithfully,
{applicant_name}
"""
