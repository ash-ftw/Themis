import { Ban, RotateCcw } from "lucide-react";
import { cookies } from "next/headers";

import { StatusBadge } from "@/components/ui/status-badge";
import { listAdminUsers } from "@/lib/api";

import { reactivateUserAction, suspendUserAction } from "./actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedParams = await searchParams;
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const filters = {
    q: valueOf(resolvedParams.q),
    role: valueOf(resolvedParams.role),
    is_active: valueOf(resolvedParams.is_active),
    limit: "50"
  };
  const response = token ? await listAdminUsers(token, filters).catch(() => null) : null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-md border border-border bg-white p-4 shadow-panel md:p-5">
        <form className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto] md:items-end">
          <Field label="Search" name="q" placeholder="Email or external ID" value={filters.q} />
          <Select label="Role" name="role" value={filters.role}>
            <option value="">All roles</option>
            <option value="citizen">Citizen</option>
            <option value="lawyer">Lawyer</option>
            <option value="admin">Admin</option>
            <option value="org_user">Org user</option>
          </Select>
          <Select label="Status" name="is_active" value={filters.is_active}>
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Suspended</option>
          </Select>
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
          <h1 className="text-base font-semibold">User management</h1>
          <StatusBadge>{response?.total ?? 0} users</StatusBadge>
        </div>
        <div className="divide-y divide-border">
          {response?.users.length ? (
            response.users.map((user) => (
              <div className="grid gap-4 px-4 py-4 lg:grid-cols-[1fr_360px] md:px-5" key={user.id}>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-medium">{user.email}</h2>
                    <StatusBadge tone="primary">{user.role}</StatusBadge>
                    <StatusBadge tone={user.is_active ? "success" : "danger"}>
                      {user.is_active ? "active" : "suspended"}
                    </StatusBadge>
                    {user.is_verified ? <StatusBadge tone="success">verified</StatusBadge> : null}
                  </div>
                  <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                    <Info label="External ID" value={user.external_auth_id} />
                    <Info label="Phone" value={user.phone ?? "Not provided"} />
                    <Info label="Last login" value={formatMaybeDate(user.last_login_at)} />
                    <Info label="Created" value={formatMaybeDate(user.created_at)} />
                  </div>
                </div>
                <form
                  action={
                    user.is_active
                      ? suspendUserAction.bind(null, user.id)
                      : reactivateUserAction.bind(null, user.id)
                  }
                  className="space-y-2"
                >
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Reason</span>
                    <textarea
                      className="focus-ring mt-2 min-h-20 w-full rounded-md border border-border px-3 py-2 text-sm"
                      name="reason"
                      placeholder={user.is_active ? "Suspension reason" : "Reactivation reason"}
                    />
                  </label>
                  <button
                    className={
                      user.is_active
                        ? "focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700 hover:bg-red-50"
                        : "focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
                    }
                    type="submit"
                  >
                    {user.is_active ? (
                      <Ban aria-hidden="true" className="h-4 w-4" />
                    ) : (
                      <RotateCcw aria-hidden="true" className="h-4 w-4" />
                    )}
                    {user.is_active ? "Suspend" : "Reactivate"}
                  </button>
                </form>
              </div>
            ))
          ) : (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No users match the selected filters.
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

function Select({
  children,
  label,
  name,
  value
}: {
  children: React.ReactNode;
  label: string;
  name: string;
  value?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        className="focus-ring mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
        defaultValue={value ?? ""}
        name={name}
      >
        {children}
      </select>
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-sm">{value}</div>
    </div>
  );
}

function valueOf(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatMaybeDate(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
