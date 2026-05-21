import { cookies } from "next/headers";

import { StatusBadge } from "@/components/ui/status-badge";
import { listAdminAuditLogs } from "@/lib/api";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminAuditPage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedParams = await searchParams;
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const filters = {
    action: valueOf(resolvedParams.action),
    entity_type: valueOf(resolvedParams.entity_type),
    actor_id: valueOf(resolvedParams.actor_id),
    limit: "50"
  };
  const response = token ? await listAdminAuditLogs(token, filters).catch(() => null) : null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-md border border-border bg-white p-4 shadow-panel md:p-5">
        <form className="grid gap-3 md:grid-cols-[1fr_220px_260px_auto] md:items-end">
          <Field label="Action" name="action" placeholder="auth.profile_synced" value={filters.action} />
          <Field label="Entity" name="entity_type" placeholder="user" value={filters.entity_type} />
          <Field label="Actor ID" name="actor_id" placeholder="UUID" value={filters.actor_id} />
          <button
            className="focus-ring inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            type="submit"
          >
            Filter
          </button>
        </form>
      </section>

      <section className="rounded-md border border-border bg-white shadow-panel">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
          <h1 className="text-base font-semibold">Audit logs</h1>
          <StatusBadge>{response?.total ?? 0} events</StatusBadge>
        </div>
        <div className="divide-y divide-border">
          {response?.audit_logs.length ? (
            response.audit_logs.map((log) => (
              <article className="grid gap-4 px-4 py-4 lg:grid-cols-[1fr_360px] md:px-5" key={log.id}>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-medium">{log.action}</h2>
                    <StatusBadge>{log.entity_type}</StatusBadge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {log.actor_email ?? log.actor_id ?? "system"} - {formatDate(log.created_at)}
                  </p>
                  <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                    <Info label="Entity ID" value={log.entity_id ?? "None"} />
                    <Info label="IP address" value={log.ip_address ?? "Not captured"} />
                    <Info label="User agent" value={log.user_agent ?? "Not captured"} />
                    <Info label="Audit ID" value={log.id} />
                  </dl>
                </div>
                <pre className="max-h-64 overflow-auto rounded-md border border-border bg-slate-950 p-3 text-xs text-slate-50">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </article>
            ))
          ) : (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No audit logs match the selected filters.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  value
}: {
  label: string;
  name: string;
  placeholder: string;
  value?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className="focus-ring mt-2 h-10 w-full rounded-md border border-border px-3 text-sm"
        defaultValue={value ?? ""}
        name={name}
        placeholder={placeholder}
      />
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words">{value}</dd>
    </div>
  );
}

function valueOf(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
