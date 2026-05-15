import { Download, FolderPlus, Save, ShieldAlert } from "lucide-react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/ui/status-badge";
import { getComplaintDraft } from "@/lib/api";

import { exportDraftPdf, saveDraftToCase, updateDraft } from "./actions";

type PageParams = Promise<{ id: string }>;

export default async function ComplaintDraftPage({ params }: { params: PageParams }) {
  const { id } = await params;
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const draft = token ? await getComplaintDraft(token, id).catch(() => null) : null;

  if (!draft) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-md border border-amber-200 bg-amber-50 p-4 shadow-panel md:p-5">
        <div className="flex gap-3">
          <ShieldAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <h1 className="text-base font-semibold text-amber-950">Review before submission</h1>
            <p className="mt-1 text-sm leading-6 text-amber-900">
              This draft is generated for editing and review. It is not submitted to any police
              station, court, or public authority by Themis.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <form
          action={updateDraft.bind(null, draft.id)}
          className="rounded-md border border-border bg-white shadow-panel"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
            <div>
              <h2 className="text-base font-semibold">Editable draft</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Update the text before export or case save.
              </p>
            </div>
            <StatusBadge tone={draft.status === "draft" ? "neutral" : "success"}>
              {draft.status.replaceAll("_", " ")}
            </StatusBadge>
          </div>

          <div className="p-4 md:p-5">
            <textarea
              className="focus-ring min-h-[560px] w-full rounded-md border border-border px-4 py-3 font-mono text-sm leading-6"
              defaultValue={draft.draft_text}
              name="draft_text"
            />
            <button
              className="focus-ring mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
              type="submit"
            >
              <Save aria-hidden="true" className="h-4 w-4" />
              Save edits
            </button>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="rounded-md border border-border bg-white p-4 shadow-panel">
            <h2 className="text-base font-semibold">Draft actions</h2>
            <form action={exportDraftPdf.bind(null, draft.id)} className="mt-4">
              <button
                className="focus-ring inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
                type="submit"
              >
                <Download aria-hidden="true" className="h-4 w-4" />
                Queue PDF export
              </button>
            </form>
            <form action={saveDraftToCase.bind(null, draft.id)} className="mt-3">
              <button
                className="focus-ring inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
                type="submit"
              >
                <FolderPlus aria-hidden="true" className="h-4 w-4" />
                Save to case
              </button>
            </form>
          </div>

          <div className="rounded-md border border-border bg-white p-4 shadow-panel">
            <h2 className="text-base font-semibold">Export status</h2>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <p>PDF document: {draft.pdf_document_id ?? "not exported"}</p>
              <p>Case: {draft.case_id ?? "not linked"}</p>
              <p>Assessment: {draft.assessment_id ?? "manual draft"}</p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
