const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

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
