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
  results: Array<{
    law_section: LawSection;
    rank: number | null;
  }>;
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
