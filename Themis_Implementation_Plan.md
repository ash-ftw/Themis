# Implementation Plan
# Themis

## 1. Delivery Strategy

Build Themis as a modular monolith with a Next.js frontend, FastAPI backend, PostgreSQL database, S3-compatible document storage, Redis, RabbitMQ, and Celery workers.

The MVP should prioritize end-to-end legal support workflows over advanced integrations. Direct FIR filing, e-Courts integration, payment, video consultation, real-time chat, Aadhaar verification, advanced AI legal advice, full multilingual support, and Kubernetes are out of MVP scope.

## 2. Project Milestones

| Phase | Duration | Outcome |
|---|---:|---|
| 1. Foundation and Architecture | 1-2 weeks | Running monorepo, local stack, CI, base app structure |
| 2. Authentication and Roles | 1-2 weeks | Login/profile sync, role policies, protected routes |
| 3. Legal Knowledge and Search | 1-2 weeks | Seeded legal data, search, law detail, admin content |
| 4. Assessment and Complaint Drafts | 2 weeks | Guided assessment, rule engine, complaint draft, PDF export |
| 5. Case and Hearing Management | 1-2 weeks | Case CRUD, hearings, timeline, assigned lawyer access |
| 6. Lawyer Verification and Legal Aid | 1-2 weeks | Lawyer profile, admin verification, matching, request workflow |
| 7. Documents and OCR | 2 weeks | Secure upload, private storage, OCR worker, document audit |
| 8. RTI and Notifications | 1 week | RTI generator, reminders, notification delivery |
| 9. Admin, Testing, Hardening | 1-2 weeks | Dashboards, metrics, audit review, E2E, security hardening |

Expected MVP timeline: 11-17 weeks depending on team size and polish level.

## 3. Phase 1 - Foundation and Architecture

### Deliverables

1. Monorepo structure.
2. Next.js app in `apps/web`.
3. FastAPI app in `apps/api`.
4. PostgreSQL connection.
5. SQLAlchemy base models.
6. Alembic migration setup.
7. Docker Compose stack.
8. Redis and RabbitMQ services.
9. Celery worker and beat skeleton.
10. MinIO and Mailpit for local development.
11. Basic CI workflow.
12. Linting and formatting.

### Backend Tasks

1. Create FastAPI application factory.
2. Add settings management.
3. Add database session dependency.
4. Add health check endpoint.
5. Add structured logging.
6. Add base exception handlers.
7. Add Alembic initial migration.

### Frontend Tasks

1. Create Next.js App Router project.
2. Configure Tailwind and Shadcn UI.
3. Add app shell placeholder.
4. Add API client setup.
5. Add TanStack Query provider.
6. Add role-based route group structure.

### Acceptance Criteria

1. `docker compose up` runs the local stack.
2. Frontend loads locally.
3. API health check works.
4. Database migrations run.
5. CI runs lint and basic tests.

## 4. Phase 2 - Authentication and Roles

### Deliverables

1. Cognito JWT validation interface.
2. Local development auth adapter.
3. User sync endpoint.
4. User and profile tables.
5. Role-based permissions.
6. Citizen profile flow.
7. Lawyer profile flow foundation.
8. Admin bootstrap role.
9. Protected frontend routes.

### Backend Tasks

1. Implement `users`, `user_profiles`, and `lawyer_profiles` migrations.
2. Add auth dependency to validate JWT or local dev token.
3. Add current user dependency.
4. Add role guard helpers.
5. Implement `/api/v1/auth/me`.
6. Implement `/api/v1/auth/sync-profile`.
7. Implement profile update endpoint.
8. Add audit logging for sensitive auth/profile events.

### Frontend Tasks

1. Add login and auth callback screens.
2. Add profile completion forms.
3. Add role-aware redirects.
4. Add protected layout.
5. Add verification pending state for lawyers.

### Acceptance Criteria

1. Users can sign in.
2. Backend rejects missing or invalid auth.
3. Citizen, lawyer, and admin route access is separated.
4. User profile sync creates local app records.
5. Suspended/inactive users are blocked.

## 5. Phase 3 - Legal Knowledge and Search

### Deliverables

1. `law_sections` and `bookmarks` tables.
2. Seed data loader.
3. Legal search endpoint.
4. Law detail endpoint.
5. Admin legal content CRUD.
6. PostgreSQL FTS and trigram search.
7. Citizen legal search UI.
8. Law detail UI.

### Backend Tasks

1. Add law section model and migration.
2. Enable PostgreSQL `pg_trgm` and search vector support.
3. Implement weighted search vector update.
4. Implement search filters.
5. Implement admin legal content endpoints.
6. Add seed scripts for MVP legal categories and sections.

### Frontend Tasks

1. Build search page with filters.
2. Build result list.
3. Build law detail page.
4. Add bookmark action.
5. Build admin legal content table and edit form.

### Acceptance Criteria

1. User can search by keyword, act, section number, and category.
2. Law detail shows plain-language explanation and metadata.
3. Admin can create and update legal records.
4. Search response meets MVP latency target.

## 6. Phase 4 - Assessment and Complaint Drafts

### Deliverables

1. `assessment_sessions` table.
2. Assessment ruleset format.
3. Dynamic questionnaire engine.
4. Rule-based legal category mapper.
5. Evidence checklist generator.
6. `complaint_drafts` table.
7. Complaint draft generator.
8. PDF export worker.
9. Assessment and complaint frontend flows.

### Backend Tasks

1. Implement assessment start, answer, analyze, get, and save-to-case endpoints.
2. Version assessment rules.
3. Implement rule matching by category, answers, harm, evidence, location, and urgency.
4. Generate possible legal sections with confidence labels.
5. Generate evidence checklist.
6. Implement complaint draft generation from assessment.
7. Implement editable draft update.
8. Implement PDF export job.

### Frontend Tasks

1. Build assessment stepper.
2. Build dynamic question rendering.
3. Build assessment result page.
4. Build complaint form and preview.
5. Add export PDF action and status.
6. Add save-to-case action.

### Acceptance Criteria

1. User completes assessment.
2. System suggests possible categories and sections without claiming certainty.
3. Evidence checklist is generated.
4. Complaint draft is editable.
5. PDF export produces a stored document.
6. Disclaimers are visible before and after generated output.

## 7. Phase 5 - Case and Hearing Management

### Deliverables

1. `cases`, `case_timeline_events`, and `hearings` tables.
2. Case CRUD endpoints.
3. Hearing CRUD endpoints.
4. Case timeline generation.
5. Citizen case list and detail.
6. Lawyer assigned-case APIs.
7. Hearing reminder scheduling hook.

### Backend Tasks

1. Implement case model and status workflow.
2. Add create case from assessment.
3. Add timeline event helper.
4. Add hearing endpoints.
5. Enforce citizen ownership and lawyer assignment policies.
6. Add tests for unauthorized case and hearing access.

### Frontend Tasks

1. Build citizen dashboard case summary.
2. Build case list.
3. Build case detail tabs.
4. Build hearing form.
5. Build timeline view.
6. Build lawyer assigned case page.

### Acceptance Criteria

1. Citizen can create and update cases.
2. Citizen can create a case from assessment.
3. Hearings can be added and updated.
4. Case timeline reflects key actions.
5. Lawyers access only assigned cases.
6. Unauthorized users are blocked.

## 8. Phase 6 - Lawyer Verification and Legal Aid Matching

### Deliverables

1. Lawyer profile completion.
2. Admin verification queue.
3. `match_requests` table.
4. Matching score implementation.
5. Legal aid request workflow.
6. Lawyer accept/decline flow.
7. Citizen and lawyer notifications.

### Backend Tasks

1. Implement lawyer profile endpoints.
2. Implement admin approve/reject endpoints.
3. Add admin action audit records.
4. Implement matching query for verified lawyers.
5. Implement scoring breakdown.
6. Implement legal aid request creation.
7. Implement accept, decline, cancel, expire logic.
8. Update case lawyer assignment on acceptance.

### Frontend Tasks

1. Build lawyer profile setup.
2. Build verification pending screen.
3. Build admin verification table and detail drawer.
4. Build legal aid request UI from case page.
5. Build lawyer request inbox.
6. Build request detail with accept/decline actions.

### Acceptance Criteria

1. Admin can approve or reject lawyer.
2. Unverified lawyers do not appear in suggestions.
3. Citizen can request legal aid for a case.
4. Lawyer can accept or decline.
5. Acceptance assigns lawyer to case.
6. Citizen receives response notification.

## 9. Phase 7 - Documents and OCR

### Deliverables

1. `documents` table.
2. Signed upload flow.
3. Signed download flow.
4. Private MinIO/S3 object storage integration.
5. OCR Celery task.
6. Document list and preview UI.
7. Document audit logs.
8. File validation and malware status field.

### Backend Tasks

1. Implement presign upload endpoint.
2. Implement complete upload endpoint.
3. Validate file metadata.
4. Store object key, hash, MIME type, size, document type.
5. Queue OCR job after upload.
6. Implement OCR status transitions.
7. Implement download URL endpoint with authorization.
8. Log document access.

### Frontend Tasks

1. Build document upload dropzone.
2. Show upload progress.
3. Build document list.
4. Show OCR and malware status.
5. Add preview/download actions.
6. Add document privacy messaging.

### Acceptance Criteria

1. User can upload supported files.
2. Files are private.
3. Documents link to cases.
4. OCR runs asynchronously.
5. Unauthorized downloads are blocked.
6. Access to sensitive documents is logged.

## 10. Phase 8 - RTI and Notifications

### Deliverables

1. `rti_drafts` table.
2. RTI generator.
3. RTI PDF export.
4. `notifications` and `notification_preferences` tables.
5. Hearing reminder tasks.
6. Email delivery integration.
7. Notification center.

### Backend Tasks

1. Implement RTI generate, get, update, export, save-to-case endpoints.
2. Implement notification creation service.
3. Implement notification delivery worker.
4. Implement reminder scheduling for hearings.
5. Add idempotency keys for reminders.
6. Add retry and failure logging.

### Frontend Tasks

1. Build RTI stepper.
2. Build RTI preview and edit screen.
3. Add export and save-to-case actions.
4. Build notification list.
5. Add notification read state.
6. Build preferences screen if time allows.

### Acceptance Criteria

1. User can generate RTI draft.
2. User can edit and export RTI PDF.
3. Hearing reminders are sent.
4. Notification failures are logged.
5. Duplicate reminders are prevented.

## 11. Phase 9 - Admin, Testing, and Hardening

### Deliverables

1. Admin dashboard.
2. User management.
3. Audit log viewer.
4. Metrics endpoints.
5. Notification failure screen.
6. Optional GraphQL read layer.
7. Integration tests.
8. Playwright E2E tests.
9. Security hardening.
10. Final documentation.

### Backend Tasks

1. Implement admin metrics endpoints.
2. Implement audit log filters.
3. Add notification failure endpoint.
4. Add user suspend/reactivate.
5. Add rate limiting.
6. Add GraphQL read layer only if REST dashboards become too chatty.
7. Add integration tests for critical APIs.
8. Review logging for sensitive data leaks.

### Frontend Tasks

1. Build admin dashboard.
2. Build user table.
3. Build audit log table and detail drawer.
4. Build metrics charts.
5. Build notification failure list.
6. Add final responsive polish.
7. Add Playwright tests for core journeys.

### Acceptance Criteria

1. Admin flows work end to end.
2. Audit logs capture sensitive actions.
3. Major citizen, lawyer, and admin journeys pass E2E.
4. Permissions are covered by tests.
5. Documentation is complete.

## 12. Suggested Repository Structure

```text
Themis/
  apps/
    web/
      app/
      components/
      features/
      hooks/
      lib/
      schemas/
      tests/
    api/
      app/
        api/v1/
        core/
        models/
        schemas/
        repositories/
        services/
        domain/
        tasks/
        integrations/
        graphql/
      alembic/
      tests/
  data/
    seed/
  docs/
  infra/
    terraform/
  docker-compose.yml
  README.md
  .env.example
```

## 13. Testing Plan

Backend tests:

1. Auth dependency tests.
2. Role guard tests.
3. Case access policy tests.
4. Document access policy tests.
5. Legal search tests.
6. Assessment rules tests.
7. Complaint and RTI generation tests.
8. Legal aid matching tests.
9. Notification idempotency tests.
10. Worker retry tests.

Frontend tests:

1. Form validation unit tests.
2. Dashboard rendering tests.
3. Assessment stepper tests.
4. Complaint preview tests.
5. Admin table interaction tests.

E2E tests:

1. Citizen assessment to case to complaint flow.
2. Citizen document upload flow.
3. Citizen legal aid request to lawyer acceptance.
4. Lawyer verification flow.
5. Admin legal content update.
6. Hearing reminder scheduling at API level.

## 14. Security Checklist

1. JWT validation on all protected routes.
2. RBAC checks on every service method.
3. Case ownership checks.
4. Lawyer assignment checks.
5. Admin audit logging.
6. Private object storage only.
7. Signed URL expiry.
8. File type and size validation.
9. Rate limiting.
10. No sensitive legal details in logs.
11. Secrets outside source control.
12. Database migrations reviewed.
13. GraphQL depth limits if enabled.
14. Backup and restore tested before production pilot.

## 15. MVP Definition of Done

1. Citizen can register, search laws, complete assessment, generate complaint, create case, upload document, add hearing, request legal aid, and generate RTI.
2. Lawyer can register, complete profile, get verified, accept legal aid request, view assigned case, and update hearing outcome.
3. Admin can verify lawyers, manage legal content, view audit logs, and monitor metrics.
4. Documents are private and served only through authorized signed URLs.
5. OCR, PDF exports, reminders, and notifications run through background workers.
6. Sensitive actions are audit logged.
7. Core flows have automated tests.
8. Local development environment is documented and reproducible.
9. Production deployment path is documented for AWS Mumbai on ECS/Fargate.
