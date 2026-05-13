# UI/UX Design
# Themis

## 1. Product Experience Direction

Themis should feel like a serious public-service legal support tool: calm, clear, trustworthy, and efficient. The interface should prioritize structured guidance, readable legal explanations, and secure case organization over decorative presentation.

The first screen after login should be the relevant role dashboard, not a marketing landing page.

## 2. Design Principles

1. Use plain language and define legal terms near where they appear.
2. Make legal disclaimers visible without blocking every small action.
3. Use step-by-step forms for assessment, complaint, RTI, and lawyer onboarding.
4. Keep case deadlines, hearings, and pending lawyer responses visually prominent.
5. Make document privacy and access state clear.
6. Provide save-and-resume for long legal workflows.
7. Design mobile layouts first for citizen workflows.
8. Keep admin and lawyer workflows dense, scannable, and action-oriented.
9. Use accessible contrast, labels, focus states, and keyboard navigation.
10. Avoid implying certainty in legal suggestions.

## 3. Visual System

### 3.1 Tone

The interface should use restrained colors and practical layouts. It should not feel like a generic SaaS landing page or a decorative portfolio site.

Recommended palette:

| Role | Color Use |
|---|---|
| Base | Neutral white, off-white, slate text, light gray borders |
| Primary action | Deep teal or blue for trusted primary actions |
| Legal knowledge | Indigo accent used sparingly |
| Deadlines and urgent matters | Amber and red status colors |
| Verified/success states | Green status color |
| Disabled/archived | Neutral gray |

### 3.2 Typography

1. Use a highly readable sans-serif font.
2. Keep body text at 16px minimum for citizen-facing content.
3. Use compact table typography for admin and lawyer dashboards.
4. Do not use hero-scale headings inside dashboards or cards.
5. Avoid all-caps labels except short status badges.

### 3.3 Components

Use Shadcn UI and Tailwind CSS for:

1. App shell.
2. Navigation sidebar.
3. Top bar.
4. Breadcrumbs.
5. Cards for repeated items only.
6. Tables.
7. Tabs.
8. Stepper forms.
9. Dialogs.
10. Drawers for details.
11. Toasts.
12. Badges.
13. Alerts.
14. Tooltips.
15. Empty states.
16. File upload dropzones.
17. PDF preview panels.

Do not nest cards inside cards. Use full-width sections or split panes for complex workflows.

## 4. Information Architecture

```text
/login
/auth/callback

/citizen
  /dashboard
  /laws
  /laws/[sectionId]
  /assessments/new
  /assessments/[assessmentId]
  /complaints/new
  /complaints/[draftId]
  /rti/new
  /rti/[draftId]
  /cases
  /cases/[caseId]
  /cases/[caseId]/documents
  /cases/[caseId]/hearings
  /cases/[caseId]/legal-aid
  /notifications
  /profile

/lawyer
  /dashboard
  /profile
  /requests
  /cases
  /cases/[caseId]
  /hearings
  /availability
  /notifications

/admin
  /dashboard
  /users
  /lawyers/pending
  /laws
  /cases
  /documents/flagged
  /notifications/failures
  /audit-logs
  /metrics
  /settings
```

## 5. Global Layout

### 5.1 Authenticated App Shell

Desktop:

1. Left sidebar with role-specific navigation.
2. Top bar with search, notifications, profile menu, and role indicator.
3. Main content area with breadcrumb, page title, primary action, and content.
4. Right detail drawer for contextual previews where useful.

Mobile:

1. Bottom navigation for main citizen actions.
2. Top bar with page title, notifications, and profile menu.
3. Full-screen step flows for assessment, complaint, and RTI.
4. Drawers become full-screen sheets.

### 5.2 Navigation Priority

Citizen:

1. Dashboard.
2. Search Laws.
3. Start Assessment.
4. Cases.
5. Documents.
6. RTI.
7. Legal Aid.

Lawyer:

1. Dashboard.
2. Requests.
3. Assigned Cases.
4. Hearings.
5. Availability.
6. Profile.

Admin:

1. Dashboard.
2. Lawyer Verification.
3. Users.
4. Legal Content.
5. Cases.
6. Documents.
7. Audit Logs.
8. Metrics.

## 6. Citizen Experience

### 6.1 Citizen Dashboard

Primary purpose: help the citizen see what needs attention now.

Required sections:

1. Search bar for legal knowledge.
2. Active cases list with status and urgency.
3. Upcoming hearings with date prominence.
4. Legal aid request status.
5. Recent documents.
6. Saved legal sections.
7. Shortcuts for complaint draft and RTI generation.
8. Notifications.
9. Suggested next actions.

Suggested layout:

```text
[Top: Search laws or describe your issue]

[Attention Needed]
  Upcoming hearing | Pending lawyer response | Draft not exported

[Active Cases]
  Case row: title, category, status, next hearing, assigned lawyer

[Quick Actions]
  Start Assessment | Generate Complaint | Create RTI | Upload Document

[Recent Activity]
  Timeline-style updates from cases and notifications
```

### 6.2 Legal Search

Search page requirements:

1. Large search input with examples.
2. Filters for act, category, bailable status, cognizable status, and review status.
3. Results show act, section number, title, plain-language summary, tags, and reviewed state.
4. Detail page shows original/summarized text, plain explanation, examples, punishment/consequence, related sections, and disclaimer.
5. Bookmark action should be available on result and detail.

UX rule: legal search results must not say "this applies to your case" unless tied to an assessment result with confidence and disclaimer.

### 6.3 Guided Assessment

Assessment should use a stepper:

1. Disclaimer and consent.
2. Issue category.
3. Location and incident date.
4. Incident details.
5. Harm, money/property, digital evidence, minor involvement, accused known.
6. Police contacted and documents available.
7. Urgency and language.
8. Result summary.
9. Next actions.

Result screen:

1. Possible legal categories.
2. Possible sections with confidence labels.
3. Evidence checklist.
4. Recommended next steps.
5. Buttons: create case, generate complaint, request legal aid.
6. Disclaimer repeated in compact form.

### 6.4 Complaint Draft

Complaint draft screen should use a two-pane layout on desktop:

1. Left: structured form fields.
2. Right: live draft preview.
3. Footer: save draft, export PDF, save to case.

Mobile should show form first and preview as a tab.

The draft must remain editable before export. The UI must show a lawyer review recommendation before download.

### 6.5 Case Detail

Case detail should use tabs:

1. Overview.
2. Timeline.
3. Documents.
4. Hearings.
5. Legal Aid.
6. Drafts.
7. Notes.

Overview content:

1. Case status.
2. Urgency.
3. Assigned lawyer.
4. Next hearing.
5. Key legal sections.
6. Recent activity.
7. Open next actions.

### 6.6 Documents

Document UI requirements:

1. Upload dropzone with accepted formats and file size limit.
2. Visible privacy label: private case document.
3. OCR status badge.
4. Malware scan status badge.
5. Preview when supported.
6. Download action through signed URL.
7. Audit-sensitive copy: "Access to this document may be logged."

### 6.7 RTI Generator

RTI flow:

1. Applicant details.
2. Public authority and department.
3. Information requested.
4. Time period and response format.
5. BPL status.
6. Preview and edit.
7. Export PDF or save to case.

Include filing checklist and fee/signature placeholders.

## 7. Lawyer Experience

### 7.1 Lawyer Dashboard

Primary purpose: show pending requests and assigned case obligations.

Required sections:

1. Verification status.
2. Pending legal aid requests.
3. Assigned cases.
4. Upcoming hearings.
5. Response deadlines.
6. Availability status.
7. Active pro-bono case count.
8. Recent documents and notes.

### 7.2 Legal Aid Request Detail

Request detail should show:

1. Case title and category.
2. Urgency.
3. District/state.
4. Citizen-provided summary.
5. Evidence checklist completion.
6. Documents available count, not document contents until access is permitted.
7. Matching score breakdown.
8. Accept and decline actions.

On accept:

1. Confirm the lawyer will gain case access.
2. Update match request status.
3. Assign lawyer to case.
4. Notify citizen.

### 7.3 Assigned Case Workspace

Lawyer case detail should emphasize:

1. Case summary.
2. Citizen contact policy.
3. Documents.
4. Hearings.
5. Notes.
6. Drafts.
7. Timeline.
8. Status update controls.

Lawyer notes should be clearly separated from citizen-visible case information if private notes are supported.

## 8. Admin Experience

### 8.1 Admin Dashboard

Primary purpose: operational review and risk monitoring.

Required sections:

1. Pending lawyer verifications.
2. Total citizens.
3. Total lawyers.
4. Verified lawyers.
5. Active cases.
6. Recently updated laws.
7. Flagged documents.
8. Notification failures.
9. User reports.
10. Platform metrics.
11. System health.

### 8.2 Lawyer Verification

Verification queue requirements:

1. Table with lawyer name, Bar Council number, state, district, specialization, submitted date.
2. Detail drawer with profile and verification documents.
3. Approve action.
4. Reject action with required reason.
5. Audit log entry for every decision.

### 8.3 Legal Content Management

Admin legal content screens:

1. Search and filter legal sections.
2. Create/edit law section form.
3. Review status workflow.
4. Last reviewed date.
5. Source reference.
6. Preview as citizen will see it.

### 8.4 Audit Logs

Audit log UI:

1. Date range filter.
2. Actor filter.
3. Action filter.
4. Entity type filter.
5. Risk-oriented table.
6. Detail drawer with metadata.

Admin case and document access should be visibly logged.

## 9. Key Interaction Patterns

### 9.1 Status Badges

Use badges for:

1. Case status.
2. Urgency.
3. Lawyer verification.
4. OCR status.
5. Malware scan status.
6. Notification delivery status.
7. Legal content review status.

### 9.2 Empty States

Empty states should offer one clear action:

1. No cases: start assessment or create case.
2. No documents: upload document.
3. No hearings: add hearing.
4. No lawyer requests: request legal aid.
5. No law results: adjust filters or try a simpler term.

### 9.3 Error States

Error messages must:

1. Identify what failed.
2. Explain what the user can do.
3. Avoid exposing internal implementation details.
4. Preserve form data.

### 9.4 Loading States

Use skeleton rows for dashboards and tables. Use progress indicators for upload, PDF generation, and OCR queueing.

## 10. Accessibility Requirements

1. All form fields need visible labels.
2. Required fields must be indicated with text, not only color.
3. Buttons need discernible names.
4. Keyboard users must complete all major flows.
5. Focus states must be visible.
6. Warnings and disclaimers must have sufficient contrast.
7. Tables need accessible headers.
8. Toasts should not be the only place where critical information appears.
9. PDF export actions should confirm completion in-page.
10. Future language support should avoid hardcoded layout assumptions.

## 11. Responsive Behavior

| View | Desktop | Mobile |
|---|---|---|
| Dashboard | Multi-column summary and tables | Single-column cards and priority lists |
| Search | Filters left, results right | Filter sheet, results list |
| Assessment | Centered step form | Full-width step form |
| Complaint/RTI | Form and preview split pane | Form/preview tabs |
| Case detail | Tabs plus right summary rail | Tabs stacked, summary first |
| Admin tables | Dense tables with drawers | Tables remain usable; horizontal scroll acceptable for admin |

## 12. MVP Screen Checklist

Citizen MVP:

1. Login callback/profile sync.
2. Citizen dashboard.
3. Legal search and law detail.
4. Guided assessment.
5. Assessment result.
6. Complaint generator.
7. Case list and case detail.
8. Hearing form.
9. Document upload/list/preview.
10. Legal aid request.
11. RTI generator.
12. Notifications.

Lawyer MVP:

1. Lawyer profile setup.
2. Verification pending screen.
3. Lawyer dashboard.
4. Legal aid requests.
5. Assigned cases.
6. Hearing outcome update.
7. Availability settings.

Admin MVP:

1. Admin dashboard.
2. Pending lawyer verification.
3. Legal content management.
4. User management.
5. Audit logs.
6. Metrics.
7. Notification failures.

## 13. Content Guidelines

Use:

1. "Possible legal sections" instead of "applicable legal sections".
2. "Suggested next steps" instead of "legal advice".
3. "Draft for review" instead of "final complaint".
4. "Request legal aid" instead of "hire lawyer" for MVP.
5. "Private case document" instead of vague security labels.

Avoid:

1. Claims of guaranteed legal outcome.
2. Final legal advice language.
3. Implied official filing.
4. Unreviewed AI authority.
5. Hidden disclaimers.
