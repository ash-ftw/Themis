import { ShieldCheck } from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/ui/status-badge";

export default function LawyerVerificationPendingPage() {
  return (
    <div className="mx-auto max-w-3xl rounded-md border border-border bg-white p-5 shadow-panel">
      <div className="flex items-start gap-3">
        <ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 text-primary" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold">Verification pending</h2>
            <StatusBadge tone="warning">Pending</StatusBadge>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Your lawyer profile is saved for admin review. Complete or update profile details while
            approval is pending.
          </p>
          <Link
            className="focus-ring mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            href="/lawyer/profile"
          >
            Open profile
          </Link>
        </div>
      </div>
    </div>
  );
}
