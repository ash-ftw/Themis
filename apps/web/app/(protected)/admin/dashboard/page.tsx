import { Activity, AlertTriangle, ShieldCheck, Users } from "lucide-react";
import { cookies } from "next/headers";

import { StatusBadge } from "@/components/ui/status-badge";
import {
  getAdminMetrics,
  listAdminAuditLogs,
  listAdminNotificationFailures
} from "@/lib/api";
import type { AdminMetrics } from "@/lib/api";

export default async function AdminDashboardPage() {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const [metrics, auditLogs, notificationFailures] = token
    ? await Promise.all([
        getAdminMetrics(token).catch(() => null),
        listAdminAuditLogs(token, { limit: "5" }).catch(() => null),
        listAdminNotificationFailures(token, { limit: "5" }).catch(() => null)
      ])
    : [null, null, null];

  const queues = queueCards(metrics);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {queues.map((item) => {
          const Icon = item.icon;

          return (
            <a
              className="rounded-md border border-border bg-white p-4 shadow-panel transition hover:border-primary hover:bg-cyan-50"
              href={item.href}
              key={item.label}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <Icon aria-hidden="true" className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div className="text-3xl font-semibold">{item.value}</div>
                <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
              </div>
            </a>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="rounded-md border border-border bg-white shadow-panel">
          <div className="border-b border-border px-4 py-3 md:px-5">
            <h2 className="text-base font-semibold">Operational metrics</h2>
          </div>
          <div className="grid gap-3 p-4 md:grid-cols-2 md:p-5">
            <MetricBar label="Active users" value={metrics?.users_active ?? 0} total={metrics?.users_total ?? 0} />
            <MetricBar label="Open cases" value={metrics?.cases_open ?? 0} total={metrics?.cases_total ?? 0} />
            <MetricBar
              label="Pending OCR"
              value={metrics?.documents_pending_ocr ?? 0}
              total={metrics?.documents_total ?? 0}
            />
            <MetricBar
              label="Unread notifications"
              value={metrics?.notifications_unread ?? 0}
              total={Math.max(metrics?.notifications_unread ?? 0, metrics?.notifications_failed ?? 0)}
            />
          </div>
          <div className="grid gap-3 border-t border-border p-4 md:grid-cols-3 md:p-5">
            <Metric label="Law records" value={metrics?.law_sections_total ?? 0} />
            <Metric label="Upcoming hearings" value={metrics?.hearings_upcoming ?? 0} />
            <Metric label="Audit events, 24h" value={metrics?.audit_events_24h ?? 0} />
          </div>
        </div>

        <div className="rounded-md border border-border bg-white shadow-panel">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
            <h2 className="text-base font-semibold">Users by role</h2>
            <StatusBadge>{metrics?.users_total ?? 0} total</StatusBadge>
          </div>
          <div className="space-y-3 p-4 md:p-5">
            {metrics?.users_by_role.length ? (
              metrics.users_by_role.map((role) => (
                <MetricBar
                  label={role.label}
                  value={role.count}
                  total={Math.max(metrics.users_total, 1)}
                  key={role.label}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No synced users yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-md border border-border bg-white shadow-panel">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
            <h2 className="text-base font-semibold">Recent audit events</h2>
            <a className="text-sm font-medium text-primary" href="/admin/audit">
              View all
            </a>
          </div>
          <div className="divide-y divide-border">
            {auditLogs?.audit_logs.length ? (
              auditLogs.audit_logs.map((log) => (
                <div className="px-4 py-3 md:px-5" key={log.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{log.action}</p>
                    <StatusBadge>{log.entity_type}</StatusBadge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {log.actor_email ?? "system"} - {formatDate(log.created_at)}
                  </p>
                </div>
              ))
            ) : (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                No audit events found.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-md border border-border bg-white shadow-panel">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
            <h2 className="text-base font-semibold">Notification failures</h2>
            <a className="text-sm font-medium text-primary" href="/admin/notifications">
              View all
            </a>
          </div>
          <div className="divide-y divide-border">
            {notificationFailures?.notifications.length ? (
              notificationFailures.notifications.map((notification) => (
                <div className="px-4 py-3 md:px-5" key={notification.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{notification.title}</p>
                    <StatusBadge tone="danger">{notification.channel}</StatusBadge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {notification.user_email ?? notification.user_id} - {formatDate(notification.created_at)}
                  </p>
                </div>
              ))
            ) : (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                No failed notifications.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function queueCards(metrics: AdminMetrics | null) {
  return [
    {
      label: "Lawyer verifications",
      value: metrics?.pending_lawyer_verifications ?? 0,
      tone: "warning" as const,
      status: "pending",
      href: "/admin/lawyers",
      icon: ShieldCheck
    },
    {
      label: "Users",
      value: metrics?.users_total ?? 0,
      tone: "primary" as const,
      status: `${metrics?.users_inactive ?? 0} suspended`,
      href: "/admin/users",
      icon: Users
    },
    {
      label: "Notification failures",
      value: metrics?.notifications_failed ?? 0,
      tone: "danger" as const,
      status: "failed",
      href: "/admin/notifications",
      icon: AlertTriangle
    },
    {
      label: "Legal aid requests",
      value: metrics?.legal_aid_pending ?? 0,
      tone: "neutral" as const,
      status: "pending",
      href: "/admin/dashboard",
      icon: Activity
    }
  ];
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function MetricBar({ label, value, total }: { label: string; value: number; total: number }) {
  const percentage = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
