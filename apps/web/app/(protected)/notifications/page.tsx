import { Bell, CheckCheck } from "lucide-react";
import { cookies } from "next/headers";

import { StatusBadge } from "@/components/ui/status-badge";
import { listNotifications } from "@/lib/api";

import { readAllNotifications, readNotification } from "./actions";

export default async function NotificationsPage() {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const notifications = token ? await listNotifications(token).catch(() => null) : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-md border border-border bg-white shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
          <div className="flex items-center gap-2">
            <Bell aria-hidden="true" className="h-5 w-5 text-primary" />
            <h1 className="text-base font-semibold">Notifications</h1>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge>{notifications?.unread_count ?? 0} unread</StatusBadge>
            <form action={readAllNotifications}>
              <button
                className="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
                type="submit"
              >
                <CheckCheck aria-hidden="true" className="h-4 w-4" />
                Mark all read
              </button>
            </form>
          </div>
        </div>
        <div className="divide-y divide-border">
          {notifications?.notifications.length ? (
            notifications.notifications.map((notification) => (
              <div className="px-4 py-4 md:px-5" key={notification.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-medium">{notification.title}</h2>
                      <StatusBadge tone={notification.read_at ? "neutral" : "primary"}>
                        {notification.read_at ? "read" : "unread"}
                      </StatusBadge>
                      <StatusBadge>{notification.status}</StatusBadge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read_at ? (
                    <form action={readNotification.bind(null, notification.id)}>
                      <button
                        className="focus-ring inline-flex h-9 items-center justify-center rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
                        type="submit"
                      >
                        Mark read
                      </button>
                    </form>
                  ) : null}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {notification.message}
                </p>
              </div>
            ))
          ) : (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
