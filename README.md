# Themis

Themis is an Indian legal aid, legal knowledge, document management, and case-support platform.

This repository now contains the initial application scaffold based on the PRD and derived planning artifacts:

1. FastAPI backend in `apps/api`.
2. Next.js frontend in `apps/web`.
3. PostgreSQL, Redis, RabbitMQ, MinIO, and Mailpit local stack in `docker-compose.yml`.
4. SQLAlchemy schema modules aligned with `Themis_Backend_Schema.md`.
5. Celery task entry points for OCR, PDF exports, notifications, and reminders.
6. Phase 2 local auth and role scaffolding for protected API/frontend flows.
7. Phase 3 legal knowledge search and admin content management.
8. Phase 4 guided assessments and editable complaint draft generation.
9. Phase 5 case and hearing management with timeline and assigned lawyer access.
10. Phase 6 lawyer verification and legal aid request matching.

## Documentation

Planning artifacts:

1. `Themis_Revised_Detailed_PRD.md`
2. `Themis_TRD.md`
3. `Themis_Backend_Schema.md`
4. `Themis_UI_UX_Design.md`
5. `Themis_App_Flow.md`
6. `Themis_Implementation_Plan.md`

Development setup:

1. `docs/development.md`

## Quick Start

```powershell
docker compose up --build
```

Then open:

1. Web app: `http://localhost:3000`
2. API health: `http://localhost:8000/health`
3. API docs: `http://localhost:8000/docs`

Run database migrations:

```powershell
docker compose run --rm api alembic upgrade head
```

Local development auth accepts bearer tokens such as `dev-citizen`, `dev-lawyer`, and `dev-admin`.

Create `.env` from `.env.example` only when you need to override the local defaults.

## Build Order

The implementation should continue in this order:

1. Document repository and OCR.
2. RTI generation and notifications.
3. Admin dashboard, audit logs, metrics, and hardening.
