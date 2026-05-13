# Technical Requirements Document
# Themis - Indian Legal Aid, Legal Knowledge and Case Support Platform

## 1. Purpose

This Technical Requirements Document converts the product requirements in `Themis_Revised_Detailed_PRD.md` into an implementation-oriented technical specification. It defines the recommended architecture, service boundaries, data responsibilities, API surface, security model, background jobs, deployment model, and technical acceptance criteria for the Themis platform.

Themis is a legal information and workflow-support system. It must not present itself as a substitute for qualified legal advice, police portals, court systems, or official government filing systems.

## 2. Technical Goals

1. Build a secure full-stack web application for citizens, lawyers, admins, and future legal aid organization users.
2. Use a modular monolith backend with clear service boundaries.
3. Store transactional data in PostgreSQL.
4. Store private legal documents in S3-compatible object storage.
5. Run OCR, reminders, exports, and notifications asynchronously.
6. Use managed authentication in production.
7. Enforce role-based access control and case-level authorization.
8. Support legal search using PostgreSQL full-text search and trigram similarity.
9. Keep the MVP deployable with Docker Compose locally and AWS ECS/Fargate in production.
10. Preserve a future path to mobile apps, multilingual content, OpenSearch, and AI-assisted features.

## 3. Recommended Stack

| Layer | Technology | Requirement |
|---|---|---|
| Frontend | Next.js App Router, TypeScript | Web app, route groups by role, SSR where useful |
| Styling | Tailwind CSS, Shadcn UI | Accessible, consistent component system |
| Forms | React Hook Form, Zod | Long legal forms, validation, save-and-resume |
| API State | TanStack Query | Caching, retries, pagination, mutation states |
| Tables | TanStack Table | Admin lists, lawyer queues, case tables |
| Charts | Recharts | Admin and operational dashboards |
| Backend | FastAPI, Python 3.12+ | REST API and service layer |
| Validation | Pydantic v2 | Request and response schemas |
| ORM | SQLAlchemy 2.x | Database access |
| Migrations | Alembic | Versioned database changes |
| Database | PostgreSQL | System of record |
| Search | PostgreSQL FTS, pg_trgm | MVP legal search and fuzzy matching |
| Auth | Amazon Cognito in production | Managed login and JWT issuer |
| Authorization | RBAC, service policies, optional PostgreSQL RLS | Role and resource access enforcement |
| Queue | RabbitMQ | Durable background job broker |
| Workers | Celery | OCR, reminders, notifications, PDF exports |
| Cache | Redis | Rate limits, short-lived cache, ephemeral locks |
| File Storage | S3 in production, MinIO locally | Private document storage |
| OCR | Textract in production, Tesseract locally | Extract text from uploaded documents |
| PDF | WeasyPrint or ReportLab | Complaint and RTI exports |
| Email | SES in production, Mailpit locally | Email reminders and notifications |
| Observability | OpenTelemetry, CloudWatch, X-Ray | Logs, traces, metrics |
| Local Runtime | Docker Compose | Full local stack |
| Production Runtime | AWS Mumbai, ECS/Fargate | Managed container deployment |

## 4. Architecture

The system should be implemented as a modular monolith with background workers. Backend modules must share one deployable FastAPI application but keep API routers, schemas, services, repositories, permissions, and domain rules separated by module.

```text
Users
  |
  v
CloudFront + WAF
  |
  v
Next.js Web App
  |
  |-- Cognito Hosted Auth
  |
  v
FastAPI API
  |
  |-- API routers
  |-- Auth middleware
  |-- Permission guards
  |-- Service layer
  |-- Domain rules
  |-- Repositories
  |
  |-- PostgreSQL
  |-- Redis
  |-- RabbitMQ
  |-- S3 or MinIO
  |
  v
Celery Workers
  |
  |-- OCR worker
  |-- Reminder worker
  |-- Notification worker
  |-- PDF export worker
  |-- Digest worker
```

## 5. Backend Modules

| Module | Responsibilities |
|---|---|
| Auth and Users | JWT validation, profile sync, role assignment, account status |
| Lawyer Profiles | Lawyer registration details, verification state, availability, caseload |
| Legal Knowledge | Curated legal sections, search, bookmarks, admin legal content management |
| Assessment | Guided questionnaire, rule-based category mapping, evidence checklist |
| Complaint Drafts | Complaint/FIR-support draft generation, edit, export, save to case |
| Cases | Case CRUD, status workflow, lawyer assignment, timeline |
| Hearings | Hearing records, outcomes, next dates, reminder scheduling |
| Legal Aid Matching | Lawyer ranking, legal aid requests, accept/decline workflow |
| Documents | Signed upload/download, metadata, access checks, OCR, malware status |
| RTI Drafts | RTI generation, edit, PDF export, save to case |
| Notifications | In-app and email notifications, preferences, delivery logs |
| Admin | Lawyer verification, user suspension, legal content moderation, metrics |
| Analytics | Aggregated product and operational metrics |
| Optional GraphQL | Read-only aggregation for dashboards and future mobile clients |

## 6. Authentication and Authorization

### 6.1 Authentication

Production authentication must be handled by Cognito or another managed identity provider. The backend stores application profile data but does not store production passwords.

Required auth behavior:

1. Validate issuer, audience, expiry, and signature for every protected JWT.
2. Sync external auth users into the local `users` table.
3. Keep app roles in PostgreSQL.
4. Support local development auth only behind an explicit feature flag.
5. Require stronger controls for admin and lawyer-sensitive flows in production.

### 6.2 Roles

| Role | Access Summary |
|---|---|
| Citizen | Search laws, run assessments, generate drafts, create cases, upload documents, request legal aid |
| Lawyer | Manage lawyer profile, receive requests after verification, view assigned cases, update hearing outcomes |
| Admin | Verify lawyers, manage legal content, suspend users, view audit logs, monitor operations |
| Org User | Future organization-level case coordination and reporting |

### 6.3 Authorization Rules

1. Citizens may access only their own cases, documents, drafts, assessments, hearings, and legal aid requests.
2. Lawyers may access only cases assigned through accepted legal aid requests or admin assignment.
3. Unverified lawyers may not receive or accept legal aid requests.
4. Admin case access must be policy-limited and audit logged.
5. Document downloads must require a fresh authorization check before issuing a signed URL.
6. Optional GraphQL queries must reuse the same authorization policies as REST.

## 7. API Requirements

The core API is REST-first. GraphQL may be added as a read aggregation layer for dashboards and future mobile clients, but sensitive writes should remain REST-only.

### 7.1 Auth and Profile

```text
GET    /api/v1/auth/me
PATCH  /api/v1/auth/me
POST   /api/v1/auth/sync-profile
POST   /api/v1/auth/logout
```

### 7.2 Legal Knowledge

```text
GET    /api/v1/laws/search
GET    /api/v1/laws/{section_id}
GET    /api/v1/laws/acts
GET    /api/v1/laws/acts/{act_name}
POST   /api/v1/admin/laws
PATCH  /api/v1/admin/laws/{section_id}
DELETE /api/v1/admin/laws/{section_id}
```

### 7.3 Assessments

```text
POST   /api/v1/assessments/start
POST   /api/v1/assessments/{assessment_id}/answer
POST   /api/v1/assessments/{assessment_id}/analyze
POST   /api/v1/assessments/{assessment_id}/save-to-case
GET    /api/v1/assessments/categories
GET    /api/v1/assessments/{assessment_id}
```

### 7.4 Complaint Drafts

```text
POST   /api/v1/complaints/generate
GET    /api/v1/complaints/{draft_id}
PATCH  /api/v1/complaints/{draft_id}
POST   /api/v1/complaints/{draft_id}/export-pdf
POST   /api/v1/complaints/{draft_id}/save-to-case
```

### 7.5 Cases and Hearings

```text
POST   /api/v1/cases
GET    /api/v1/cases
GET    /api/v1/cases/{case_id}
PATCH  /api/v1/cases/{case_id}
DELETE /api/v1/cases/{case_id}
GET    /api/v1/cases/{case_id}/timeline

POST   /api/v1/cases/{case_id}/hearings
GET    /api/v1/cases/{case_id}/hearings
GET    /api/v1/hearings/{hearing_id}
PATCH  /api/v1/hearings/{hearing_id}
DELETE /api/v1/hearings/{hearing_id}
POST   /api/v1/hearings/{hearing_id}/schedule-reminders
```

### 7.6 Legal Aid and Lawyers

```text
POST   /api/v1/legal-aid/request
GET    /api/v1/legal-aid/requests
GET    /api/v1/legal-aid/suggestions/{case_id}
POST   /api/v1/legal-aid/requests/{request_id}/accept
POST   /api/v1/legal-aid/requests/{request_id}/decline
POST   /api/v1/legal-aid/requests/{request_id}/cancel

POST   /api/v1/lawyers/profile
GET    /api/v1/lawyers/me
PATCH  /api/v1/lawyers/me
GET    /api/v1/lawyers/search
PATCH  /api/v1/lawyers/availability
GET    /api/v1/lawyers/assigned-cases
```

### 7.7 Documents, RTI, Notifications, Admin

```text
POST   /api/v1/documents/presign-upload
POST   /api/v1/documents/complete-upload
GET    /api/v1/documents/{document_id}
GET    /api/v1/documents/{document_id}/download-url
GET    /api/v1/cases/{case_id}/documents
DELETE /api/v1/documents/{document_id}
POST   /api/v1/documents/{document_id}/ocr

POST   /api/v1/rti/generate
GET    /api/v1/rti/{draft_id}
PATCH  /api/v1/rti/{draft_id}
POST   /api/v1/rti/{draft_id}/export-pdf
POST   /api/v1/rti/{draft_id}/save-to-case

GET    /api/v1/notifications
PATCH  /api/v1/notifications/{notification_id}/read
PATCH  /api/v1/notifications/preferences

GET    /api/v1/admin/users
GET    /api/v1/admin/lawyers/pending
PATCH  /api/v1/admin/lawyers/{lawyer_id}/verify
PATCH  /api/v1/admin/lawyers/{lawyer_id}/reject
GET    /api/v1/admin/cases
GET    /api/v1/admin/audit-logs
GET    /api/v1/admin/metrics
GET    /api/v1/admin/notifications/failures
```

## 8. Data and Storage Requirements

| Data | Storage Requirement |
|---|---|
| Users and profiles | PostgreSQL |
| Legal knowledge | PostgreSQL with FTS indexes |
| Assessments | PostgreSQL JSONB answers and structured result fields |
| Cases and hearings | PostgreSQL relational tables |
| Draft text | PostgreSQL |
| Exported PDFs | S3/MinIO object storage plus `documents` metadata |
| Uploaded documents | Private S3/MinIO object storage |
| OCR text | PostgreSQL and future search index |
| Notifications | PostgreSQL delivery records |
| Audit logs | PostgreSQL with retention policy |
| Cache and rate limits | Redis |
| Background jobs | RabbitMQ |

## 9. Background Jobs

| Job | Trigger | Worker Behavior |
|---|---|---|
| OCR | Document upload completed | Extract text, update `documents.ocr_text`, notify user if needed |
| PDF export | Complaint or RTI export request | Render PDF, store file, create document metadata |
| Hearing reminders | Hearing created or updated | Schedule reminders 7 days before, 1 day before, and day of hearing |
| Notification delivery | Notification created | Send email or in-app notification, update status |
| Digest | Scheduled job | Send optional legal update digest |
| Retry cleanup | Failed job or stale pending state | Retry with backoff and mark terminal failures |

All background jobs that can cause duplicate user-facing effects must use idempotency keys.

## 10. Search Requirements

MVP legal search must support:

1. Keyword search across act name, section number, title, plain language, and tags.
2. Filtering by act, category, bailable status, cognizable status, and review status.
3. Typo-tolerant matching using `pg_trgm`.
4. Weighted `tsvector` ranking.
5. Admin-only indexing updates when law records change.

OpenSearch should be treated as a future upgrade only when PostgreSQL search is not enough.

## 11. Security Requirements

1. Use HTTPS in production.
2. Validate JWTs on all protected APIs.
3. Enforce RBAC and case-level policies in the service layer.
4. Use signed URLs for uploads and downloads.
5. Keep object storage buckets private.
6. Validate MIME type, extension, file size, and file name.
7. Store file hashes for integrity checks.
8. Support malware scan status in document metadata.
9. Log sensitive admin, case, and document actions.
10. Avoid logging personal legal details in application logs.
11. Use secrets manager in production.
12. Use KMS-backed encryption for production storage.
13. Rate-limit authentication, uploads, search abuse, and generation endpoints.
14. Enforce GraphQL depth and complexity limits if GraphQL is enabled.

## 12. Non-Functional Requirements

| Area | Target |
|---|---|
| Common API latency | Under 500 ms under normal load |
| Legal search latency | Under 2 seconds for MVP seeded data |
| Dashboard load | Under 3 seconds on average broadband |
| OCR | Asynchronous and non-blocking |
| Reminder delivery | Runs within scheduled tolerance window |
| Availability | Production deployment supports rollback |
| Accessibility | Keyboard navigation, labels, readable contrast |
| Privacy | Documents never public, analytics aggregated |
| Reliability | Worker retries, backup strategy, trace IDs |

## 13. Local Development

Docker Compose should run:

1. Next.js frontend.
2. FastAPI backend.
3. PostgreSQL.
4. Redis.
5. RabbitMQ.
6. Celery worker.
7. Celery beat scheduler.
8. MinIO for local object storage.
9. Mailpit for local email testing.

## 14. Production Deployment

Production should use AWS Mumbai region:

1. CloudFront and WAF for public entry.
2. ECS/Fargate for frontend, API, and worker containers.
3. RDS PostgreSQL for transactional data.
4. ElastiCache Redis.
5. RabbitMQ service or compatible managed broker.
6. S3 private buckets for documents.
7. SES for email.
8. SNS or approved provider for future SMS.
9. Secrets Manager for credentials.
10. OpenTelemetry, CloudWatch, and X-Ray for observability.

## 15. Technical Acceptance Criteria

1. Frontend and backend run locally using Docker Compose.
2. Database migrations create all MVP tables.
3. Protected routes reject unauthenticated requests.
4. Role policies prevent unauthorized case and document access.
5. Legal search returns results using PostgreSQL FTS.
6. Assessment flow generates possible categories and evidence checklist.
7. Complaint and RTI drafts can be exported to PDF.
8. Case, hearing, legal aid, document, and admin workflows are covered by API tests.
9. OCR and notification jobs run asynchronously.
10. Sensitive actions create audit records.
11. Admin dashboard exposes operational metrics without leaking private case details.
12. Major citizen, lawyer, and admin journeys pass Playwright E2E tests.
