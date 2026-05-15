import {
  Bell,
  BookOpen,
  FileText,
  LayoutDashboard,
  Search,
  ShieldCheck,
  UserRoundCheck
} from "lucide-react";

import type { AppRole } from "@/lib/auth";

const navigation: Array<{
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  roles: AppRole[];
}> = [
  { label: "Dashboard", href: "/citizen/dashboard", icon: LayoutDashboard, roles: ["citizen"] },
  { label: "Law Search", href: "/citizen/laws", icon: Search, roles: ["citizen"] },
  { label: "Profile", href: "/citizen/profile", icon: UserRoundCheck, roles: ["citizen"] },
  { label: "Dashboard", href: "/lawyer/dashboard", icon: LayoutDashboard, roles: ["lawyer"] },
  { label: "Profile", href: "/lawyer/profile", icon: UserRoundCheck, roles: ["lawyer"] },
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, roles: ["admin"] },
  { label: "Law Content", href: "/admin/laws", icon: BookOpen, roles: ["admin"] },
  { label: "Verification", href: "/admin/dashboard", icon: ShieldCheck, roles: ["admin"] },
  { label: "Audit Logs", href: "/admin/dashboard", icon: FileText, roles: ["admin"] }
];

export function AppShell({
  children,
  role,
  sectionLabel,
  title
}: {
  children: React.ReactNode;
  role: AppRole;
  sectionLabel: string;
  title: string;
}) {
  const visibleNavigation = navigation.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r border-border bg-white lg:block">
        <div className="border-b border-border px-6 py-5">
          <div className="text-xl font-semibold tracking-normal">Themis</div>
          <div className="mt-1 text-sm text-muted-foreground">Legal support workspace</div>
        </div>

        <nav className="space-y-1 p-3" aria-label="Main navigation">
          {visibleNavigation.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === 0;

            return (
              <a
                href={item.href}
                key={`${item.href}-${item.label}`}
                className={`focus-ring flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-slate-700 hover:bg-muted"
                }`}
              >
                <Icon aria-hidden={true} className="h-4 w-4" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-border bg-white/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {sectionLabel}
              </p>
              <h1 className="truncate text-xl font-semibold md:text-2xl">{title}</h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                aria-label="Search laws"
                className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-white text-slate-700 shadow-panel hover:bg-muted"
                type="button"
              >
                <Search aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                aria-label="Notifications"
                className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-white text-slate-700 shadow-panel hover:bg-muted"
                type="button"
              >
                <Bell aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-5 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
