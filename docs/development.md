# Development

## Prerequisites

1. Docker Desktop or compatible Docker Engine.
2. Node.js 22+ if running the frontend outside Docker.
3. Python 3.12+ if running the backend outside Docker.

## First Run

Start the stack:

```powershell
docker compose up --build
```

The Compose file has local defaults. Create `.env` from `.env.example` only when you need to override ports, credentials, or integration settings.

Local URLs:

1. Web app: `http://localhost:3000`
2. API health: `http://localhost:8000/health`
3. API docs: `http://localhost:8000/docs`
4. RabbitMQ console: `http://localhost:15672`
5. MinIO console: `http://localhost:9001`
6. Mailpit: `http://localhost:8025`

## Database Migrations

Run migrations from the API container:

```powershell
docker compose run --rm api alembic upgrade head
```

Create a migration after model changes:

```powershell
docker compose run --rm api alembic revision --autogenerate -m "describe change"
```

## Backend Checks

```powershell
docker compose run --rm api pytest
docker compose run --rm api ruff check .
docker compose run --rm api mypy app
```

## Frontend Checks

```powershell
docker compose run --rm web npm run lint
docker compose run --rm web npm run build
```

## Current Scope

Phase 1 foundations from the implementation plan are implemented:

1. Monorepo structure.
2. FastAPI app shell.
3. SQLAlchemy model layer aligned to the schema artifact.
4. Alembic migration wiring.
5. Celery worker entry points.
6. Next.js app shell.
7. Local Docker Compose services.
8. Basic CI for API checks, web checks, and Docker Compose config validation.

Phase 2 authentication and roles are implemented. The backend includes local development bearer tokens, Cognito JWT/JWKS validation, current-user dependencies, role guards, profile sync/update endpoints, and auth/profile audit logging. The frontend includes local role sign-in, protected route middleware, role-aware redirects, profile screens, and a lawyer verification pending state.

Local development auth tokens:

1. `Authorization: Bearer dev-citizen`
2. `Authorization: Bearer dev-lawyer`
3. `Authorization: Bearer dev-admin`
4. `Authorization: Bearer dev:<external_auth_id>:<email>:<role>[:phone]`

Phase 3 legal knowledge and search is implemented. The backend includes legal search, detail, bookmark, admin create/update endpoints, FTS/trigram migration support, and seed data loading. The frontend includes citizen legal search/detail pages, bookmark submission, and an admin legal content table with create/update form.

Phase 4 assessment and complaint draft generation is implemented. The backend includes versioned assessment rules, dynamic category questions, start/answer/analyze/get/save-to-case endpoints, complaint draft generate/get/update/export/save-to-case endpoints, export document metadata, and audit logging. The frontend includes a guided assessment form, result page with disclaimers, possible section suggestions with confidence labels, evidence checklists, manual complaint creation, editable draft preview, PDF export action, and save-to-case action.

Phase 5 case and hearing management is implemented. The backend includes case CRUD, hearing CRUD, timeline event helpers, hearing reminder scheduling hooks, citizen ownership checks, lawyer assigned-case access checks, and case/hearing indexes. The frontend includes citizen case summary, case list/create/detail pages, hearing forms, timeline display, and lawyer assigned-case list/detail pages.

Phase 6 lawyer verification and legal aid matching is implemented. The backend includes lawyer profile upsert/read endpoints, admin verification queue and approve/reject endpoints, verified lawyer matching with scoring breakdowns, legal aid request create/list/cancel/expire/accept/decline flows, case assignment on acceptance, timeline events, notifications, and legal aid indexes. The frontend includes lawyer profile submission, admin verification queue actions, citizen legal aid matching from case detail, and lawyer legal aid request inbox with accept/decline actions.

Phase 7 and later feature endpoints for document storage, OCR, RTI, and admin hardening should be implemented in the phase order defined by `Themis_Implementation_Plan.md`.

Seed legal sections after migrations:

```powershell
docker compose run --rm api python scripts/seed_legal_data.py
```
