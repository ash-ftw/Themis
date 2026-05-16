import { CheckCircle2, XCircle } from "lucide-react";
import { cookies } from "next/headers";

import { StatusBadge } from "@/components/ui/status-badge";
import { listLawyerLegalAidRequests } from "@/lib/api";

import { acceptRequest, declineRequest } from "./actions";

export default async function LawyerRequestsPage() {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const requests = token ? await listLawyerLegalAidRequests(token).catch(() => null) : null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-md border border-border bg-white shadow-panel">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
          <h1 className="text-base font-semibold">Legal aid requests</h1>
          <StatusBadge tone="warning">{requests?.total ?? 0} total</StatusBadge>
        </div>
        <div className="divide-y divide-border">
          {requests?.requests.length ? (
            requests.requests.map((request) => (
              <div className="grid gap-4 px-4 py-4 lg:grid-cols-[1fr_auto] md:px-5" key={request.id}>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-medium">{request.case_title ?? "Legal aid request"}</h2>
                    <StatusBadge>{request.status}</StatusBadge>
                    <StatusBadge tone="primary">{request.score} match</StatusBadge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {request.case_category ?? "case"} - {request.case_district ?? "district pending"}
                  </p>
                  {request.message ? (
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {request.message}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(request.score_breakdown).map(([label, value]) => (
                      <StatusBadge key={label}>
                        {label}: {value}
                      </StatusBadge>
                    ))}
                  </div>
                </div>

                {request.status === "pending" ? (
                  <div className="flex flex-wrap items-start gap-2 lg:flex-col">
                    <form action={acceptRequest.bind(null, request.id)}>
                      <button
                        className="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
                        type="submit"
                      >
                        <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                        Accept
                      </button>
                    </form>
                    <form action={declineRequest.bind(null, request.id)}>
                      <button
                        className="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700 hover:bg-red-50"
                        type="submit"
                      >
                        <XCircle aria-hidden="true" className="h-4 w-4" />
                        Decline
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No legal aid requests are waiting for this lawyer account.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
