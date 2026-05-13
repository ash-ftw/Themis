export type AppRole = "citizen" | "lawyer" | "admin";

export const roleHome = {
  citizen: "/citizen/dashboard",
  lawyer: "/lawyer/dashboard",
  admin: "/admin/dashboard"
} as const satisfies Record<AppRole, `/${string}`>;

export function isAppRole(value: string | undefined): value is AppRole {
  return value === "citizen" || value === "lawyer" || value === "admin";
}
