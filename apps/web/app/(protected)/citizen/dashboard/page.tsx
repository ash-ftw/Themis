import { cookies } from "next/headers";

import { RoleDashboard } from "@/features/dashboard/role-dashboard";
import { listCases } from "@/lib/api";

export default async function CitizenDashboardPage() {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const cases = token ? await listCases(token, { limit: "4" }).catch(() => null) : null;

  return <RoleDashboard cases={cases?.results ?? []} />;
}
