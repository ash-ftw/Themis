# Production Readiness

This runbook turns the local MVP into a production deployment for the **Themis** platform.

The preferred production deployment shape is AWS Mumbai (`ap-south-1`) on ECS/Fargate with managed PostgreSQL, managed Redis, S3-compatible private object storage, RabbitMQ or Amazon MQ, and separately managed secrets.

---

## Required Services

1. API: FastAPI container from `apps/api`.
2. Web: Next.js container from `apps/web`.
3. Worker: Celery worker from `apps/api`.
4. Beat: Celery beat scheduler from `apps/api`.
5. PostgreSQL 16.
6. Redis 7.
7. RabbitMQ or Amazon MQ.
8. Private object storage bucket.
9. Email/SMS provider adapter before enabling non-in-app notification channels.

## Environment Checklist

Set these values outside source control:

1. `ENVIRONMENT=production`
2. `ENABLE_DOCS=false`
3. `LOCAL_AUTH_ENABLED=false`
4. `AUTH_ISSUER`, `AUTH_AUDIENCE`, `AUTH_JWKS_URL`
5. `DATABASE_URL`
6. `REDIS_URL`
7. `RABBITMQ_URL`
8. `OBJECT_STORAGE_ENDPOINT`
9. `OBJECT_STORAGE_BUCKET`
10. `OBJECT_STORAGE_REGION=ap-south-1`
11. `OBJECT_STORAGE_ACCESS_KEY`
12. `OBJECT_STORAGE_SECRET_KEY`
13. `CORS_ORIGINS=["https://<production-web-domain>"]`
14. `API_BASE_URL=https://<production-api-domain>`
15. `NEXT_PUBLIC_API_BASE_URL=https://<production-api-domain>`
16. `RATE_LIMIT_ENABLED=true`
17. `RATE_LIMIT_REQUESTS_PER_MINUTE=<pilot limit>`
18. `RATE_LIMIT_WINDOW_SECONDS=60`

## Health Checks

Use liveness for container process checks:

```powershell
Invoke-WebRequest https://<api-domain>/health
```

Use readiness for deployment gating because it validates database connectivity:

```powershell
Invoke-WebRequest https://<api-domain>/api/v1/health/ready
```

A readiness failure returns HTTP `503` with per-dependency status in the response body.

## Deployment Sequence

1. Build and push API and web images from the same Git commit.
2. Apply infrastructure changes.
3. Run database migrations once:

```powershell
alembic upgrade head
```

4. Start API, worker, beat, and web services.
5. Confirm `/health` and `/api/v1/health/ready`.
6. Sign in as a bootstrap admin and confirm `/admin/dashboard`.
7. Run the pilot E2E checklist in `docs/pilot-e2e-checklist.md`.
8. Watch admin notification failures and audit logs for the first pilot sessions.

## Backup And Restore

Before pilot launch:

1. Enable automated PostgreSQL backups with point-in-time recovery.
2. Take a manual backup after migrations and seed data.
3. Enable object storage versioning or daily bucket backup.
4. Test restoring PostgreSQL into a staging database.
5. Test restoring at least one uploaded document object.
6. Record RPO and RTO targets for the pilot.

## Security Review

1. Confirm docs are disabled in production.
2. Confirm local development tokens are disabled.
3. Confirm CORS only allows the deployed web origin.
4. Confirm object storage is private and downloads use signed URLs.
5. Confirm rate limiting is enabled.
6. Confirm audit logs redact tokens, passwords, secrets, and Aadhaar-like keys.
7. Confirm admins cannot suspend their own account.
8. Confirm logs do not include complaint, RTI, or document body content.

## Rollback

1. Stop new traffic at the load balancer.
2. Roll ECS/Fargate services back to the previous image tag.
3. If a migration must be reversed, run the matching Alembic downgrade only after confirming the
   migration is backward compatible with stored data.
4. Keep worker and beat versions aligned with API schema versions.
5. Re-run readiness checks and the highest-risk E2E scenario before reopening traffic.
