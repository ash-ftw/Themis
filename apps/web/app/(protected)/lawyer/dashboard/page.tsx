import { ArrowRight, BriefcaseBusiness, Clock, Gavel } from "lucide-react";
import { cookies } from "next/headers";

import { StatusBadge } from "@/components/ui/status-badge";
import { listAssignedCases } from "@/lib/api";

const requests = [
  {
    title: "Domestic violence protection order",
    district: "Pune",
    urgency: "High",
    tone: "danger" as const
  },
  {
    title: "Consumer refund notice",
    district: "Mumbai Suburban",
    urgency: "Medium",
    tone: "warning" as const
  }
];

export default async function LawyerDashboardPage() {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const assignedCases = token ? await listAssignedCases(token).catch(() => null) : null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Metric icon={Gavel} label="Pending requests" value="4" />
        <Metric
          icon={BriefcaseBusiness}
          label="Assigned cases"
          value={`${assignedCases?.total ?? 0}`}
        />
        <Metric icon={Clock} label="Response deadline" value="2 today" />
      </section>

      <section className="rounded-md border border-border bg-white shadow-panel">
        <div className="border-b border-border px-4 py-3 md:px-5">
          <h2 className="text-base font-semibold">Assigned cases</h2>
        </div>
        <div className="divide-y divide-border">
          {(assignedCases?.results.length ? assignedCases.results : requests).map((request) => (
            <div
              className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_auto] md:items-center md:px-5"
              key={request.title}
            >
              <div>
                <h3 className="font-medium">{request.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {"state" in request ? `${request.district}, ${request.state}` : request.district}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge
                  tone={
                    "tone" in request
                      ? request.tone
                      : request.urgency === "emergency"
                        ? "danger"
                        : "primary"
                  }
                >
                  {request.urgency}
                </StatusBadge>
                <a
                  aria-label={`Open ${request.title}`}
                  className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-muted"
                  href={"id" in request ? `/lawyer/cases/${request.id}` : "/lawyer/cases"}
                >
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-border bg-white p-4 shadow-panel">
      <Icon aria-hidden={true} className="h-5 w-5 text-primary" />
      <div className="mt-4 text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
