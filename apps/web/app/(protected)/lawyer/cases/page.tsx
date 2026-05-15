import { ArrowRight, BriefcaseBusiness } from "lucide-react";
import { cookies } from "next/headers";

import { StatusBadge } from "@/components/ui/status-badge";
import { listAssignedCases } from "@/lib/api";

export default async function LawyerCasesPage() {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const cases = token ? await listAssignedCases(token).catch(() => null) : null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-md border border-border bg-white shadow-panel">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
          <div className="flex items-center gap-2">
            <BriefcaseBusiness aria-hidden="true" className="h-5 w-5 text-primary" />
            <h1 className="text-base font-semibold">Assigned cases</h1>
          </div>
          <StatusBadge>{cases?.total ?? 0} assigned</StatusBadge>
        </div>
        <div className="divide-y divide-border">
          {cases?.results.length ? (
            cases.results.map((caseRecord) => (
              <a
                className="grid gap-3 px-4 py-4 transition hover:bg-muted md:grid-cols-[1fr_auto] md:items-center md:px-5"
                href={`/lawyer/cases/${caseRecord.id}`}
                key={caseRecord.id}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-medium">{caseRecord.title}</h2>
                    <StatusBadge tone={caseRecord.urgency === "emergency" ? "danger" : "primary"}>
                      {caseRecord.urgency}
                    </StatusBadge>
                    <StatusBadge>{caseRecord.status.replaceAll("_", " ")}</StatusBadge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {caseRecord.category} - {caseRecord.district}, {caseRecord.state}
                  </p>
                </div>
                <span className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-border">
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </span>
              </a>
            ))
          ) : (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No assigned cases are available for this lawyer account yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
