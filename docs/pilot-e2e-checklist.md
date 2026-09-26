# Pilot E2E Checklist

Run these end-to-end verification checks against a deployed environment to validate all functional workflows.

Use test users and test documents only.

---

## Citizen Journey

1. Sign in as a citizen.
2. Complete profile sync.
3. Search legal sections by keyword.
4. Complete an assessment.
5. Generate and edit a complaint draft.
6. Save the complaint to a case.
7. Upload a case document and confirm OCR status is visible.
8. Add a hearing and schedule reminders.
9. Request legal aid.
10. Generate an RTI draft and save it to a case.
11. Open the notification center and mark notifications read.

## Lawyer Journey

1. Sign in as a lawyer.
2. Complete lawyer profile.
3. Confirm pending verification state blocks assigned-case workflows.
4. After admin approval, open legal aid requests.
5. Accept a request.
6. Open the assigned case.
7. Update hearing details.
8. Download an authorized case document.

## Admin Journey

1. Sign in as an admin.
2. Approve a pending lawyer.
3. Edit a legal content record.
4. Open metrics on the admin dashboard.
5. Filter users by role and active status.
6. Suspend and reactivate a non-admin test user.
7. Filter audit logs by action and entity type.
8. Review notification failures.
9. Confirm admin actions are audit logged.

## Negative Permission Checks

1. Citizen cannot access lawyer routes.
2. Lawyer cannot access admin routes.
3. Unassigned lawyer cannot open another lawyer's assigned case.
4. Citizen cannot download another citizen's document.
5. Suspended user cannot access protected API routes.
6. Missing bearer token returns `401`.
7. Wrong role returns `403`.

## Exit Criteria

1. All critical journeys pass.
2. No API offline state appears in the web app.
3. No unexpected notification failures remain.
4. Audit logs exist for auth, profile, document, legal aid, admin, RTI, and notification actions.
5. Backup and restore checks from `docs/production-readiness.md` have been completed.
