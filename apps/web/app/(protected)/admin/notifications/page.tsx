import { AlertTriangle } from "lucide-react";
import { cookies } from "next/headers";

import { StatusBadge } from "@/components/ui/status-badge";
import { listAdminNotificationFailures } from "@/lib/api";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminNotificationFailuresPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const resolvedParams = await searchParams;
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const filters = {
    channel: valueOf(resolvedParams.channel),
    notification_type: valueOf(resolvedParams.notification_type),
    limit: "50"
  };
  const response = token ? await listAdminNotificationFailures(token, filters).catch(() => null) : null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-md border border-border bg-white p-4 shadow-panel md:p-5">
        <form className="grid gap-3 md:grid-cols-[220px_1fr_auto] md:items-end">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Channel</span>
            <select
              className="focus-ring mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
              defaultValue={filters.channel ?? ""}
              name="channel"
            >
              <option value="">All channels</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="in_app">In-app</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Type</span>
            <input
              className="focus-ring mt-2 h-10 w-full rounded-md border border-border px-3 text-sm"
              defaultValue={filters.notification_type ?? ""}
              name="notification_type"
              placeholder="hearing.reminder"
            />
          </label>
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
          <div className="flex items-center gap-2">
            <AlertTriangle aria-hidden="true" className="h-4 w-4 text-red-600" />
            <h1 className="text-base font-semibold">Notification failures</h1>
          </div>
          <StatusBadge tone="danger">{response?.total ?? 0} failed</StatusBadge>
        </div>
        <div className="divide-y divide-border">
          {response?.notifications.length ? (
            response.notifications.map((notification) => (
              <article className="grid gap-4 px-4 py-4 lg:grid-cols-[1fr_360px] md:px-5" key={notification.id}>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-medium">{notification.title}</h2>
                    <StatusBadge tone="danger">{notification.channel}</StatusBadge>
                    <StatusBadge>{notification.type}</StatusBadge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{notification.message}</p>
                  <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                    <Info label="Recipient" value={notification.user_email ?? notification.user_id} />
                    <Info label="Created" value={formatDate(notification.created_at)} />
                    <Info label="Idempotency key" value={notification.idempotency_key} />
                    <Info label="Notification ID" value={notification.id} />
                  </dl>
                </div>
                <pre className="max-h-64 overflow-auto rounded-md border border-border bg-slate-950 p-3 text-xs text-slate-50">
                  {JSON.stringify(notification.metadata, null, 2)}
                </pre>
              </article>
            ))
          ) : (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No failed notifications match the selected filters.
            </div>
          )}
        </div>
      </section>
    </div>
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
