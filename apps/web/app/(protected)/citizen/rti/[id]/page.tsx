import { Download, Save } from "lucide-react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/ui/status-badge";
import { getRtiDraft } from "@/lib/api";

import { exportRti, saveRtiDraftToCase, updateRti } from "./actions";

type PageParams = Promise<{ id: string }>;

export default async function RtiDraftPage({ params }: { params: PageParams }) {
  const { id } = await params;
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const draft = token ? await getRtiDraft(token, id).catch(() => null) : null;

  if (!draft) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-md border border-border bg-white p-4 shadow-panel md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">{draft.public_authority}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {draft.department ?? "Department not specified"}
            </p>
          </div>
          <StatusBadge>{draft.status.replaceAll("_", " ")}</StatusBadge>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form
          action={updateRti.bind(null, draft.id)}
          className="rounded-md border border-border bg-white p-4 shadow-panel md:p-5"
        >
          <h2 className="text-base font-semibold">Draft details</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Input defaultValue={draft.public_authority} label="Public authority" name="public_authority" />
            <Input defaultValue={draft.department ?? ""} label="Department" name="department" />
            <Input defaultValue={draft.time_period ?? ""} label="Time period" name="time_period" />
            <Input
              defaultValue={draft.preferred_response_format ?? ""}
              label="Preferred format"
              name="preferred_response_format"
            />
            <Textarea
              defaultValue={draft.information_requested}
              label="Information requested"
              name="information_requested"
              wide
            />
            <Textarea defaultValue={draft.draft_text} label="Draft text" name="draft_text" wide />
          </div>
          <button
            className="focus-ring mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            type="submit"
          >
            <Save aria-hidden="true" className="h-4 w-4" />
            Save draft
          </button>
        </form>

        <section className="rounded-md border border-border bg-white shadow-panel">
          <div className="border-b border-border px-4 py-3 md:px-5">
            <h2 className="text-base font-semibold">Preview and actions</h2>
          </div>
          <div className="space-y-4 p-4 md:p-5">
            <pre className="max-h-[560px] overflow-auto whitespace-pre-wrap rounded-md border border-border bg-muted/50 p-4 text-sm leading-6">
              {draft.draft_text}
            </pre>
            <div className="flex flex-wrap gap-2">
              <form action={exportRti.bind(null, draft.id)}>
                <button
                  className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
                  type="submit"
                >
                  <Download aria-hidden="true" className="h-4 w-4" />
                  Export PDF
                </button>
              </form>
              <form action={saveRtiDraftToCase.bind(null, draft.id)}>
                <button
                  className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                  type="submit"
                >
                  <Save aria-hidden="true" className="h-4 w-4" />
                  Save to case
                </button>
              </form>
            </div>
            {draft.pdf_document_id ? (
              <p className="text-sm text-muted-foreground">PDF document: {draft.pdf_document_id}</p>
            ) : null}
          </div>
        </section>
      </section>
    </div>
  );
}

function Input({
  defaultValue,
  label,
  name
}: {
  defaultValue?: string;
  label: string;
  name: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className="focus-ring mt-2 h-10 w-full rounded-md border border-border px-3 text-sm"
        defaultValue={defaultValue}
        name={name}
      />
    </label>
  );
}

function Textarea({
  defaultValue,
  label,
  name,
  wide = false
}: {
  defaultValue?: string;
  label: string;
  name: string;
  wide?: boolean;
}) {
  return (
    <label className={`block ${wide ? "md:col-span-2" : ""}`}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <textarea
        className="focus-ring mt-2 min-h-36 w-full rounded-md border border-border px-3 py-2 text-sm"
        defaultValue={defaultValue}
        name={name}
      />
    </label>
  );
}
