const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

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
