import { ShieldCheck, ShieldX } from "lucide-react";
import { cookies } from "next/headers";

import { StatusBadge } from "@/components/ui/status-badge";
import { listLawyerVerifications } from "@/lib/api";

import { approveLawyerVerification, rejectLawyerVerification } from "./actions";

export default async function AdminLawyersPage() {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const queue = token ? await listLawyerVerifications(token).catch(() => null) : null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-md border border-border bg-white shadow-panel">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
          <h1 className="text-base font-semibold">Lawyer verification queue</h1>
          <StatusBadge tone="warning">{queue?.total ?? 0} pending</StatusBadge>
        </div>
        <div className="divide-y divide-border">
          {queue?.lawyers.length ? (
            queue.lawyers.map((lawyer) => (
              <div className="grid gap-4 px-4 py-4 lg:grid-cols-[1fr_360px] md:px-5" key={lawyer.user_id}>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-medium">{lawyer.email}</h2>
                    <StatusBadge>{lawyer.verification_status}</StatusBadge>
                    {lawyer.is_pro_bono ? <StatusBadge tone="success">pro bono</StatusBadge> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {lawyer.bar_number} - {lawyer.state_bar_council} - {lawyer.district}
                  </p>
                  <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                    <Info label="Languages" value={lawyer.languages.join(", ") || "Not provided"} />
                    <Info
                      label="Specializations"
                      value={lawyer.specializations.join(", ") || "Not provided"}
                    />
                    <Info
                      label="Caseload"
                      value={`${lawyer.active_case_count}/${lawyer.max_active_cases}`}
                    />
                    <Info label="Phone" value={lawyer.phone ?? "Not provided"} />
                  </div>
                </div>

                <div className="space-y-3">
                  <form action={approveLawyerVerification.bind(null, lawyer.user_id)}>
                    <textarea
                      className="focus-ring min-h-20 w-full rounded-md border border-border px-3 py-2 text-sm"
                      name="notes"
                      placeholder="Approval notes"
                    />
                    <button
                      className="focus-ring mt-2 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
                      type="submit"
                    >
                      <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                      Approve
                    </button>
                  </form>
                  <form action={rejectLawyerVerification.bind(null, lawyer.user_id)}>
                    <textarea
                      className="focus-ring min-h-20 w-full rounded-md border border-border px-3 py-2 text-sm"
                      name="notes"
                      placeholder="Rejection reason"
                    />
                    <button
                      className="focus-ring mt-2 inline-flex h-9 items-center justify-center gap-2 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700 hover:bg-red-50"
                      type="submit"
                    >
                      <ShieldX aria-hidden="true" className="h-4 w-4" />
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No pending lawyer profiles.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}
