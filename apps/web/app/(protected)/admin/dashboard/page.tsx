import { StatusBadge } from "@/components/ui/status-badge";

const adminQueues = [
  { label: "Lawyer verifications", value: "8", tone: "warning" as const },
  { label: "Law sections pending review", value: "14", tone: "neutral" as const },
  { label: "Notification failures", value: "2", tone: "danger" as const }
];

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {adminQueues.map((item) => (
          <a
            className="rounded-md border border-border bg-white p-4 shadow-panel transition hover:border-primary hover:bg-cyan-50"
            href={item.label === "Lawyer verifications" ? "/admin/lawyers" : "/admin/dashboard"}
            key={item.label}
          >
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div className="text-3xl font-semibold">{item.value}</div>
              <StatusBadge tone={item.tone}>Open</StatusBadge>
            </div>
          </a>
        ))}
      </section>

      <section className="rounded-md border border-border bg-white shadow-panel">
        <div className="border-b border-border px-4 py-3 md:px-5">
          <h2 className="text-base font-semibold">Role access</h2>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-3 md:p-5">
          <AccessRow label="Citizen routes" value="/citizen/*" />
          <AccessRow label="Lawyer routes" value="/lawyer/*" />
          <AccessRow label="Admin routes" value="/admin/*" />
        </div>
      </section>
    </div>
  );
}

function AccessRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-4">
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-1 text-sm text-muted-foreground">{value}</p>
    </div>
  );
}
