import { BriefcaseBusiness, Gavel, ShieldCheck } from "lucide-react";

import { getHealth } from "@/lib/api";

const roles = [
  {
    label: "Citizen",
    value: "citizen",
    icon: BriefcaseBusiness
  },
  {
    label: "Lawyer",
    value: "lawyer",
    icon: Gavel
  },
  {
    label: "Admin",
    value: "admin",
    icon: ShieldCheck
  }
] as const;

type LoginSearchParams = Promise<{
  error?: string;
  role?: string;
}>;

const errorMessages: Record<string, string> = {
  "auth-sync": "The API is not reachable, so sign-in could not create a session."
};

export default async function LoginPage({ searchParams }: { searchParams: LoginSearchParams }) {
  const params = await searchParams;
  const apiOnline = await getHealth()
    .then(() => true)
    .catch(() => false);
  const errorMessage = params.error ? errorMessages[params.error] : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-md rounded-md border border-border bg-white p-5 shadow-panel">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Themis</p>
            <h1 className="mt-1 text-2xl font-semibold">Sign in</h1>
          </div>
          <span
            className={`rounded-md px-2 py-1 text-xs font-medium ${
              apiOnline ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}
          >
            API {apiOnline ? "online" : "offline"}
          </span>
        </div>

        {errorMessage ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="grid gap-3">
          {roles.map((role) => {
            const Icon = role.icon;

            return (
              <form action="/auth/callback" key={role.label} method="get">
                <input name="role" type="hidden" value={role.value} />
                <button
                  className="focus-ring flex w-full items-center justify-between rounded-md border border-border px-4 py-3 text-sm font-medium transition hover:border-primary hover:bg-cyan-50"
                  type="submit"
                >
                  <span className="flex items-center gap-3">
                    <Icon aria-hidden="true" className="h-4 w-4 text-primary" />
                    {role.label}
                  </span>
                  <span aria-hidden="true">Sign in</span>
                </button>
              </form>
            );
          })}
        </div>
      </section>
    </main>
  );
}
