import {
  ArrowRight,
  CheckCircle2,
  FilePlus2,
  FolderLock,
  Gavel,
  Search,
  ShieldAlert
} from "lucide-react";

import { StatusBadge } from "@/components/ui/status-badge";

const activeCases = [
  {
    title: "Consumer refund complaint",
    category: "Consumer",
    status: "Complaint prepared",
    next: "Legal aid request pending",
    tone: "warning" as const
  },
  {
    title: "RTI for municipal records",
    category: "RTI",
    status: "Draft",
    next: "Export PDF",
    tone: "neutral" as const
  }
];

const upcomingHearings = [
  {
    caseTitle: "Property dispute",
    court: "District Court",
    date: "24 May 2026",
    status: "Reminder scheduled"
  }
];

const adminSignals = [
  { label: "Pending lawyer verifications", value: "8", tone: "warning" as const },
  { label: "Notification failures", value: "2", tone: "danger" as const },
  { label: "Reviewed law sections", value: "126", tone: "success" as const }
];

export function RoleDashboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-md border border-border bg-white p-4 shadow-panel md:p-5">
          <label className="text-sm font-medium text-slate-700" htmlFor="law-search">
            Search laws or describe an issue
          </label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                className="focus-ring h-11 w-full rounded-md border border-border bg-white pl-10 pr-3 text-sm"
                id="law-search"
                placeholder="Search by act, section, keyword, or issue"
                type="search"
              />
            </div>
            <button
              className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
              type="button"
            >
              <Search aria-hidden="true" className="h-4 w-4" />
              Search
            </button>
          </div>
        </div>

        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 shadow-panel md:p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert aria-hidden="true" className="mt-0.5 h-5 w-5 text-amber-700" />
            <div>
              <h2 className="text-sm font-semibold text-amber-950">Review before submission</h2>
              <p className="mt-1 text-sm leading-6 text-amber-900">
                Platform output is informational and draft-focused. Serious matters should be
                reviewed by a qualified lawyer or appropriate authority.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ActionCard
          href="/citizen/assessments/new"
          icon={FilePlus2}
          label="Start assessment"
          value="18 issue categories"
        />
        <ActionCard
          href="/citizen/complaints/new"
          icon={FilePlus2}
          label="Complaint draft"
          value="Editable preview"
        />
        <ActionCard icon={Gavel} label="Request legal aid" value="Verified lawyers only" />
        <ActionCard icon={FolderLock} label="Upload document" value="Private case storage" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-md border border-border bg-white shadow-panel">
          <div className="border-b border-border px-4 py-3 md:px-5">
            <h2 className="text-base font-semibold">Active cases</h2>
          </div>
          <div className="divide-y divide-border">
            {activeCases.map((item) => (
              <div
                className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_auto] md:items-center md:px-5"
                key={item.title}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{item.title}</h3>
                    <StatusBadge>{item.category}</StatusBadge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.next}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
                  <button
                    aria-label={`Open ${item.title}`}
                    className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-muted"
                    type="button"
                  >
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-border bg-white shadow-panel">
          <div className="border-b border-border px-4 py-3 md:px-5">
            <h2 className="text-base font-semibold">Upcoming hearings</h2>
          </div>
          <div className="space-y-4 p-4 md:p-5">
            {upcomingHearings.map((hearing) => (
              <div className="rounded-md border border-border p-4" key={hearing.caseTitle}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium">{hearing.caseTitle}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{hearing.court}</p>
                  </div>
                  <StatusBadge tone="primary">{hearing.date}</StatusBadge>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-success">
                  <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                  {hearing.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-md border border-border bg-white p-4 shadow-panel md:p-5 lg:col-span-2">
          <h2 className="text-base font-semibold">Lawyer workspace queue</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Metric label="Pending requests" value="4" />
            <Metric label="Assigned cases" value="11" />
            <Metric label="Response deadline" value="2 today" />
          </div>
        </div>

        <div className="rounded-md border border-border bg-white p-4 shadow-panel md:p-5">
          <h2 className="text-base font-semibold">Admin signals</h2>
          <div className="mt-4 space-y-3">
            {adminSignals.map((signal) => (
              <div className="flex items-center justify-between gap-3" key={signal.label}>
                <span className="text-sm text-muted-foreground">{signal.label}</span>
                <StatusBadge tone={signal.tone}>{signal.value}</StatusBadge>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ActionCard({
  href,
  icon: Icon,
  label,
  value
}: {
  href?: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
}) {
  const className =
    "focus-ring block rounded-md border border-border bg-white p-4 text-left shadow-panel transition hover:border-primary hover:bg-cyan-50";

  if (href) {
    return (
      <a className={className} href={href}>
        <Icon aria-hidden={true} className="h-5 w-5 text-primary" />
        <div className="mt-4 text-sm font-semibold">{label}</div>
        <div className="mt-1 text-sm text-muted-foreground">{value}</div>
      </a>
    );
  }

  return (
    <button
      className={className}
      type="button"
    >
      <Icon aria-hidden={true} className="h-5 w-5 text-primary" />
      <div className="mt-4 text-sm font-semibold">{label}</div>
      <div className="mt-1 text-sm text-muted-foreground">{value}</div>
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-4">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
