# Product Requirements Document
# Themis — Indian Legal Aid, Legal Knowledge & Case Support Platform

## Document Information

| Field | Details |
|---|---|
| Product Name | Themis |
| Product Type | Legal aid, legal knowledge, document management, and case-support platform |
| Primary Region | India |
| Target Users | Citizens, Lawyers, Admins, Legal Aid Organizations |
| Document Version | 2.0 — Revised Production-Oriented PRD |
| Primary Goal | Help Indian citizens understand legal issues, prepare structured legal documents, connect with verified legal aid, and manage case-related information securely |
| Project Suitability | MCA / Final-Year Major Project, scalable into real-world pilot |
| Recommended Architecture | Modular monolith with background workers and clean service boundaries |
| Recommended Deployment | AWS Mumbai region using ECS/Fargate for production; Docker Compose for local development |

---

## 1. Executive Summary

Themis is a full-stack Indian legal aid and legal knowledge platform designed to help citizens understand legal provisions, assess legal issues, generate structured complaint and RTI drafts, connect with verified lawyers, organize case documents, track hearings, and receive reminders.

The platform does **not** replace lawyers, courts, police stations, or official government portals. It acts as a legal empowerment, documentation, and workflow-support layer.

This revised PRD upgrades Themis from an academic full-stack project into a more production-ready legal-tech system by introducing:

1. Managed authentication instead of fully custom authentication.
2. Secure private object storage for legal documents.
3. Durable background processing for OCR, reminders, exports, and notifications.
4. PostgreSQL-first legal search with a path to OpenSearch later.
5. Clear API separation between REST write flows and optional GraphQL read aggregation.
6. Stronger privacy, security, audit, and compliance controls.
7. A deployment model that avoids premature Kubernetes while still remaining scalable.
8. A phased roadmap suitable for both MCA project delivery and future real-world pilot.

---

## 2. Product Vision

Themis should become a citizen-focused legal support platform that makes legal information, legal workflows, and case organization more accessible to ordinary Indian users.

The long-term product vision is to create a platform where citizens can:

1. Search and understand Indian laws in plain language.
2. Identify possible legal categories related to their issue.
3. Prepare complaint or FIR-support drafts.
4. Generate RTI applications.
5. Request help from verified legal aid or pro-bono lawyers.
6. Maintain a secure digital record of legal documents.
7. Track hearings and deadlines.
8. Receive timely reminders.
9. Share structured case information with assigned lawyers.
10. Build a complete legal matter timeline.

---

## 3. Problem Statement

Indian citizens often face difficulty accessing legal support because:

1. Legal language is difficult for non-lawyers to understand.
2. People may not know which law applies to their situation.
3. FIR and complaint preparation can be confusing.
4. Legal aid access is fragmented.
5. Citizens may not know how to find verified pro-bono or affordable lawyers.
6. Case documents are often scattered across WhatsApp, email, physical files, and mobile storage.
7. Hearing dates and legal deadlines may be missed.
8. RTI application formats are unfamiliar to many people.
9. Legal information online is often unstructured, outdated, or hard to verify.
10. Lawyers often receive incomplete case information from citizens.

Themis addresses these problems by combining legal knowledge, guided issue assessment, draft generation, lawyer matching, case management, document storage, OCR, hearing tracking, and reminders into one unified platform.

---

## 4. Product Positioning

Themis is not:

1. A replacement for professional legal advice.
2. A direct FIR filing platform.
3. A direct court integration platform in the first version.
4. A paid lawyer marketplace in the MVP.
5. An AI legal judge or final legal decision system.

Themis is:

1. A legal awareness platform.
2. A guided legal workflow assistant.
3. A legal document preparation tool.
4. A case organization system.
5. A legal aid coordination platform.
6. A secure document repository.
7. A citizen-lawyer collaboration layer.

---

## 5. Target Users

### 5.1 Citizen Users

Citizens who need help understanding laws, preparing complaints, generating RTI applications, organizing legal documents, or requesting legal aid.

### 5.2 Lawyers

Lawyers who want to provide legal aid or pro-bono support, receive structured case requests, manage assigned cases, update hearing outcomes, and review citizen-uploaded documents.

### 5.3 Admin Users

Platform administrators responsible for verifying lawyers, maintaining legal content, moderating activity, reviewing audit logs, and monitoring system health.

### 5.4 Legal Aid Organizations

NGOs, law college legal aid cells, and public interest groups that may use the platform to coordinate legal assistance.

---

## 6. User Personas

### 6.1 Citizen Seeking Legal Guidance

| Field | Details |
|---|---|
| Name | Anjali |
| Age | 28 |
| Location | Kerala |
| Goal | Understand whether her issue can be reported and what legal steps may apply |
| Pain Point | Legal language is confusing and she does not know how to prepare a complaint |
| Themis Benefit | Guided issue assessment, law search, complaint draft generation, legal aid request |

### 6.2 Pro-Bono Lawyer

| Field | Details |
|---|---|
| Name | Advocate Rajesh |
| Age | 42 |
| Location | Delhi |
| Goal | Help citizens with structured legal aid requests |
| Pain Point | Citizens often approach with incomplete facts or missing documents |
| Themis Benefit | Structured case intake, document repository, hearing tracker, case notes |

### 6.3 RTI Applicant

| Field | Details |
|---|---|
| Name | Fathima |
| Age | 35 |
| Location | Kozhikode |
| Goal | Request information from a public authority |
| Pain Point | Does not know the correct RTI application structure |
| Themis Benefit | RTI generator, PDF export, filing checklist |

### 6.4 Admin / Legal Aid Coordinator

| Field | Details |
|---|---|
| Name | Meera |
| Age | 33 |
| Location | Bengaluru |
| Goal | Verify lawyers and monitor legal aid activity |
| Pain Point | Manual verification and case allocation are inefficient |
| Themis Benefit | Verification queue, audit logs, platform metrics, moderation controls |

---

## 7. Product Goals

### 7.1 Primary Goals

1. Provide a searchable Indian legal knowledge base.
2. Convert complex legal sections into plain-language explanations.
3. Help users assess legal issues through guided questions.
4. Generate structured complaint and FIR-support drafts.
5. Generate structured RTI applications.
6. Connect citizens with verified legal aid or pro-bono lawyers.
7. Enable case creation, status tracking, and hearing management.
8. Provide a secure document repository for case-related files.
9. Extract searchable text from uploaded documents using OCR.
10. Send hearing reminders and legal aid workflow notifications.
11. Provide admin tools for lawyer verification and content moderation.

### 7.2 Secondary Goals

1. Support future mobile app integration.
2. Support future multilingual legal explainers.
3. Support future AI-assisted legal summarization with strict disclaimers.
4. Support future integration with legal aid organizations.
5. Support future integration with public legal datasets.
6. Support analytics for legal aid demand by issue type and region.

---

## 8. Scope

### 8.1 In Scope for Full Version

1. Citizen registration and login.
2. Lawyer registration and login.
3. Admin login and access control.
4. Role-based access control.
5. Legal knowledge database.
6. Plain-language legal explanations.
7. Legal issue assessment flow.
8. Complaint and FIR-support draft generation.
9. RTI application generation.
10. Case creation and case timeline.
11. Hearing tracking and reminder scheduling.
12. Lawyer profile creation.
13. Lawyer verification workflow.
14. Legal aid matching.
15. Secure document upload and access.
16. OCR for uploaded documents.
17. Notification system.
18. Admin control module.
19. REST API.
20. Optional GraphQL read layer.
21. Audit logging.
22. Observability and monitoring.

### 8.2 Out of Scope for Initial Version

1. Direct FIR filing with police portals.
2. Direct e-Courts integration.
3. Payment gateway.
4. Paid lawyer marketplace.
5. Video consultation.
6. Real-time chat.
7. Aadhaar-based identity verification.
8. Digital signature integration.
9. Advanced AI legal reasoning.
10. Native mobile application.
11. Full multilingual content.
12. Automated legal advice without lawyer review.

---

## 9. Recommended Technology Stack

### 9.1 Stack Philosophy

Themis should use a stack that is:

1. Strong enough for a real pilot launch.
2. Practical for a student or small engineering team.
3. Secure for sensitive legal data.
4. Easy to deploy locally and in cloud.
5. Modular without unnecessary microservice complexity.
6. Compatible with future OCR, NLP, AI, and mobile app expansion.

The recommended architecture is a **modular monolith**: one main backend application with clear internal modules, supported by background workers, a relational database, object storage, cache, and message broker.

This is better than starting with microservices because Themis needs strong domain consistency across users, cases, documents, hearings, and legal aid requests. Microservices can be introduced later only if scaling or team boundaries justify it.

---

## 10. Final Recommended Stack

### 10.1 Frontend

| Layer | Recommended Technology | Purpose |
|---|---|---|
| Framework | Next.js App Router | Server-rendered and client-rendered web application |
| Language | TypeScript | Type safety and maintainability |
| UI Styling | Tailwind CSS | Fast, consistent styling |
| UI Components | Shadcn UI | Accessible reusable components |
| Forms | React Hook Form | Complex legal forms and validations |
| Validation | Zod | Shared client-side validation schemas |
| API State | TanStack Query | Server state, caching, retries, pagination |
| Tables | TanStack Table | Admin, lawyer, and case listing tables |
| Charts | Recharts | Admin metrics and dashboard charts |
| PDF Preview | Browser PDF viewer / custom viewer | Complaint, RTI, and document preview |
| Testing | Vitest + Playwright | Unit and end-to-end frontend testing |

### 10.2 Backend

| Layer | Recommended Technology | Purpose |
|---|---|---|
| Framework | FastAPI | Core REST API and backend services |
| Language | Python 3.12+ | Backend, rules, OCR, future AI/NLP integration |
| Validation | Pydantic v2 | Request/response validation |
| ORM | SQLAlchemy 2.x | Database models and queries |
| Migrations | Alembic | Version-controlled database migrations |
| Auth Integration | Amazon Cognito JWT validation | Managed user authentication |
| Authorization | App RBAC + policy checks + PostgreSQL RLS for sensitive tables | Secure role-based and row-level access |
| Background Jobs | Celery | OCR, reminders, notification delivery, exports |
| Message Broker | RabbitMQ | Durable job queue |
| Cache / Rate Limiting | Redis | Cache, throttling, ephemeral state |
| GraphQL | Strawberry GraphQL | Optional read aggregation layer |
| PDF Generation | WeasyPrint or ReportLab | Complaint and RTI PDF generation |
| OCR | Amazon Textract in production; Tesseract fallback for development | Document text extraction |
| Testing | Pytest | Backend unit and integration tests |
| Code Quality | Ruff + MyPy | Linting, formatting, type checking |

### 10.3 Database and Storage

| Layer | Recommended Technology | Purpose |
|---|---|---|
| Primary Database | PostgreSQL | Transactional system of record |
| Search | PostgreSQL Full-Text Search + pg_trgm | Initial legal search and fuzzy search |
| Future Search Upgrade | OpenSearch | Advanced relevance, faceting, large-scale search |
| Object Storage | Amazon S3 | Private legal document storage |
| Encryption | AWS KMS | Encryption at rest for documents and secrets |
| Secrets | AWS Secrets Manager | Database credentials and API secrets |
| Backups | RDS automated backups + S3 lifecycle policies | Recovery and retention |

### 10.4 Infrastructure and DevOps

| Layer | Recommended Technology | Purpose |
|---|---|---|
| Local Development | Docker Compose | Local stack with API, frontend, DB, Redis, RabbitMQ, workers |
| Production Cloud | AWS Mumbai Region | India-region deployment |
| Container Runtime | AWS ECS on Fargate | Serverless container deployment |
| Database Hosting | Amazon RDS for PostgreSQL | Managed PostgreSQL |
| Cache Hosting | Amazon ElastiCache for Redis | Managed Redis |
| File Storage | Amazon S3 | Private document storage |
| Email | Amazon SES | Email notifications |
| SMS | Amazon SNS / third-party SMS provider | SMS reminders when budget allows |
| CDN / Edge | CloudFront | Frontend delivery and secure file access patterns |
| Protection | AWS WAF | Basic web attack protection |
| Infrastructure as Code | Terraform | Repeatable cloud infrastructure |
| CI/CD | GitHub Actions + OIDC to AWS | Secure deployments without long-lived credentials |
| Observability | OpenTelemetry + ADOT + CloudWatch + X-Ray | Logs, metrics, traces, and error investigation |

### 10.5 Why Not Kubernetes Initially?

Kubernetes is powerful, but it adds operational complexity. Themis does not need Kubernetes in the first production-ready version because:

1. The backend can run as a small number of containers.
2. Workers can scale separately on ECS/Fargate.
3. Database, cache, storage, identity, email, and monitoring can be managed services.
4. The team is likely small.
5. The system benefits more from product correctness and security than platform complexity.

Kubernetes may be introduced later if Themis grows into many independent services, multiple teams, custom deployment requirements, or large-scale organization deployments.

---

## 11. High-Level System Architecture

```text
Users
  |
  v
CloudFront + WAF
  |
  v
Next.js Frontend
  |
  |---- Cognito Hosted Auth / Auth Flows
  |
  v
FastAPI Backend
  |
  |---- User Service
  |---- Legal Knowledge Service
  |---- Assessment Service
  |---- Complaint Service
  |---- Case Service
  |---- Hearing Service
  |---- Lawyer Matching Service
  |---- Document Service
  |---- RTI Service
  |---- Notification Service
  |---- Admin Service
  |
  |---- PostgreSQL / RDS
  |---- Redis / ElastiCache
  |---- RabbitMQ
  |---- S3 Private Buckets
  |
  v
Celery Workers
  |
  |---- OCR Worker
  |---- Reminder Worker
  |---- Notification Worker
  |---- PDF Export Worker
  |---- Digest Worker
  |
  v
External Services
  |---- Amazon Textract
  |---- Amazon SES
  |---- SMS Provider / SNS
  |---- CloudWatch / X-Ray
```

---

## 12. Core Product Modules

Themis will be divided into the following modules:

1. User & Role Management.
2. Legal Knowledge Module.
3. Legal Issue Assessment Module.
4. Complaint & FIR Assistance Module.
5. Case Management Module.
6. Hearing Tracking Module.
7. Legal Aid Matching Module.
8. Secure Document Repository.
9. RTI Application Generator.
10. Notification & Reminder System.
11. Admin Control Module.
12. Analytics & Metrics Module.
13. Optional GraphQL Read Layer.

---

# Module 1: User & Role Management

## 13.1 Description

This module manages identity, profiles, roles, authentication state, and authorization.

Authentication should be handled by a managed identity provider in production. The backend should not directly store user passwords in the production architecture. Instead, it should validate Cognito-issued JWTs and maintain application-specific profiles and roles in PostgreSQL.

For local academic development, a simple local-auth mode may be implemented behind a feature flag, but the production-oriented design should use managed authentication.

## 13.2 User Roles

| Role | Description |
|---|---|
| Citizen | Can search laws, assess issues, create cases, upload documents, request legal aid, generate RTI applications |
| Lawyer | Can create lawyer profile, accept or decline case requests, manage assigned cases, update hearing outcomes |
| Admin | Can verify lawyers, manage legal content, review audit logs, suspend accounts, monitor platform activity |
| Legal Aid Organization User | Can coordinate assigned cases and view organization-level dashboards in future versions |

## 13.3 Citizen Registration Requirements

Citizen users should provide:

1. Full name.
2. Email address.
3. Phone number.
4. State.
5. District.
6. Preferred language.
7. Optional address.
8. Optional emergency contact.

## 13.4 Lawyer Registration Requirements

Lawyer users should provide:

1. Full name.
2. Email address.
3. Phone number.
4. Bar Council registration number.
5. State Bar Council.
6. District of practice.
7. Specializations.
8. Languages known.
9. Pro-bono availability.
10. Maximum active legal aid cases.
11. Availability schedule.
12. Verification documents, if required.

## 13.5 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| URM-001 | Users shall be able to register as citizen or lawyer | High |
| URM-002 | Users shall be able to log in using managed authentication | High |
| URM-003 | Backend shall validate JWTs issued by the identity provider | High |
| URM-004 | System shall maintain app-level user profiles in PostgreSQL | High |
| URM-005 | System shall enforce role-based access control | High |
| URM-006 | Lawyer accounts shall require admin verification before receiving cases | High |
| URM-007 | Users shall be able to update their profile | Medium |
| URM-008 | Admins shall be able to suspend or reactivate accounts | Medium |
| URM-009 | Admin and lawyer-sensitive flows shall support MFA in production | High |
| URM-010 | Authentication events shall be logged for audit and security review | Medium |

## 13.6 Acceptance Criteria

1. A citizen can register and access citizen features.
2. A lawyer can register but cannot receive case requests until verified.
3. Admin can approve or reject lawyer profiles.
4. Unauthorized users cannot access protected routes.
5. JWT validation is enforced on protected APIs.
6. Role-specific dashboard data is isolated.
7. Sensitive admin actions are logged.

---

# Module 2: Legal Knowledge Module

## 14.1 Description

The Legal Knowledge Module provides a structured database of Indian legal provisions with plain-language explanations.

It should help users understand:

1. What a legal section means.
2. What type of conduct it applies to.
3. What consequences may follow.
4. Whether the issue may be civil, criminal, consumer, cyber, family, property, or RTI-related.
5. What related provisions may be relevant.

## 14.2 Initial Legal Data Categories

The first version should include curated records for:

1. Bharatiya Nyaya Sanhita provisions.
2. IPC legacy references for comparison.
3. Right to Information Act.
4. Motor Vehicles Act.
5. Information Technology Act.
6. Consumer Protection Act.
7. Protection of Women from Domestic Violence Act.
8. POCSO Act.
9. SC/ST Prevention of Atrocities Act.
10. Basic criminal procedure references.
11. Common cybercrime provisions.
12. Common property and civil dispute references.
13. Cheque bounce and negotiable instrument references.
14. Workplace harassment references.

## 14.3 Law Section Fields

Each law section should contain:

1. Act name.
2. Section number.
3. Section title.
4. Original legal text or summarized legal description.
5. Plain-language explanation.
6. Example scenarios.
7. Punishment or consequence.
8. Bailable/non-bailable status where applicable.
9. Cognizable/non-cognizable status where applicable.
10. Related sections.
11. Mapping to older IPC provisions where applicable.
12. Category tags.
13. Jurisdiction notes.
14. Source reference.
15. Last reviewed date.
16. Review status.
17. Search vector.

## 14.4 Search Requirements

Users should be able to search by:

1. Keyword.
2. Act name.
3. Section number.
4. Issue category.
5. Plain-language phrase.
6. Bailable/non-bailable filter.
7. Criminal/civil/consumer/cyber/family/property category.
8. Related issue tags.

Initial search should use PostgreSQL Full-Text Search and `pg_trgm` fuzzy search. OpenSearch should be introduced only if the system grows beyond PostgreSQL search capabilities or requires advanced relevance tuning and facets.

## 14.5 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| LKM-001 | Users shall be able to search legal sections by keyword | High |
| LKM-002 | Users shall be able to search by act name | High |
| LKM-003 | Users shall be able to search by section number | High |
| LKM-004 | Each section shall show plain-language explanation | High |
| LKM-005 | Each section shall show punishment or consequence where applicable | High |
| LKM-006 | Users shall be able to view related sections | Medium |
| LKM-007 | Admins shall be able to create, update, disable, and review law records | High |
| LKM-008 | Search shall support PostgreSQL full-text search | High |
| LKM-009 | Search shall support typo-tolerant matching using trigram similarity | Medium |
| LKM-010 | Users shall be able to bookmark legal sections | Low |
| LKM-011 | Legal content shall include last-reviewed metadata | Medium |

## 14.6 Acceptance Criteria

1. User can search laws using a keyword.
2. Search results display act name, section number, title, category, and short explanation.
3. User can open a section detail page.
4. Section detail page shows plain-language explanation, metadata, examples, and related sections.
5. Admin can update legal content.
6. Search results respond within the target latency for seeded data.

---

# Module 3: Legal Issue Assessment Module

## 15.1 Description

The Legal Issue Assessment Module is a guided questionnaire that helps users identify possible legal categories and related legal provisions.

This module must not provide final legal advice. It should generate informational suggestions, evidence checklists, and recommended next steps.

## 15.2 Supported Issue Categories

The first version should support:

1. Theft.
2. Assault.
3. Harassment.
4. Domestic violence.
5. Cyber fraud.
6. Online harassment.
7. Road accident.
8. Property dispute.
9. Consumer complaint.
10. Police inaction.
11. Missing person.
12. Workplace harassment.
13. RTI request.
14. Cheque bounce.
15. Defamation.
16. Document loss.
17. Threat or intimidation.
18. Public authority grievance.

## 15.3 User Input Fields

The assessment flow should collect:

1. Issue category.
2. State and district.
3. Incident date.
4. Incident location.
5. Description of incident.
6. Whether physical harm occurred.
7. Whether money or property was involved.
8. Whether digital evidence is available.
9. Whether a minor is involved.
10. Whether accused person is known.
11. Whether police were contacted.
12. Whether documents are available.
13. Urgency level.
14. Preferred language.
15. Whether user wants to create a case.

## 15.4 Assessment Engine

The first implementation should use a rule-based engine instead of advanced AI legal reasoning.

The rules should map:

1. Issue category.
2. Incident attributes.
3. Harm type.
4. Evidence type.
5. Location.
6. Vulnerability indicators.
7. User answers.

To:

1. Possible legal categories.
2. Possible legal sections.
3. Suggested next steps.
4. Evidence checklist.
5. Complaint/FIR draft eligibility.
6. RTI draft eligibility.
7. Legal aid recommendation.

## 15.5 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| LIA-001 | Users shall be able to start a guided assessment | High |
| LIA-002 | System shall ask dynamic questions based on issue type | High |
| LIA-003 | System shall suggest possible legal categories using rule-based logic | High |
| LIA-004 | System shall suggest possible legal sections with confidence labels | Medium |
| LIA-005 | System shall provide evidence checklist | High |
| LIA-006 | System shall allow saving assessment result to a case | High |
| LIA-007 | System shall show legal disclaimer before and after result generation | High |
| LIA-008 | System shall allow complaint draft generation from assessment | Medium |
| LIA-009 | System shall maintain versioned assessment rules | Medium |

## 15.6 Acceptance Criteria

1. User can complete an assessment flow.
2. System generates possible legal categories.
3. System suggests possible legal sections without claiming certainty.
4. User can save result to a case.
5. User can proceed to complaint assistance.
6. Disclaimer is clearly visible.
7. Assessment rules can be updated by developers/admins.

---

# Module 4: Complaint & FIR Assistance Module

## 16.1 Description

This module helps users prepare structured complaint or FIR-support information. It does not directly submit FIRs to police systems.

The module should produce a clean, editable draft that citizens can review, download, and submit through appropriate official channels.

## 16.2 Complaint Draft Fields

The generated draft should include:

1. Complainant name.
2. Address.
3. Phone number.
4. Email address.
5. Police station or authority name.
6. Incident date and time.
7. Incident location.
8. Accused details, if known.
9. Incident description.
10. Witnesses, if any.
11. Evidence list.
12. Possible legal sections.
13. Requested action.
14. Date.
15. Place.
16. Signature placeholder.
17. Attachments checklist.

## 16.3 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| CFA-001 | Users shall be able to generate complaint drafts | High |
| CFA-002 | Drafts shall be generated from assessment data | High |
| CFA-003 | Users shall be able to manually edit draft content | High |
| CFA-004 | Users shall be able to download complaint draft as PDF | High |
| CFA-005 | Users shall be able to save draft to case documents | Medium |
| CFA-006 | System shall show evidence checklist | High |
| CFA-007 | System shall show lawyer review recommendation | High |
| CFA-008 | System shall maintain draft version history | Low |

## 16.4 Acceptance Criteria

1. User can generate a structured complaint draft.
2. User can edit the draft before export.
3. User can export the draft as PDF.
4. User can save the draft to a case.
5. System displays disclaimer that the draft should be reviewed before submission.

---

# Module 5: Case Management Module

## 17.1 Description

The Case Management Module allows users to create and maintain legal matter records. It organizes case details, documents, hearing dates, lawyer assignments, notes, drafts, and status history.

## 17.2 Case Fields

Each case should include:

1. Case ID.
2. Citizen ID.
3. Assigned lawyer ID.
4. Case title.
5. Case category.
6. FIR number, if available.
7. Police station.
8. Court name.
9. Case number, if available.
10. Applicable legal sections.
11. Description.
12. Current status.
13. Urgency level.
14. Documents.
15. Hearings.
16. Notes.
17. Timeline events.
18. Created date.
19. Updated date.
20. Archived date.

## 17.3 Case Statuses

Suggested statuses:

1. Draft.
2. Assessment completed.
3. Complaint prepared.
4. Complaint submitted.
5. FIR filed.
6. Under investigation.
7. Legal aid requested.
8. Lawyer assigned.
9. In court.
10. Hearing scheduled.
11. Awaiting order.
12. Closed.
13. Archived.

## 17.4 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| CMM-001 | Citizen shall be able to create a case | High |
| CMM-002 | Citizen shall be able to create case from assessment result | High |
| CMM-003 | Citizen shall be able to update case details | High |
| CMM-004 | Lawyer shall be able to view assigned cases | High |
| CMM-005 | Lawyer shall be able to update assigned case notes and hearing outcomes | High |
| CMM-006 | Case shall maintain status history | High |
| CMM-007 | Case shall maintain timeline events | Medium |
| CMM-008 | Admin shall be able to review cases only when policy permits | Medium |
| CMM-009 | Unauthorized users shall not access private cases | High |
| CMM-010 | Case data access shall be logged for sensitive actions | Medium |

## 17.5 Acceptance Criteria

1. Citizen can create a case manually.
2. Citizen can create a case from assessment output.
3. Lawyer can access only assigned cases.
4. Case status can be updated.
5. Case timeline shows major updates.
6. Unauthorized access is blocked.
7. Sensitive case access is logged.

---

# Module 6: Hearing Tracking Module

## 18.1 Description

The Hearing Tracking Module tracks court hearing dates, outcomes, notes, next steps, and reminders.

## 18.2 Hearing Fields

Each hearing should include:

1. Hearing ID.
2. Case ID.
3. Hearing date.
4. Hearing time.
5. Court name.
6. Court room, if available.
7. Judge name, if available.
8. Purpose of hearing.
9. Hearing outcome.
10. Next hearing date.
11. Notes.
12. Added by.
13. Created timestamp.
14. Updated timestamp.
15. Reminder status.

## 18.3 Reminder Schedule

Default reminder rules:

1. Seven days before hearing.
2. One day before hearing.
3. Morning of hearing.

Reminder channels:

1. Email for MVP.
2. In-app notification for MVP.
3. SMS for production or budget-supported version.

## 18.4 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| HTM-001 | Users shall be able to add hearing records | High |
| HTM-002 | Users shall be able to edit hearing records | High |
| HTM-003 | Lawyers shall be able to record hearing outcomes | High |
| HTM-004 | System shall schedule hearing reminders | High |
| HTM-005 | System shall display hearing timeline | Medium |
| HTM-006 | Next hearing date shall be linked to same case | Medium |
| HTM-007 | Reminder delivery status shall be logged | Medium |
| HTM-008 | Failed reminder jobs shall be retried | High |

## 18.5 Acceptance Criteria

1. Hearing can be added to a case.
2. Reminder jobs are scheduled.
3. Lawyer can add hearing outcome.
4. Citizen can view hearing timeline.
5. Reminder delivery is logged.
6. Failed reminders are retried.

---

# Module 7: Legal Aid Matching Module

## 19.1 Description

The Legal Aid Matching Module connects citizens with verified lawyers based on location, specialization, language, pro-bono availability, urgency, and caseload.

## 19.2 Lawyer Matching Criteria

The matching algorithm should consider:

1. District match.
2. State match.
3. Legal issue category.
4. Lawyer specialization.
5. Preferred language.
6. Pro-bono availability.
7. Current active caseload.
8. Urgency level.
9. Lawyer availability schedule.
10. Past response rate.

## 19.3 Suggested Matching Score

```text
Matching Score =
  District match: 25 points
  State match: 15 points
  Specialization match: 25 points
  Language match: 10 points
  Pro-bono availability: 15 points
  Low active caseload: 10 points
  Availability match: 10 points
  Response reliability: 5 points
```

## 19.4 Match Request Statuses

1. Pending.
2. Accepted.
3. Declined.
4. Expired.
5. Cancelled.
6. Reassigned.

## 19.5 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| LAM-001 | Citizen shall be able to request legal aid for a case | High |
| LAM-002 | System shall rank verified lawyers by matching score | High |
| LAM-003 | Unverified lawyers shall not appear in matching results | High |
| LAM-004 | Lawyer shall be able to accept or decline requests | High |
| LAM-005 | Citizen shall be notified when lawyer responds | High |
| LAM-006 | Admin shall be able to manually assign lawyer | Medium |
| LAM-007 | Lawyer shall be able to pause availability | Medium |
| LAM-008 | System shall prevent excessive active case assignments | Medium |

## 19.6 Acceptance Criteria

1. Citizen can request legal aid from a case page.
2. System returns ranked lawyer suggestions.
3. Only verified lawyers are shown.
4. Lawyer can accept or decline request.
5. On acceptance, lawyer gains access to the case.
6. Citizen receives notification of lawyer response.
7. Assigned lawyer count respects availability limits.

---

# Module 8: Secure Document Repository

## 20.1 Description

The Secure Document Repository stores case-related files such as complaint drafts, FIR copies, court notices, evidence images, RTI applications, lawyer notes, and court orders.

Documents must never be publicly accessible. Production file storage should use private object storage with signed upload and download URLs.

## 20.2 Supported Document Types

1. PDF files.
2. JPEG images.
3. PNG images.
4. Text documents.
5. Scanned complaint copies.
6. Court notices.
7. FIR copies.
8. Evidence images.
9. Medical reports.
10. Police acknowledgements.
11. RTI applications.
12. Court orders.
13. Lawyer notes.

## 20.3 Document Fields

Each document should include:

1. Document ID.
2. Case ID.
3. Uploaded by.
4. Original file name.
5. Stored object key.
6. File type.
7. MIME type.
8. File size.
9. File hash.
10. OCR text.
11. OCR status.
12. Verification status.
13. Access level.
14. Malware scan status.
15. Created date.
16. Updated date.
17. Deleted/archived date.

## 20.4 OCR Pipeline

Document OCR should run asynchronously:

```text
Document uploaded
→ Metadata stored in PostgreSQL
→ File stored in private S3 bucket
→ OCR task pushed to RabbitMQ
→ Celery worker processes OCR
→ Textract or Tesseract extracts text
→ OCR text stored in PostgreSQL
→ Search index updated
→ User notified if needed
```

## 20.5 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| SDR-001 | Users shall be able to upload documents to a case | High |
| SDR-002 | System shall validate file type and file size | High |
| SDR-003 | System shall restrict document access by role and case relationship | High |
| SDR-004 | OCR shall run asynchronously for supported files | Medium |
| SDR-005 | Users shall be able to preview documents | Medium |
| SDR-006 | Users shall be able to download documents using signed URLs | Medium |
| SDR-007 | System shall maintain document audit log | High |
| SDR-008 | Sensitive files shall not be publicly accessible | High |
| SDR-009 | File hashes shall be stored for integrity checks | Medium |
| SDR-010 | Production system shall support malware scan integration | Medium |

## 20.6 Acceptance Criteria

1. User can upload supported documents.
2. Documents are linked to cases.
3. OCR task starts after upload.
4. Lawyer can view documents only for assigned cases.
5. Unauthorized document access is blocked.
6. Document access events are logged.
7. Files are served through time-limited signed URLs.

---

# Module 9: RTI Application Generator

## 21.1 Description

The RTI Application Generator helps users create structured Right to Information applications.

## 21.2 User Inputs

The user should provide:

1. Applicant name.
2. Applicant address.
3. Phone number.
4. Email address.
5. Public authority name.
6. Department name.
7. Information requested.
8. Time period for requested information.
9. Preferred response format.
10. BPL status, if applicable.
11. Date.
12. Place.

## 21.3 Generated Output

The system should generate:

1. RTI application text.
2. PDF version.
3. Filing checklist.
4. Addressing instructions.
5. Fee placeholder.
6. Signature placeholder.
7. Option to save to case documents.

## 21.4 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| RTI-001 | User shall be able to generate RTI application | High |
| RTI-002 | User shall be able to edit RTI draft before export | High |
| RTI-003 | System shall generate RTI PDF | High |
| RTI-004 | User shall be able to save RTI application to document repository | Medium |
| RTI-005 | System shall provide RTI filing checklist | Medium |
| RTI-006 | System shall allow creating RTI from case context | Low |

## 21.5 Acceptance Criteria

1. User can enter RTI details.
2. System generates formatted RTI application.
3. User can edit generated draft.
4. User can download PDF.
5. User can save RTI copy to case documents.

---

# Module 10: Notification & Reminder System

## 22.1 Description

The Notification & Reminder System sends important updates to users through email, in-app notification, and optionally SMS.

## 22.2 Notification Types

1. Hearing reminder.
2. Legal aid request sent.
3. Lawyer accepted request.
4. Lawyer declined request.
5. Case status changed.
6. Document uploaded.
7. OCR completed.
8. Lawyer verification approved.
9. Lawyer verification rejected.
10. Weekly legal update digest.
11. Admin alert.
12. Suspicious activity alert.

## 22.3 Notification Channels

1. Email.
2. In-app notification.
3. SMS.
4. Future push notifications for mobile app.

## 22.4 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| NRS-001 | System shall send hearing reminders | High |
| NRS-002 | System shall notify users about legal aid request updates | High |
| NRS-003 | System shall notify lawyers about new case requests | High |
| NRS-004 | System shall log notification delivery status | Medium |
| NRS-005 | System shall retry failed background jobs | High |
| NRS-006 | Users shall be able to manage notification preferences | Low |
| NRS-007 | System shall prevent duplicate reminder delivery | Medium |

## 22.5 Acceptance Criteria

1. Hearing reminders are sent based on scheduled dates.
2. Lawyer receives match request notification.
3. Citizen receives lawyer response notification.
4. Notification failures are logged.
5. Celery workers process background notification tasks.
6. Duplicate reminders are prevented through idempotency keys.

---

# Module 11: Admin Control Module

## 23.1 Description

The Admin Control Module allows administrators to manage users, verify lawyers, maintain legal content, moderate activity, review logs, and monitor platform health.

## 23.2 Admin Capabilities

1. View all users.
2. Search users.
3. Verify lawyer profiles.
4. Reject lawyer verification with reason.
5. Suspend users.
6. Manage legal sections.
7. Review flagged documents.
8. View active cases based on policy.
9. View notification failures.
10. View audit logs.
11. View platform metrics.
12. Manage legal update digest content.
13. Review system health.
14. Export operational reports.

## 23.3 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| ACM-001 | Admin shall be able to view pending lawyer verifications | High |
| ACM-002 | Admin shall be able to approve or reject lawyers | High |
| ACM-003 | Admin shall be able to create and update law sections | High |
| ACM-004 | Admin shall be able to suspend users | Medium |
| ACM-005 | Admin shall be able to review audit logs | High |
| ACM-006 | Admin shall be able to view platform statistics | Medium |
| ACM-007 | Admin actions shall be logged with actor, timestamp, and metadata | High |
| ACM-008 | Admin access shall require stronger security controls | High |

## 23.4 Acceptance Criteria

1. Admin can verify a lawyer.
2. Admin can reject a lawyer with reason.
3. Admin can update legal content.
4. Admin actions are logged.
5. Non-admin users cannot access admin APIs.
6. Admin dashboard shows operational metrics.

---

# Module 12: Analytics & Metrics Module

## 24.1 Description

This module provides product and operational metrics for admins and legal aid coordinators.

## 24.2 Metrics

The system should track:

1. Registered citizens.
2. Registered lawyers.
3. Verified lawyers.
4. Legal searches.
5. Completed assessments.
6. Complaint drafts generated.
7. RTI applications generated.
8. Cases created.
9. Legal aid requests.
10. Lawyer acceptance rate.
11. Hearing reminders sent.
12. OCR success/failure rate.
13. Notification success/failure rate.
14. Document upload volume.
15. Most common legal issue categories.
16. Region-wise legal aid demand.

## 24.3 Requirements

| ID | Requirement | Priority |
|---|---|---|
| ANL-001 | Admin shall be able to view high-level usage metrics | Medium |
| ANL-002 | Admin shall be able to filter metrics by date range | Medium |
| ANL-003 | System shall track event-level product metrics | Medium |
| ANL-004 | Personally identifiable information shall not be exposed in aggregated analytics | High |
| ANL-005 | Metrics should support future export | Low |

---

# Module 13: Optional GraphQL Read Layer

## 25.1 Description

GraphQL should be used as an optional read aggregation layer, not as the primary write API.

The core API should remain REST-first because legal workflows such as creating cases, uploading documents, generating drafts, assigning lawyers, and updating hearings are easier to secure, document, test, and audit with REST endpoints.

GraphQL is useful for dashboards and mobile clients where nested read data is needed.

## 25.2 Required GraphQL Types

1. User.
2. LawyerProfile.
3. Case.
4. Hearing.
5. LawSection.
6. Document.
7. MatchRequest.
8. Notification.
9. DashboardSummary.

## 25.3 Required Queries

1. `me`.
2. `myCases`.
3. `caseById`.
4. `searchLaw`.
5. `lawSectionById`.
6. `myNotifications`.
7. `myLawyerRequests`.
8. `citizenDashboard`.
9. `lawyerDashboard`.
10. `adminDashboard`.

## 25.4 GraphQL Restrictions

1. Mutations should be limited in MVP.
2. Sensitive write operations should remain REST-only.
3. GraphQL queries must enforce the same authorization policies as REST.
4. Query depth and complexity limits must be enforced.
5. GraphQL must not expose unauthorized nested case or document data.

## 25.5 Acceptance Criteria

1. Authenticated users can query their own dashboard data.
2. Law search is available through GraphQL.
3. Unauthorized data is not exposed through nested GraphQL relations.
4. GraphQL schema supports future mobile integration.
5. Query complexity limits are enforced.

---

## 26. User Experience Requirements

### 26.1 Citizen Dashboard

Citizen dashboard should display:

1. Active cases.
2. Upcoming hearings.
3. Legal aid request status.
4. Recently uploaded documents.
5. Complaint draft shortcuts.
6. RTI generator shortcut.
7. Law search bar.
8. Suggested next actions.
9. Notifications.
10. Saved legal sections.

### 26.2 Lawyer Dashboard

Lawyer dashboard should display:

1. Pending legal aid requests.
2. Assigned cases.
3. Upcoming hearings.
4. Case notes.
5. Recently uploaded documents.
6. Availability status.
7. Active pro-bono case count.
8. Verification status.
9. Response deadlines.

### 26.3 Admin Dashboard

Admin dashboard should display:

1. Pending lawyer verification requests.
2. Total citizens.
3. Total lawyers.
4. Verified lawyers.
5. Active cases.
6. Recently updated laws.
7. Flagged documents.
8. Notification failures.
9. User reports.
10. Platform metrics.
11. System health indicators.

### 26.4 Design Principles

1. Use simple language.
2. Avoid unnecessary legal jargon.
3. Explain legal terms beside their usage.
4. Use step-by-step forms for complex workflows.
5. Make the interface mobile-friendly.
6. Show clear disclaimers.
7. Provide save-and-resume for long forms.
8. Make deadlines visually prominent.
9. Make privacy and document access clear to users.
10. Provide accessible keyboard navigation and readable contrast.

---

## 27. Non-Functional Requirements

### 27.1 Performance

| Requirement | Target |
|---|---|
| Common API response time | Under 500 ms under normal load |
| Legal search response time | Under 2 seconds for seeded MVP data |
| Dashboard initial load | Under 3 seconds on average broadband |
| File upload | Should not block OCR processing |
| OCR processing | Asynchronous; completion time depends on file size |
| Background reminders | Should execute within scheduled tolerance window |

### 27.2 Scalability

1. Backend shall remain stateless where possible.
2. Celery workers shall be horizontally scalable.
3. PostgreSQL indexes shall support common query patterns.
4. File storage shall use object storage in production.
5. Search shall begin with PostgreSQL and support future OpenSearch migration.
6. Read-heavy dashboard queries shall use pagination and caching.
7. Notification workers shall support retry and backoff.

### 27.3 Security

1. Use HTTPS in all production environments.
2. Use managed authentication in production.
3. Validate JWTs on all protected backend APIs.
4. Enforce RBAC at service layer.
5. Enforce row-level access controls for sensitive data where appropriate.
6. Validate all inputs using Pydantic.
7. Sanitize uploaded file names.
8. Validate file type, extension, MIME type, and file size.
9. Store documents in private buckets only.
10. Use signed URLs for uploads/downloads.
11. Encrypt sensitive data at rest.
12. Use KMS-managed encryption keys in production.
13. Store secrets in AWS Secrets Manager.
14. Apply rate limiting on authentication and sensitive endpoints.
15. Maintain audit logs for sensitive actions.
16. Use WAF for public endpoints.
17. Use structured logs without leaking sensitive personal data.
18. Use idempotency keys for critical background tasks.

### 27.4 Privacy

1. Citizens should control access to their cases.
2. Lawyers should access only assigned cases.
3. Admin access to sensitive case information should be logged.
4. Documents should never be public.
5. Personal data collection should be minimized.
6. Users should be able to request account deletion or archival.
7. Data retention rules should be defined for closed cases.
8. Analytics should use aggregated or anonymized data where possible.

### 27.5 Reliability

1. Failed Celery jobs should retry with exponential backoff.
2. Notification failures should be logged.
3. Database backups should run automatically in production.
4. Migrations should be version-controlled.
5. Errors should be logged with trace IDs.
6. Production deployments should support rollback.
7. Worker queues should expose monitoring metrics.
8. Reminder delivery should avoid duplicate sends.

### 27.6 Accessibility

1. Interface should support keyboard navigation.
2. Forms should have clear labels.
3. Error messages should be readable and actionable.
4. Important warnings should be visually distinct.
5. Text contrast should be readable.
6. Legal explanations should use plain language.
7. Future versions should support major Indian languages.

---

## 28. Legal and Ethical Requirements

### 28.1 Legal Disclaimer

Themis must clearly state:

1. The platform provides legal information and workflow assistance.
2. The platform does not provide final legal advice.
3. The platform does not replace a qualified lawyer.
4. Suggested legal sections are indicative and may not be final.
5. Complaint and RTI drafts should be reviewed before submission.
6. Lawyer-client relationship begins only after lawyer acceptance and explicit agreement.
7. Emergency matters should be taken directly to appropriate authorities.
8. Court deadlines should be verified independently.

### 28.2 AI and Automation Boundary

If AI is added in future versions:

1. AI must not claim to provide final legal advice.
2. AI output must be clearly labeled as AI-assisted.
3. AI-generated suggestions must include disclaimers.
4. Legal sections suggested by AI must be traceable to source records.
5. Serious matters must recommend lawyer review.
6. AI-generated drafts must be editable.
7. AI confidence and limitations should be visible.
8. AI should not hallucinate legal provisions.
9. AI should not fabricate case law or statutory sections.

### 28.3 Sensitive Data Handling

1. Avoid collecting unnecessary identity data.
2. Avoid storing Aadhaar or highly sensitive identifiers in MVP.
3. If identifiers are stored later, store only hashed or tokenized references where possible.
4. Use encryption for sensitive documents.
5. Log admin access to sensitive data.
6. Prevent public exposure of case records.
7. Implement clear data retention rules.
8. Provide data export and deletion workflows in future versions.

---

## 29. Technical Architecture

### 29.1 Backend Architecture

The backend should follow layered modular architecture:

```text
FastAPI Application
  |
  |-- API Routers
  |-- Dependency Injection
  |-- Auth Middleware
  |-- Permission Guards
  |
  |-- Service Layer
  |     |-- User Service
  |     |-- Legal Knowledge Service
  |     |-- Assessment Service
  |     |-- Complaint Service
  |     |-- Case Service
  |     |-- Hearing Service
  |     |-- Matching Service
  |     |-- Document Service
  |     |-- RTI Service
  |     |-- Notification Service
  |     |-- Admin Service
  |
  |-- Domain Rules
  |-- Repositories
  |-- Database Models
  |-- External Integrations
```

### 29.2 Data Storage Strategy

| Data Type | Storage |
|---|---|
| Users and profiles | PostgreSQL |
| Cases and hearings | PostgreSQL |
| Legal knowledge records | PostgreSQL |
| Assessment results | PostgreSQL |
| Match requests | PostgreSQL |
| Notifications | PostgreSQL |
| Audit logs | PostgreSQL, with retention policy |
| Uploaded files | S3 private bucket |
| OCR text | PostgreSQL |
| Cache data | Redis |
| Background jobs | RabbitMQ |

### 29.3 Search Strategy

MVP search:

1. PostgreSQL Full-Text Search.
2. `pg_trgm` for typo tolerance.
3. Weighted search vectors.
4. Indexes on act name, section number, category, and tags.

Future search:

1. OpenSearch for advanced relevance tuning.
2. Faceted search by legal category.
3. Synonym dictionary for legal terms.
4. Semantic search using embeddings only after curated data and evaluation exist.

### 29.4 Document Processing Strategy

Development:

1. Local file storage or MinIO.
2. Tesseract OCR.
3. Local Celery worker.

Production:

1. S3 private bucket.
2. Signed uploads and downloads.
3. Textract for OCR.
4. Celery workers on ECS/Fargate.
5. Metadata stored in PostgreSQL.
6. Access logged in audit table.

---

## 30. Database Requirements

### 30.1 Primary Entities

1. users.
2. user_profiles.
3. lawyer_profiles.
4. cases.
5. case_timeline_events.
6. hearings.
7. law_sections.
8. assessment_sessions.
9. complaint_drafts.
10. rti_drafts.
11. documents.
12. match_requests.
13. notifications.
14. notification_preferences.
15. audit_logs.
16. bookmarks.
17. admin_actions.
18. system_events.

### 30.2 Revised Schema Overview

```text
users
├── id UUID PK
├── external_auth_id VARCHAR UNIQUE
├── role ENUM(citizen, lawyer, admin, org_user)
├── email VARCHAR UNIQUE
├── phone VARCHAR NULL
├── is_active BOOLEAN
├── is_verified BOOLEAN
├── created_at TIMESTAMP
└── updated_at TIMESTAMP

user_profiles
├── id UUID PK
├── user_id UUID FK users.id
├── full_name VARCHAR
├── state VARCHAR
├── district VARCHAR
├── preferred_language VARCHAR
├── address TEXT NULL
├── metadata JSONB
├── created_at TIMESTAMP
└── updated_at TIMESTAMP

lawyer_profiles
├── id UUID PK
├── user_id UUID FK users.id
├── bar_number VARCHAR
├── state_bar_council VARCHAR
├── district VARCHAR
├── specializations TEXT[]
├── languages TEXT[]
├── is_pro_bono BOOLEAN
├── availability JSONB
├── max_active_cases INT
├── active_case_count INT
├── verification_status ENUM(pending, approved, rejected)
├── verification_notes TEXT NULL
├── rating DECIMAL NULL
├── created_at TIMESTAMP
└── updated_at TIMESTAMP

cases
├── id UUID PK
├── citizen_id UUID FK users.id
├── lawyer_id UUID FK users.id NULL
├── title VARCHAR
├── category VARCHAR
├── urgency ENUM(low, medium, high, emergency)
├── fir_number VARCHAR NULL
├── police_station VARCHAR NULL
├── court_name VARCHAR NULL
├── case_number VARCHAR NULL
├── status ENUM
├── sections TEXT[]
├── description TEXT
├── created_at TIMESTAMP
├── updated_at TIMESTAMP
└── archived_at TIMESTAMP NULL

case_timeline_events
├── id UUID PK
├── case_id UUID FK cases.id
├── actor_id UUID FK users.id
├── event_type VARCHAR
├── title VARCHAR
├── description TEXT
├── metadata JSONB
└── created_at TIMESTAMP

hearings
├── id UUID PK
├── case_id UUID FK cases.id
├── hearing_date DATE
├── hearing_time TIME NULL
├── court VARCHAR
├── court_room VARCHAR NULL
├── judge VARCHAR NULL
├── purpose TEXT
├── outcome TEXT NULL
├── next_date DATE NULL
├── notes TEXT NULL
├── added_by UUID FK users.id
├── created_at TIMESTAMP
└── updated_at TIMESTAMP

law_sections
├── id UUID PK
├── act_name VARCHAR
├── section_number VARCHAR
├── title VARCHAR
├── original_text TEXT NULL
├── plain_language TEXT
├── example_scenarios TEXT[]
├── punishment TEXT NULL
├── is_bailable BOOLEAN NULL
├── is_cognizable BOOLEAN NULL
├── ipc_mapping VARCHAR NULL
├── related_sections TEXT[]
├── category_tags TEXT[]
├── source_reference TEXT NULL
├── review_status ENUM(draft, reviewed, deprecated)
├── last_reviewed_at TIMESTAMP NULL
├── search_vector TSVECTOR
├── created_at TIMESTAMP
└── updated_at TIMESTAMP

essessment_sessions
├── id UUID PK
├── user_id UUID FK users.id
├── case_id UUID FK cases.id NULL
├── issue_category VARCHAR
├── answers JSONB
├── suggested_sections TEXT[]
├── evidence_checklist JSONB
├── result_summary TEXT
├── disclaimer_accepted BOOLEAN
├── created_at TIMESTAMP
└── updated_at TIMESTAMP

complaint_drafts
├── id UUID PK
├── user_id UUID FK users.id
├── case_id UUID FK cases.id NULL
├── assessment_id UUID FK assessment_sessions.id NULL
├── draft_text TEXT
├── status ENUM(draft, exported, saved_to_case)
├── pdf_document_id UUID NULL
├── created_at TIMESTAMP
└── updated_at TIMESTAMP

rti_drafts
├── id UUID PK
├── user_id UUID FK users.id
├── case_id UUID FK cases.id NULL
├── public_authority VARCHAR
├── department VARCHAR NULL
├── information_requested TEXT
├── draft_text TEXT
├── status ENUM(draft, exported, saved_to_case)
├── pdf_document_id UUID NULL
├── created_at TIMESTAMP
└── updated_at TIMESTAMP

documents
├── id UUID PK
├── case_id UUID FK cases.id NULL
├── uploaded_by UUID FK users.id
├── original_file_name VARCHAR
├── object_key VARCHAR
├── mime_type VARCHAR
├── file_size BIGINT
├── file_hash VARCHAR
├── document_type VARCHAR
├── ocr_status ENUM(not_started, processing, completed, failed)
├── ocr_text TEXT NULL
├── access_level ENUM(case_private, lawyer_private, admin_review)
├── malware_scan_status ENUM(not_scanned, clean, suspicious, failed)
├── created_at TIMESTAMP
└── updated_at TIMESTAMP

match_requests
├── id UUID PK
├── case_id UUID FK cases.id
├── citizen_id UUID FK users.id
├── lawyer_id UUID FK users.id
├── score INT
├── status ENUM(pending, accepted, declined, expired, cancelled, reassigned)
├── requested_at TIMESTAMP
└── responded_at TIMESTAMP NULL

notifications
├── id UUID PK
├── user_id UUID FK users.id
├── type VARCHAR
├── title VARCHAR
├── message TEXT
├── channel ENUM(email, sms, in_app)
├── status ENUM(pending, sent, failed)
├── idempotency_key VARCHAR UNIQUE
├── sent_at TIMESTAMP NULL
└── created_at TIMESTAMP

audit_logs
├── id UUID PK
├── actor_id UUID FK users.id NULL
├── action VARCHAR
├── entity_type VARCHAR
├── entity_id UUID NULL
├── metadata JSONB
├── ip_address VARCHAR NULL
├── user_agent TEXT NULL
└── created_at TIMESTAMP
```

---

## 31. REST API Requirements

### 31.1 Authentication and Profile API

```text
GET    /api/v1/auth/me
PATCH  /api/v1/auth/me
POST   /api/v1/auth/sync-profile
POST   /api/v1/auth/logout
```

Registration and password reset should happen through Cognito or the configured identity provider. The backend should store app profile data but not production passwords.

### 31.2 Legal Knowledge API

```text
GET    /api/v1/laws/search
GET    /api/v1/laws/{section_id}
GET    /api/v1/laws/acts
GET    /api/v1/laws/acts/{act_name}
POST   /api/v1/admin/laws
PATCH  /api/v1/admin/laws/{section_id}
DELETE /api/v1/admin/laws/{section_id}
```

### 31.3 Assessment API

```text
POST   /api/v1/assessments/start
POST   /api/v1/assessments/{assessment_id}/answer
POST   /api/v1/assessments/{assessment_id}/analyze
POST   /api/v1/assessments/{assessment_id}/save-to-case
GET    /api/v1/assessments/categories
GET    /api/v1/assessments/{assessment_id}
```

### 31.4 Complaint API

```text
POST   /api/v1/complaints/generate
GET    /api/v1/complaints/{draft_id}
PATCH  /api/v1/complaints/{draft_id}
POST   /api/v1/complaints/{draft_id}/export-pdf
POST   /api/v1/complaints/{draft_id}/save-to-case
```

### 31.5 Case API

```text
POST   /api/v1/cases
GET    /api/v1/cases
GET    /api/v1/cases/{case_id}
PATCH  /api/v1/cases/{case_id}
DELETE /api/v1/cases/{case_id}
GET    /api/v1/cases/{case_id}/timeline
```

### 31.6 Hearing API

```text
POST   /api/v1/cases/{case_id}/hearings
GET    /api/v1/cases/{case_id}/hearings
GET    /api/v1/hearings/{hearing_id}
PATCH  /api/v1/hearings/{hearing_id}
DELETE /api/v1/hearings/{hearing_id}
POST   /api/v1/hearings/{hearing_id}/schedule-reminders
```

### 31.7 Legal Aid API

```text
POST   /api/v1/legal-aid/request
GET    /api/v1/legal-aid/requests
GET    /api/v1/legal-aid/suggestions/{case_id}
POST   /api/v1/legal-aid/requests/{request_id}/accept
POST   /api/v1/legal-aid/requests/{request_id}/decline
POST   /api/v1/legal-aid/requests/{request_id}/cancel
```

### 31.8 Lawyer API

```text
POST   /api/v1/lawyers/profile
GET    /api/v1/lawyers/me
PATCH  /api/v1/lawyers/me
GET    /api/v1/lawyers/search
PATCH  /api/v1/lawyers/availability
GET    /api/v1/lawyers/assigned-cases
```

### 31.9 Document API

```text
POST   /api/v1/documents/presign-upload
POST   /api/v1/documents/complete-upload
GET    /api/v1/documents/{document_id}
GET    /api/v1/documents/{document_id}/download-url
GET    /api/v1/cases/{case_id}/documents
DELETE /api/v1/documents/{document_id}
POST   /api/v1/documents/{document_id}/ocr
```

### 31.10 RTI API

```text
POST   /api/v1/rti/generate
GET    /api/v1/rti/{draft_id}
PATCH  /api/v1/rti/{draft_id}
POST   /api/v1/rti/{draft_id}/export-pdf
POST   /api/v1/rti/{draft_id}/save-to-case
```

### 31.11 Notification API

```text
GET    /api/v1/notifications
PATCH  /api/v1/notifications/{notification_id}/read
PATCH  /api/v1/notifications/preferences
```

### 31.12 Admin API

```text
GET    /api/v1/admin/users
GET    /api/v1/admin/lawyers/pending
PATCH  /api/v1/admin/lawyers/{lawyer_id}/verify
PATCH  /api/v1/admin/lawyers/{lawyer_id}/reject
GET    /api/v1/admin/cases
GET    /api/v1/admin/audit-logs
GET    /api/v1/admin/metrics
GET    /api/v1/admin/notifications/failures
```

---

## 32. Local Development Architecture

Docker Compose should run:

1. Next.js frontend.
2. FastAPI backend.
3. PostgreSQL.
4. Redis.
5. RabbitMQ.
6. Celery worker.
7. Celery beat scheduler.
8. Optional MinIO for S3-like local object storage.
9. Optional Mailpit for local email testing.

```text
local-dev/
  frontend: Next.js
  api: FastAPI
  db: PostgreSQL
  redis: cache/rate-limit
  rabbitmq: queue broker
  worker: Celery worker
  beat: scheduled tasks
  minio: local object storage
  mailpit: email testing
```

---

## 33. Recommended Folder Structure

```text
Themis/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── next.config.ts
│   │
│   └── api/
│       ├── app/
│       │   ├── main.py
│       │   ├── config.py
│       │   ├── database.py
│       │   │
│       │   ├── api/
│       │   │   └── v1/
│       │   │       ├── auth.py
│       │   │       ├── users.py
│       │   │       ├── lawyers.py
│       │   │       ├── laws.py
│       │   │       ├── assessments.py
│       │   │       ├── complaints.py
│       │   │       ├── cases.py
│       │   │       ├── hearings.py
│       │   │       ├── documents.py
│       │   │       ├── legal_aid.py
│       │   │       ├── rti.py
│       │   │       ├── notifications.py
│       │   │       └── admin.py
│       │   │
│       │   ├── core/
│       │   │   ├── auth.py
│       │   │   ├── permissions.py
│       │   │   ├── config.py
│       │   │   ├── logging.py
│       │   │   ├── security.py
│       │   │   └── exceptions.py
│       │   │
│       │   ├── models/
│       │   ├── schemas/
│       │   ├── repositories/
│       │   ├── services/
│       │   ├── domain/
│       │   │   ├── assessment_rules/
│       │   │   ├── matching_rules/
│       │   │   └── legal_categories.py
│       │   │
│       │   ├── tasks/
│       │   │   ├── celery_app.py
│       │   │   ├── reminders.py
│       │   │   ├── notifications.py
│       │   │   ├── document_ocr.py
│       │   │   └── exports.py
│       │   │
│       │   ├── graphql/
│       │   └── integrations/
│       │       ├── s3.py
│       │       ├── textract.py
│       │       ├── ses.py
│       │       └── sms.py
│       │
│       ├── alembic/
│       ├── tests/
│       ├── pyproject.toml
│       └── Dockerfile
│
├── infra/
│   ├── terraform/
│   │   ├── environments/
│   │   │   ├── dev/
│   │   │   ├── staging/
│   │   │   └── prod/
│   │   └── modules/
│   │       ├── networking/
│   │       ├── ecs/
│   │       ├── rds/
│   │       ├── s3/
│   │       ├── redis/
│   │       ├── rabbitmq/
│   │       ├── cognito/
│   │       └── observability/
│   │
├── data/
│   └── seed/
│       ├── bns_sections.json
│       ├── ipc_mappings.json
│       ├── rti_act.json
│       ├── consumer_protection_act.json
│       └── legal_categories.json
│
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── security.md
│   ├── deployment.md
│   └── legal-disclaimer.md
│
├── docker-compose.yml
├── .github/workflows/
├── README.md
├── .env.example
├── Agents.md
└── CLAUDE.md
```

---

## 34. MVP Definition

### 34.1 MVP Must-Have Features

The MVP should include:

1. Citizen registration and login through managed or local development auth.
2. Lawyer registration.
3. Admin lawyer verification.
4. Legal knowledge database with seeded sections.
5. Law search.
6. Plain-language law pages.
7. Legal issue assessment flow.
8. Complaint draft generation.
9. Case creation.
10. Hearing creation.
11. Lawyer profile creation.
12. Basic legal aid matching.
13. Document upload.
14. RTI application generator.
15. Email-based hearing reminders.
16. Admin dashboard.
17. Audit logs for sensitive actions.

### 34.2 MVP Exclusions

1. Live e-Courts integration.
2. Direct FIR submission.
3. Aadhaar verification.
4. Payment system.
5. Video consultation.
6. Real-time chat.
7. Advanced AI legal advice.
8. Native mobile application.
9. Full multilingual support.
10. SMS reminders unless budget allows.
11. OpenSearch unless PostgreSQL search becomes insufficient.
12. Kubernetes deployment.

---

## 35. Development Roadmap

### Phase 1: Foundation and Architecture

Estimated duration: 1–2 weeks.

Deliverables:

1. Monorepo setup.
2. Next.js app setup.
3. FastAPI app setup.
4. PostgreSQL connection.
5. SQLAlchemy models.
6. Alembic migrations.
7. Docker Compose stack.
8. Basic CI workflow.
9. Linting and formatting.

Success criteria:

1. Frontend and backend run locally.
2. Database migrations work.
3. Health check endpoint works.
4. CI runs tests and lint checks.

### Phase 2: Authentication and Roles

Estimated duration: 1–2 weeks.

Deliverables:

1. Cognito or local auth adapter.
2. User profile sync.
3. Role-based permissions.
4. Citizen profile.
5. Lawyer profile.
6. Admin role.
7. Basic protected routes.

Success criteria:

1. Users can sign in.
2. Backend validates authentication.
3. Roles are enforced.
4. Unauthorized access is blocked.

### Phase 3: Legal Knowledge and Search

Estimated duration: 1–2 weeks.

Deliverables:

1. Law section model.
2. Seed data loader.
3. Law search API.
4. Law detail API.
5. Admin legal content management.
6. PostgreSQL full-text search.
7. Trigram fuzzy search.

Success criteria:

1. Users can search legal sections.
2. Users can view law details.
3. Admins can manage law records.
4. Search meets MVP latency target.

### Phase 4: Assessment and Complaint Drafts

Estimated duration: 2 weeks.

Deliverables:

1. Assessment questionnaire engine.
2. Rule-based legal category mapper.
3. Evidence checklist generator.
4. Complaint draft generator.
5. PDF export.
6. Assessment-to-case flow.

Success criteria:

1. User completes assessment.
2. System suggests legal categories.
3. Complaint draft is generated.
4. Draft can be exported as PDF.

### Phase 5: Case and Hearing Management

Estimated duration: 1–2 weeks.

Deliverables:

1. Case CRUD APIs.
2. Hearing CRUD APIs.
3. Case timeline.
4. Case status workflow.
5. Citizen dashboard APIs.
6. Lawyer assigned-case APIs.

Success criteria:

1. Citizen can create cases.
2. Hearings can be added.
3. Case status can be updated.
4. Timeline displays case activity.
5. Lawyers access only assigned cases.

### Phase 6: Lawyer Verification and Legal Aid Matching

Estimated duration: 1–2 weeks.

Deliverables:

1. Lawyer profile APIs.
2. Admin verification flow.
3. Matching score algorithm.
4. Legal aid request workflow.
5. Lawyer dashboard APIs.
6. Citizen notifications.

Success criteria:

1. Lawyer can create profile.
2. Admin can verify lawyer.
3. Citizen can request legal aid.
4. Lawyer can accept or decline request.
5. Case access updates after acceptance.

### Phase 7: Document Repository and OCR

Estimated duration: 2 weeks.

Deliverables:

1. Document metadata model.
2. Secure upload flow.
3. Local object storage or S3 integration.
4. Signed URL flow.
5. OCR Celery task.
6. Document listing and preview.
7. Document audit logs.

Success criteria:

1. User can upload documents.
2. Documents are linked to cases.
3. OCR runs asynchronously.
4. Unauthorized document access is blocked.
5. Document access is logged.

### Phase 8: RTI Generator and Notifications

Estimated duration: 1 week.

Deliverables:

1. RTI application generator.
2. RTI PDF export.
3. Notification service.
4. Hearing reminder tasks.
5. Celery beat schedule.
6. Email integration.

Success criteria:

1. User can generate RTI application.
2. Hearing reminders are sent.
3. Notification logs are maintained.
4. Failed jobs retry.

### Phase 9: Admin, GraphQL, Testing, and Hardening

Estimated duration: 1–2 weeks.

Deliverables:

1. Admin dashboard.
2. Audit log viewer.
3. Metrics endpoints.
4. Optional GraphQL read layer.
5. Integration testing.
6. E2E tests.
7. Security hardening.
8. Final documentation.

Success criteria:

1. Admin flows work.
2. Major user journeys pass E2E tests.
3. Sensitive APIs enforce permissions.
4. Audit logs capture critical actions.
5. Documentation is complete.

---

## 36. Success Metrics

### 36.1 Product Metrics

1. Number of registered citizens.
2. Number of registered lawyers.
3. Number of verified lawyers.
4. Number of law searches.
5. Number of completed assessments.
6. Number of complaint drafts generated.
7. Number of RTI applications generated.
8. Number of cases created.
9. Number of legal aid requests.
10. Number of successful lawyer matches.
11. Number of hearing reminders sent.

### 36.2 Quality Metrics

1. Search response time.
2. API error rate.
3. Notification success rate.
4. OCR success rate.
5. Lawyer request acceptance rate.
6. User satisfaction score.
7. Case record completion rate.
8. E2E test pass rate.
9. Background job failure rate.

### 36.3 Security Metrics

1. Failed login attempts.
2. Unauthorized access attempts blocked.
3. Document access violations.
4. Suspicious upload detections.
5. Admin action audit coverage.
6. Rate-limit events.
7. Sensitive data exposure incidents.

---

## 37. Risks and Mitigation

| Risk | Impact | Mitigation |
|---|---:|---|
| Users treat platform output as final legal advice | High | Prominent disclaimers, lawyer review prompts, non-final language |
| Incorrect legal section suggestions | High | Rule-based mapping, reviewed legal content, confidence labels |
| Fake lawyer profiles | High | Admin verification with Bar Council details |
| Sensitive document exposure | High | Private storage, signed URLs, access checks, audit logs |
| Poor quality legal data | High | Curated seed data, review workflow, last-reviewed metadata |
| Missed hearing reminders | Medium | Retry logic, reminder logs, idempotency keys, monitoring |
| OCR inaccuracies | Medium | Label OCR as extracted text, allow manual correction |
| Abuse or spam | Medium | Rate limiting, moderation, suspension tools |
| File upload malware | High | File validation, malware scan integration, restricted previews |
| Scope creep | Medium | Maintain MVP boundary and phased roadmap |
| Overengineering infrastructure | Medium | Use ECS/Fargate first, avoid Kubernetes initially |
| GraphQL data exposure | High | Query complexity limits, shared authorization policies |

---

## 38. Recommended Build Priority

For an MCA-level implementation, build in this order:

1. Project setup with Docker Compose.
2. Database models and migrations.
3. Authentication and roles.
4. Legal knowledge database.
5. Legal search.
6. Legal issue assessment.
7. Complaint draft generation.
8. Case management.
9. Hearing tracking.
10. Lawyer profile management.
11. Lawyer verification.
12. Legal aid matching.
13. Document upload.
14. OCR worker.
15. RTI generator.
16. Celery reminders.
17. Admin dashboard.
18. Audit logs.
19. Optional GraphQL read layer.
20. Frontend polish and E2E testing.

---

## 39. Final Product Summary

Themis is a comprehensive Indian legal aid and legal knowledge platform designed to improve legal awareness, case organization, and access to pro-bono legal support.

The revised version combines:

1. Legal search.
2. Plain-language law explanations.
3. Guided issue assessment.
4. Complaint draft generation.
5. RTI generation.
6. Case tracking.
7. Hearing reminders.
8. Lawyer verification.
9. Legal aid matching.
10. Secure document management.
11. OCR.
12. Admin moderation.
13. Audit logging.
14. Production-ready deployment architecture.

The project is technically strong because it includes:

1. Modern frontend architecture with Next.js and TypeScript.
2. FastAPI backend with clean modular services.
3. PostgreSQL relational modeling and full-text search.
4. Secure private document handling with S3-style storage.
5. Background processing using Celery and RabbitMQ.
6. Redis caching and rate limiting.
7. Managed authentication through Cognito.
8. Audit logs and role-based access control.
9. OCR pipeline.
10. PDF generation.
11. Admin verification workflows.
12. Real-world social impact.

Themis is suitable as a major academic project and can also evolve into a real pilot product if security, legal data quality, lawyer verification, and privacy controls are implemented carefully.

---

## 40. Recommended Final Tech Stack Summary

| Category | Final Recommendation |
|---|---|
| Frontend | Next.js App Router, TypeScript, Tailwind CSS, Shadcn UI |
| Forms | React Hook Form, Zod |
| API State | TanStack Query |
| Backend | FastAPI, Python 3.12+, Pydantic v2 |
| ORM | SQLAlchemy 2.x |
| Migrations | Alembic |
| Database | PostgreSQL |
| Search | PostgreSQL FTS + pg_trgm; OpenSearch later if needed |
| Auth | Amazon Cognito in production; local auth only for dev/demo |
| Authorization | RBAC + service policies + PostgreSQL RLS where needed |
| Queue | RabbitMQ |
| Workers | Celery |
| Cache | Redis |
| File Storage | S3 private buckets / MinIO locally |
| OCR | Amazon Textract in production; Tesseract fallback locally |
| Email | Amazon SES / Mailpit locally |
| SMS | Amazon SNS or approved SMS provider |
| PDF | WeasyPrint or ReportLab |
| Testing | Pytest, Vitest, Playwright |
| Linting | Ruff, MyPy, ESLint |
| Local Dev | Docker Compose |
| Production | AWS Mumbai, ECS/Fargate, RDS, S3, ElastiCache, WAF |
| IaC | Terraform |
| CI/CD | GitHub Actions with OIDC |
| Observability | OpenTelemetry, ADOT, CloudWatch, X-Ray |

