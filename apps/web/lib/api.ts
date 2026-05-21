const apiBaseUrl =
  process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export type LawSection = {
  id: string;
  act_name: string;
  section_number: string;
  title: string;
  original_text: string | null;
  plain_language: string;
  example_scenarios: string[];
  punishment: string | null;
  is_bailable: boolean | null;
  is_cognizable: boolean | null;
  ipc_mapping: string | null;
  related_sections: string[];
  category_tags: string[];
  jurisdiction_notes: string | null;
  source_reference: string | null;
  review_status: "draft" | "reviewed" | "deprecated";
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LawSearchResponse = {
  query: string | null;
  total: number;
  limit: number;
  offset: number;
  elapsed_ms: number;
  results: Array<{
    law_section: LawSection;
    rank: number | null;
  }>;
};

export type AssessmentQuestion = {
  key: string;
  label: string;
  input_type: "text" | "textarea" | "select" | "date" | "boolean";
  required: boolean;
  options: string[];
  help_text: string | null;
};

export type AssessmentCategory = {
  key: string;
  label: string;
  description: string;
  questions: AssessmentQuestion[];
};

export type SectionSuggestion = {
  section: string;
  confidence: "low" | "medium" | "high";
  rationale: string;
};

export type EvidenceChecklistItem = {
  label: string;
  required: boolean;
  reason: string;
};

export type AssessmentSession = {
  id: string;
  issue_category: string;
  state: string | null;
  district: string | null;
  answers: Record<string, unknown>;
  suggested_sections: string[];
  suggested_categories: string[];
  section_suggestions: SectionSuggestion[];
  evidence_checklist: EvidenceChecklistItem[];
  next_steps: string[];
  result_summary: string | null;
  ruleset_version: string;
  disclaimer_accepted: boolean;
  complaint_eligible: boolean;
  rti_eligible: boolean;
  legal_aid_recommended: boolean;
  case_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ComplaintDraft = {
  id: string;
  case_id: string | null;
  assessment_id: string | null;
  draft_text: string;
  structured_fields: Record<string, unknown>;
  status: "draft" | "exported" | "saved_to_case";
  pdf_document_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CaseUrgency = "low" | "medium" | "high" | "emergency";

export type CaseStatus =
  | "draft"
  | "assessment_completed"
  | "complaint_prepared"
  | "complaint_submitted"
  | "fir_filed"
  | "under_investigation"
  | "legal_aid_requested"
  | "lawyer_assigned"
  | "in_court"
  | "hearing_scheduled"
  | "awaiting_order"
  | "closed"
  | "archived";

export type CaseRecord = {
  id: string;
  citizen_id: string;
  lawyer_id: string | null;
  title: string;
  category: string;
  state: string;
  district: string;
  urgency: CaseUrgency;
  fir_number: string | null;
  police_station: string | null;
  court_name: string | null;
  case_number: string | null;
  status: CaseStatus;
  sections: string[];
  description: string;
  metadata: Record<string, unknown>;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CaseListResponse = {
  total: number;
  limit: number;
  offset: number;
  results: CaseRecord[];
};

export type CaseTimelineEvent = {
  id: string;
  case_id: string;
  actor_id: string | null;
  event_type: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type HearingRecord = {
  id: string;
  case_id: string;
  hearing_date: string;
  hearing_time: string | null;
  court: string;
  court_room: string | null;
  judge: string | null;
  purpose: string;
  outcome: string | null;
  next_date: string | null;
  notes: string | null;
  added_by: string;
  reminder_status: string;
  created_at: string;
  updated_at: string;
};

export type VerificationStatus = "pending" | "approved" | "rejected";

export type LawyerProfileDetail = {
  user_id: string;
  email: string;
  phone: string | null;
  is_verified: boolean;
  bar_number: string;
  state_bar_council: string;
  district: string;
  specializations: string[];
  languages: string[];
  is_pro_bono: boolean;
  availability: Record<string, unknown>;
  max_active_cases: number;
  active_case_count: number;
  verification_status: VerificationStatus;
  verification_notes: string | null;
  verification_document_id: string | null;
  rating: number | null;
};

export type LawyerSuggestion = {
  lawyer_id: string;
  email: string;
  phone: string | null;
  district: string;
  state_bar_council: string;
  specializations: string[];
  languages: string[];
  is_pro_bono: boolean;
  active_case_count: number;
  max_active_cases: number;
  score: number;
  score_breakdown: Record<string, number>;
};

export type MatchRequestStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "expired"
  | "cancelled"
  | "reassigned";

export type MatchRequest = {
  id: string;
  case_id: string;
  citizen_id: string;
  lawyer_id: string;
  score: number;
  score_breakdown: Record<string, number>;
  status: MatchRequestStatus;
  message: string | null;
  requested_at: string;
  responded_at: string | null;
  expires_at: string | null;
  case_title: string | null;
  case_category: string | null;
  case_district: string | null;
  lawyer_email: string | null;
};

export type DocumentAccessLevel = "case_private" | "lawyer_private" | "admin_review";
export type OcrStatus = "not_started" | "processing" | "completed" | "failed";
export type MalwareScanStatus = "not_scanned" | "clean" | "suspicious" | "failed";

export type DocumentRecord = {
  id: string;
  case_id: string | null;
  uploaded_by: string;
  original_file_name: string;
  object_key: string;
  mime_type: string;
  file_size: number;
  file_hash: string;
  document_type: string;
  ocr_status: OcrStatus;
  ocr_text: string | null;
  access_level: DocumentAccessLevel;
  malware_scan_status: MalwareScanStatus;
  metadata: Record<string, unknown>;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DocumentPresignUploadResponse = {
  upload_url: string;
  method: "PUT";
  object_key: string;
  expires_at: string;
  headers: Record<string, string>;
  max_file_size: number;
};

export type DraftStatus = "draft" | "exported" | "saved_to_case";

export type RTIDraft = {
  id: string;
  user_id: string;
  case_id: string | null;
  public_authority: string;
  department: string | null;
  information_requested: string;
  time_period: string | null;
  preferred_response_format: string | null;
  bpl_status: boolean | null;
  draft_text: string;
  structured_fields: Record<string, unknown>;
  status: DraftStatus;
  pdf_document_id: string | null;
  created_at: string;
  updated_at: string;
};

export type NotificationRecord = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  channel: "email" | "sms" | "in_app";
  status: "pending" | "sent" | "failed";
  idempotency_key: string;
  metadata: Record<string, unknown>;
  sent_at: string | null;
  read_at: string | null;
  created_at: string;
};

export type AdminMetrics = {
  generated_at: string;
  users_total: number;
  users_active: number;
  users_inactive: number;
  users_by_role: Array<{ label: string; count: number }>;
  pending_lawyer_verifications: number;
  law_sections_total: number;
  law_sections_pending_review: number;
  cases_total: number;
  cases_open: number;
  cases_urgent: number;
  hearings_upcoming: number;
  documents_total: number;
  documents_pending_ocr: number;
  documents_suspicious: number;
  legal_aid_pending: number;
  notifications_failed: number;
  notifications_unread: number;
  audit_events_24h: number;
};

export type AdminUser = {
  id: string;
  external_auth_id: string;
  role: AppUserRole;
  email: string;
  phone: string | null;
  is_active: boolean;
  is_verified: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminAuditLog = {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type AdminNotificationFailure = {
  id: string;
  user_id: string;
  user_email: string | null;
  type: string;
  title: string;
  message: string;
  channel: "email" | "sms" | "in_app";
  status: "pending" | "sent" | "failed";
  idempotency_key: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type AppUserRole = "citizen" | "lawyer" | "admin" | "org_user";

export async function getHealth() {
  const response = await fetch(`${apiBaseUrl}/health`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Themis API health check failed.");
  }

  return response.json() as Promise<{
    status: string;
    service: string;
    version: string;
    environment: string;
  }>;
}

export async function getCurrentUser(authToken: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/auth/me`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load the current Themis user.");
  }

  return response.json();
}

export async function syncProfile(authToken: string, payload: unknown) {
  const response = await fetch(`${apiBaseUrl}/api/v1/auth/sync-profile`, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to sync the Themis profile.");
  }

  return response.json();
}

export async function searchLaws(
  authToken: string,
  params: {
    q?: string;
    act_name?: string;
    section_number?: string;
    category?: string;
    review_status?: string;
    limit?: string;
    offset?: string;
  }
) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  const response = await fetch(`${apiBaseUrl}/api/v1/laws/search?${query.toString()}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to search Themis legal content.");
  }

  return response.json() as Promise<LawSearchResponse>;
}

export async function getLawSection(authToken: string, sectionId: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/laws/${sectionId}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load the law section.");
  }

  return response.json() as Promise<LawSection>;
}

export async function createLawSection(authToken: string, payload: unknown) {
  const response = await fetch(`${apiBaseUrl}/api/v1/admin/laws`, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to create the legal record.");
  }

  return response.json() as Promise<LawSection>;
}

export async function updateLawSection(authToken: string, sectionId: string, payload: unknown) {
  const response = await fetch(`${apiBaseUrl}/api/v1/admin/laws/${sectionId}`, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json"
    },
    method: "PUT"
  });

  if (!response.ok) {
    throw new Error("Unable to update the legal record.");
  }

  return response.json() as Promise<LawSection>;
}

export async function bookmarkLawSection(authToken: string, sectionId: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/laws/${sectionId}/bookmark`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to bookmark the law section.");
  }

  return response.json() as Promise<{
    id: string;
    law_section_id: string;
    created_at: string;
  }>;
}

export async function getAssessmentCategories(authToken: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/assessments/categories`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load assessment categories.");
  }

  return response.json() as Promise<{
    ruleset_version: string;
    categories: AssessmentCategory[];
  }>;
}

export async function startAssessment(authToken: string, payload: unknown) {
  const response = await fetch(`${apiBaseUrl}/api/v1/assessments/start`, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to start the assessment.");
  }

  return response.json() as Promise<AssessmentSession>;
}

export async function answerAssessment(authToken: string, assessmentId: string, payload: unknown) {
  const response = await fetch(`${apiBaseUrl}/api/v1/assessments/${assessmentId}/answer`, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to save assessment answers.");
  }

  return response.json() as Promise<AssessmentSession>;
}

export async function analyzeAssessment(authToken: string, assessmentId: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/assessments/${assessmentId}/analyze`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to analyze the assessment.");
  }

  return response.json() as Promise<AssessmentSession>;
}

export async function getAssessment(authToken: string, assessmentId: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/assessments/${assessmentId}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load the assessment.");
  }

  return response.json() as Promise<AssessmentSession>;
}

export async function saveAssessmentToCase(authToken: string, assessmentId: string, payload: unknown) {
  const response = await fetch(`${apiBaseUrl}/api/v1/assessments/${assessmentId}/save-to-case`, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to save the assessment to a case.");
  }

  return response.json() as Promise<{
    id: string;
    title: string;
    category: string;
    status: string;
    created_at: string;
  }>;
}

export async function generateComplaint(authToken: string, payload: unknown) {
  const response = await fetch(`${apiBaseUrl}/api/v1/complaints/generate`, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to generate the complaint draft.");
  }

  return response.json() as Promise<ComplaintDraft>;
}

export async function getComplaintDraft(authToken: string, draftId: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/complaints/${draftId}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load the complaint draft.");
  }

  return response.json() as Promise<ComplaintDraft>;
}

export async function updateComplaintDraft(authToken: string, draftId: string, payload: unknown) {
  const response = await fetch(`${apiBaseUrl}/api/v1/complaints/${draftId}`, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json"
    },
    method: "PATCH"
  });

  if (!response.ok) {
    throw new Error("Unable to update the complaint draft.");
  }

  return response.json() as Promise<ComplaintDraft>;
}

export async function exportComplaintPdf(authToken: string, draftId: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/complaints/${draftId}/export-pdf`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to queue the complaint PDF export.");
  }

  return response.json() as Promise<{
    draft: ComplaintDraft;
    document_id: string;
    status: string;
    object_key: string;
  }>;
}

export async function saveComplaintToCase(authToken: string, draftId: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/complaints/${draftId}/save-to-case`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to save the complaint draft to a case.");
  }

  return response.json();
}

export async function listCases(
  authToken: string,
  params: {
    case_status?: string;
    include_archived?: string;
    limit?: string;
    offset?: string;
  } = {}
) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  const response = await fetch(`${apiBaseUrl}/api/v1/cases?${query.toString()}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load cases.");
  }

  return response.json() as Promise<CaseListResponse>;
}

export async function listAssignedCases(authToken: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/lawyers/assigned-cases`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load assigned cases.");
  }

  return response.json() as Promise<CaseListResponse>;
}

export async function createCase(authToken: string, payload: unknown) {
  const response = await fetch(`${apiBaseUrl}/api/v1/cases`, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to create the case.");
  }

  return response.json() as Promise<CaseRecord>;
}

export async function getCase(authToken: string, caseId: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/cases/${caseId}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load the case.");
  }

  return response.json() as Promise<CaseRecord>;
}

export async function updateCase(authToken: string, caseId: string, payload: unknown) {
  const response = await fetch(`${apiBaseUrl}/api/v1/cases/${caseId}`, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json"
    },
    method: "PATCH"
  });

  if (!response.ok) {
    throw new Error("Unable to update the case.");
  }

  return response.json() as Promise<CaseRecord>;
}

export async function archiveCase(authToken: string, caseId: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/cases/${caseId}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    },
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error("Unable to archive the case.");
  }

  return response.json() as Promise<CaseRecord>;
}

export async function getCaseTimeline(authToken: string, caseId: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/cases/${caseId}/timeline`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load the case timeline.");
  }

  return response.json() as Promise<{
    case_id: string;
    events: CaseTimelineEvent[];
  }>;
}

export async function listHearings(authToken: string, caseId: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/cases/${caseId}/hearings`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load hearings.");
  }

  return response.json() as Promise<{
    case_id: string;
    hearings: HearingRecord[];
  }>;
}

export async function createHearing(authToken: string, caseId: string, payload: unknown) {
  const response = await fetch(`${apiBaseUrl}/api/v1/cases/${caseId}/hearings`, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to create the hearing.");
  }

  return response.json() as Promise<HearingRecord>;
}

export async function updateHearing(authToken: string, hearingId: string, payload: unknown) {
  const response = await fetch(`${apiBaseUrl}/api/v1/hearings/${hearingId}`, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json"
    },
    method: "PATCH"
  });

  if (!response.ok) {
    throw new Error("Unable to update the hearing.");
  }

  return response.json() as Promise<HearingRecord>;
}

export async function deleteHearing(authToken: string, hearingId: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/hearings/${hearingId}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    },
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error("Unable to delete the hearing.");
  }
}

export async function scheduleHearingReminders(authToken: string, hearingId: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/hearings/${hearingId}/schedule-reminders`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to schedule hearing reminders.");
  }

  return response.json() as Promise<{
    hearing: HearingRecord;
    status: string;
    reminder_key: string;
  }>;
}

export async function getLawyerProfile(authToken: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/lawyers/profile`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load lawyer profile.");
  }

  return response.json() as Promise<LawyerProfileDetail>;
}

export async function upsertLawyerProfile(authToken: string, payload: unknown) {
  const response = await fetch(`${apiBaseUrl}/api/v1/lawyers/profile`, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json"
    },
    method: "PUT"
  });

  if (!response.ok) {
    throw new Error("Unable to save lawyer profile.");
  }

  return response.json() as Promise<LawyerProfileDetail>;
}

export async function listLawyerVerifications(authToken: string, verificationStatus = "pending") {
  const query = new URLSearchParams({ verification_status: verificationStatus });
  const response = await fetch(`${apiBaseUrl}/api/v1/admin/lawyers/verifications?${query}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load lawyer verifications.");
  }

  return response.json() as Promise<{
    total: number;
    lawyers: LawyerProfileDetail[];
  }>;
}

export async function approveLawyer(authToken: string, lawyerId: string, payload: unknown) {
  const response = await fetch(`${apiBaseUrl}/api/v1/admin/lawyers/${lawyerId}/approve`, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to approve lawyer.");
  }

  return response.json() as Promise<LawyerProfileDetail>;
}

export async function rejectLawyer(authToken: string, lawyerId: string, payload: unknown) {
  const response = await fetch(`${apiBaseUrl}/api/v1/admin/lawyers/${lawyerId}/reject`, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to reject lawyer.");
  }

  return response.json() as Promise<LawyerProfileDetail>;
}

export async function suggestLawyersForCase(authToken: string, caseId: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/legal-aid/cases/${caseId}/suggestions`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load lawyer suggestions.");
  }

  return response.json() as Promise<{
    case_id: string;
    suggestions: LawyerSuggestion[];
  }>;
}

export async function createLegalAidRequest(authToken: string, caseId: string, payload: unknown) {
  const response = await fetch(`${apiBaseUrl}/api/v1/legal-aid/cases/${caseId}/requests`, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to create legal aid request.");
  }

  return response.json() as Promise<MatchRequest>;
}

export async function listCitizenLegalAidRequests(authToken: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/legal-aid/requests`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load legal aid requests.");
  }

  return response.json() as Promise<{
    total: number;
    requests: MatchRequest[];
  }>;
}

export async function cancelLegalAidRequest(authToken: string, requestId: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/legal-aid/requests/${requestId}/cancel`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to cancel legal aid request.");
  }

  return response.json() as Promise<MatchRequest>;
}

export async function listLawyerLegalAidRequests(authToken: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/lawyers/legal-aid-requests`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load lawyer legal aid requests.");
  }

  return response.json() as Promise<{
    total: number;
    requests: MatchRequest[];
  }>;
}

export async function acceptLegalAidRequest(authToken: string, requestId: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/lawyers/legal-aid-requests/${requestId}/accept`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to accept legal aid request.");
  }

  return response.json() as Promise<MatchRequest>;
}

export async function declineLegalAidRequest(authToken: string, requestId: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/lawyers/legal-aid-requests/${requestId}/decline`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to decline legal aid request.");
  }

  return response.json() as Promise<MatchRequest>;
}

export async function presignDocumentUpload(authToken: string, payload: unknown) {
  const response = await fetch(`${apiBaseUrl}/api/v1/documents/presign-upload`, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to prepare the document upload.");
  }

  return response.json() as Promise<DocumentPresignUploadResponse>;
}

export async function completeDocumentUpload(authToken: string, payload: unknown) {
  const response = await fetch(`${apiBaseUrl}/api/v1/documents/complete-upload`, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to complete the document upload.");
  }

  return response.json() as Promise<DocumentRecord>;
}

export async function listCaseDocuments(authToken: string, caseId: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/cases/${caseId}/documents`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load case documents.");
  }

  return response.json() as Promise<{
    case_id: string;
    total: number;
    documents: DocumentRecord[];
  }>;
}

export async function getDocumentDownloadUrl(authToken: string, documentId: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/documents/${documentId}/download-url`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to create document download link.");
  }

  return response.json() as Promise<{
    document_id: string;
    download_url: string;
    method: "GET";
    expires_at: string;
  }>;
}

export async function requestDocumentOcr(authToken: string, documentId: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/documents/${documentId}/ocr`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to queue document OCR.");
  }

  return response.json() as Promise<{
    document: DocumentRecord;
    status: string;
  }>;
}

export async function deleteDocument(authToken: string, documentId: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/documents/${documentId}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    },
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error("Unable to delete the document.");
  }

  return response.json() as Promise<DocumentRecord>;
}

export async function generateRtiDraft(authToken: string, payload: unknown) {
  const response = await fetch(`${apiBaseUrl}/api/v1/rti/generate`, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to generate the RTI draft.");
  }

  return response.json() as Promise<RTIDraft>;
}

export async function listRtiDrafts(authToken: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/rti`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load RTI drafts.");
  }

  return response.json() as Promise<{
    total: number;
    drafts: RTIDraft[];
  }>;
}

export async function getRtiDraft(authToken: string, draftId: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/rti/${draftId}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load the RTI draft.");
  }

  return response.json() as Promise<RTIDraft>;
}

export async function updateRtiDraft(authToken: string, draftId: string, payload: unknown) {
  const response = await fetch(`${apiBaseUrl}/api/v1/rti/${draftId}`, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json"
    },
    method: "PATCH"
  });

  if (!response.ok) {
    throw new Error("Unable to update the RTI draft.");
  }

  return response.json() as Promise<RTIDraft>;
}

export async function exportRtiPdf(authToken: string, draftId: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/rti/${draftId}/export-pdf`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to queue the RTI PDF export.");
  }

  return response.json() as Promise<{
    draft: RTIDraft;
    document_id: string;
    status: string;
    object_key: string;
  }>;
}

export async function saveRtiToCase(authToken: string, draftId: string, payload: unknown = {}) {
  const response = await fetch(`${apiBaseUrl}/api/v1/rti/${draftId}/save-to-case`, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to save the RTI draft to a case.");
  }

  return response.json() as Promise<{
    case: {
      id: string;
      title: string;
      category: string;
      status: string;
      created_at: string;
    };
    document_id: string;
  }>;
}

export async function listNotifications(authToken: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/notifications`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load notifications.");
  }

  return response.json() as Promise<{
    total: number;
    unread_count: number;
    notifications: NotificationRecord[];
  }>;
}

export async function markNotificationRead(authToken: string, notificationId: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/notifications/${notificationId}/read`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to mark notification read.");
  }

  return response.json() as Promise<NotificationRecord>;
}

export async function markAllNotificationsRead(authToken: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/notifications/mark-all-read`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to mark notifications read.");
  }

  return response.json();
}

export async function getAdminMetrics(authToken: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/admin/metrics`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load admin metrics.");
  }

  return response.json() as Promise<AdminMetrics>;
}

export async function listAdminUsers(
  authToken: string,
  params: {
    role?: string;
    is_active?: string;
    q?: string;
    limit?: string;
    offset?: string;
  } = {}
) {
  const response = await fetch(`${apiBaseUrl}/api/v1/admin/users?${toQuery(params)}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load admin users.");
  }

  return response.json() as Promise<{
    total: number;
    limit: number;
    offset: number;
    users: AdminUser[];
  }>;
}

export async function suspendAdminUser(authToken: string, userId: string, payload: unknown) {
  const response = await fetch(`${apiBaseUrl}/api/v1/admin/users/${userId}/suspend`, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to suspend the user.");
  }

  return response.json() as Promise<AdminUser>;
}

export async function reactivateAdminUser(authToken: string, userId: string, payload: unknown) {
  const response = await fetch(`${apiBaseUrl}/api/v1/admin/users/${userId}/reactivate`, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to reactivate the user.");
  }

  return response.json() as Promise<AdminUser>;
}

export async function listAdminAuditLogs(
  authToken: string,
  params: {
    action?: string;
    entity_type?: string;
    actor_id?: string;
    created_after?: string;
    created_before?: string;
    limit?: string;
    offset?: string;
  } = {}
) {
  const response = await fetch(`${apiBaseUrl}/api/v1/admin/audit-logs?${toQuery(params)}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load audit logs.");
  }

  return response.json() as Promise<{
    total: number;
    limit: number;
    offset: number;
    audit_logs: AdminAuditLog[];
  }>;
}

export async function listAdminNotificationFailures(
  authToken: string,
  params: {
    channel?: string;
    notification_type?: string;
    limit?: string;
    offset?: string;
  } = {}
) {
  const response = await fetch(
    `${apiBaseUrl}/api/v1/admin/notifications/failures?${toQuery(params)}`,
    {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }
  );

  if (!response.ok) {
    throw new Error("Unable to load notification failures.");
  }

  return response.json() as Promise<{
    total: number;
    limit: number;
    offset: number;
    notifications: AdminNotificationFailure[];
  }>;
}

function toQuery(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });
  return query.toString();
}
