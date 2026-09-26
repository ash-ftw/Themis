# Themis: An Integrated Digital Platform for Legal Aid, Document Automation, and Case Management in India

Themis is a production-ready legal tech platform designed to bridge the gap between citizens, legal professionals, and legal aid services in India. It consolidates document orchestration, AI-driven legal assessments, automated RTI/complaint generation, secure MinIO object storage, OCR processing, verified attorney matching, and case/hearing timeline management.

The target specification and blueprint for this project encompasses functional requirements, user stories, module distribution, normalized database schema, and UI design.

---

## Project Specification & Team Ownership

The system is divided into three core modules with clear team member ownership:

| Module | Owner | Key Responsibilities |
|---|---|---|
| **Frontend Dashboard** | **Abiya John** | Design citizen, attorney & coordinator interfaces, guided assessment flow, document upload UI, case timeline views, responsive 3-panel layouts, and state management. |
| **Backend API** | **A R Devadathan** | Develop FastAPI services, authentication, REST APIs, database schema, Alembic migrations, Celery task integration, and business logic. |
| **Document, OCR & Case Engine** | **Amal K R** | Implement MinIO document repository, signed uploads, OCR processing pipeline, RTI/complaint document generation, attorney-matching engine, and case/hearing timeline automation. |

### Shared Responsibilities
- Docker Compose configuration & multi-container stack
- CI/CD pipeline & system integration
- Database migration review (Alembic)
- Testing & production deployment

---

## Core System Architecture & Target Specifications

### 1. Technology Stack
- **Frontend**: Next.js App Router, TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python 3.12+), Pydantic v2, SQLAlchemy 2.x, Alembic
- **Database & Storage**: PostgreSQL (system of record), MinIO (S3-compatible private document storage)
- **Async Task Queue**: Celery backed by RabbitMQ (OCR extraction, document generation, reminders)
- **Caching & Rate Limiting**: Redis

### 2. Design System & UI Tokens
- **Color Palette**:
  - **Deep Navy (`#1B2A41`)**: Primary color for headers, navigation, and key actions (institutional trust).
  - **Warm White (`#FAF9F6`)**: Primary background for high readability and approachable feel.
  - **Justice Gold (`#C9A24B`)**: Accent for completed timeline milestones, active states, and emblem.
  - **Slate Grey (`#5B6570`)**: Secondary text and UI chrome.
  - **Alert Terracotta (`#B5502D`)**: Deadlines, overdue actions, and critical case alerts.
- **Typography**: **Source Serif 4** (headings & wordmark) + **Inter** (body, forms, case data).
- **Layout Architecture**: **3-Panel Citizen Dashboard** (Left Navigation Rail, Center Active Workspace/Timeline, Right Case Summary & Attorney Panel).
- **Signature Visual Element**: **Case Journey Timeline** — A vertical, milestone-based progress tracker (`Assessment` → `Document Filed` → `Attorney Assigned` → `Hearing Scheduled` → `Resolved`).

### 3. Core Database Entities
The PostgreSQL database schema models 8 normalized core entities:
`Users`, `Cases`, `Assessments`, `Documents`, `Generated Documents`, `Attorney Verifications`, `Hearings`, and `Audit Logs`.

---

## Documentation Index

All project documentation leads directly to the final product architecture:

1. **Product Requirements**: [`Themis_Revised_Detailed_PRD.md`](Themis_Revised_Detailed_PRD.md)
2. **Technical Requirements**: [`Themis_TRD.md`](Themis_TRD.md)
3. **Backend Schema & DDL**: [`Themis_Backend_Schema.md`](Themis_Backend_Schema.md)
4. **UI/UX Design Specification**: [`Themis_UI_UX_Design.md`](Themis_UI_UX_Design.md)
5. **Application Workflow**: [`Themis_App_Flow.md`](Themis_App_Flow.md)
6. **Implementation Plan**: [`Themis_Implementation_Plan.md`](Themis_Implementation_Plan.md)
7. **UML & Normalization**: [`docs/Themis_Phase4_UML_TableDesign_Normalization.md`](docs/Themis_Phase4_UML_TableDesign_Normalization.md)
8. **Development Setup**: [`docs/development.md`](docs/development.md)
9. **Production Readiness**: [`docs/production-readiness.md`](docs/production-readiness.md)
10. **E2E Pilot Checklist**: [`docs/pilot-e2e-checklist.md`](docs/pilot-e2e-checklist.md)

---

## Quick Start

```powershell
docker compose up --build
```

Then open in your browser:
1. Web app: `http://localhost:3000`
2. API health: `http://localhost:8000/health`
3. API docs: `http://localhost:8000/docs`
4. API readiness: `http://localhost:8000/api/v1/health/ready`

Run database migrations:
```powershell
docker compose run --rm api alembic upgrade head
```

Seed legal knowledge base:
```powershell
docker compose run --rm api python scripts/seed_legal_data.py
```

Local development auth accepts bearer tokens such as `dev-citizen`, `dev-lawyer`, and `dev-admin`.

