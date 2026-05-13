import { cookies } from "next/headers";

import { AppShell } from "@/components/layout/app-shell";
import { isAppRole } from "@/lib/auth";
import type { AppRole } from "@/lib/auth";

const shellCopy: Record<AppRole, { sectionLabel: string; title: string }> = {
  citizen: { sectionLabel: "Citizen workspace", title: "Case support" },
  lawyer: { sectionLabel: "Lawyer workspace", title: "Requests and assigned cases" },
  admin: { sectionLabel: "Admin workspace", title: "Platform operations" }
};

export default async function ProtectedLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("themis-role")?.value;
  const role = isAppRole(roleCookie) ? roleCookie : "citizen";
  const copy = shellCopy[role];

  return (
    <AppShell role={role} sectionLabel={copy.sectionLabel} title={copy.title}>
      {children}
    </AppShell>
  );
}
