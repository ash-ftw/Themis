import { BriefcaseBusiness, Gavel, ShieldCheck } from "lucide-react";

const roles = [
  {
    label: "Citizen",
    href: "/auth/callback?role=citizen",
    icon: BriefcaseBusiness
  },
  {
    label: "Lawyer",
    href: "/auth/callback?role=lawyer",
    icon: Gavel
  },
  {
    label: "Admin",
    href: "/auth/callback?role=admin",
    icon: ShieldCheck
  }
] as const;

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-md rounded-md border border-border bg-white p-5 shadow-panel">
        <div className="mb-5">
          <p className="text-sm font-medium text-muted-foreground">Themis</p>
          <h1 className="mt-1 text-2xl font-semibold">Sign in</h1>
        </div>

        <div className="grid gap-3">
          {roles.map((role) => {
            const Icon = role.icon;

            return (
              <a
                className="focus-ring flex items-center justify-between rounded-md border border-border px-4 py-3 text-sm font-medium transition hover:border-primary hover:bg-cyan-50"
                href={role.href}
                key={role.label}
              >
                <span className="flex items-center gap-3">
                  <Icon aria-hidden="true" className="h-4 w-4 text-primary" />
                  {role.label}
                </span>
                <span aria-hidden="true">Sign in</span>
              </a>
            );
          })}
        </div>
      </section>
    </main>
  );
}
