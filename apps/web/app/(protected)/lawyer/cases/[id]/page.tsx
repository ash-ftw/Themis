import { BellRing, Download, FileUp, Save, ScanText, Trash2 } from "lucide-react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/ui/status-badge";
import { getCase, getCaseTimeline, listCaseDocuments, listHearings } from "@/lib/api";
import type { DocumentRecord } from "@/lib/api";

import {
  deleteAssignedCaseDocument,
  downloadAssignedCaseDocument,
  retryAssignedDocumentOcr,
  scheduleAssignedHearingReminder,
  updateAssignedCase,
  updateAssignedHearing,
  uploadAssignedCaseDocument
} from "./actions";

type PageParams = Promise<{ id: string }>;

const lawyerStatuses = [
  "lawyer_assigned",
  "in_court",
  "hearing_scheduled",
  "awaiting_order",
  "closed"
];

export default async function LawyerCaseDetailPage({ params }: { params: PageParams }) {
  const { id } = await params;
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const [caseRecord, timeline, hearings, caseDocuments] = token
    ? await Promise.all([
        getCase(token, id).catch(() => null),
        getCaseTimeline(token, id).catch(() => null),
        listHearings(token, id).catch(() => null),
        listCaseDocuments(token, id).catch(() => null)
      ])
    : [null, null, null, null];

  if (!caseRecord) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-md border border-border bg-white p-4 shadow-panel md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">{caseRecord.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {caseRecord.category} - {caseRecord.district}, {caseRecord.state}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={caseRecord.urgency === "emergency" ? "danger" : "primary"}>
              {caseRecord.urgency}
            </StatusBadge>
            <StatusBadge>{caseRecord.status.replaceAll("_", " ")}</StatusBadge>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <form
          action={updateAssignedCase.bind(null, caseRecord.id)}
          className="rounded-md border border-border bg-white p-4 shadow-panel md:p-5"
        >
          <h2 className="text-base font-semibold">Assigned case notes</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Input defaultValue={caseRecord.court_name ?? ""} label="Court name" name="court_name" />
            <Input defaultValue={caseRecord.case_number ?? ""} label="Case number" name="case_number" />
            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select
                className="focus-ring mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
                defaultValue={caseRecord.status}
                name="status"
              >
                {lawyerStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <Textarea
              defaultValue={caseRecord.description}
              label="Case notes"
              name="description"
              wide
            />
          </div>
          <button
            className="focus-ring mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            type="submit"
          >
            <Save aria-hidden="true" className="h-4 w-4" />
            Save notes
          </button>
        </form>

        <section className="rounded-md border border-border bg-white shadow-panel">
          <div className="border-b border-border px-4 py-3 md:px-5">
            <h2 className="text-base font-semibold">Hearings</h2>
          </div>
          <div className="divide-y divide-border">
            {hearings?.hearings.length ? (
              hearings.hearings.map((hearing) => (
                <div className="space-y-3 px-4 py-4 md:px-5" key={hearing.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">
                      {hearing.court} - {hearing.hearing_date}
                    </h3>
                    <StatusBadge>{hearing.reminder_status}</StatusBadge>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{hearing.purpose}</p>
                  <form
                    action={updateAssignedHearing.bind(null, caseRecord.id, hearing.id)}
                    className="grid gap-3 md:grid-cols-2"
                  >
                    <Input defaultValue={hearing.next_date ?? ""} label="Next date" name="next_date" type="date" />
                    <Textarea defaultValue={hearing.outcome ?? ""} label="Outcome" name="outcome" />
                    <Textarea defaultValue={hearing.notes ?? ""} label="Notes" name="notes" />
                    <div className="flex flex-wrap gap-2 md:col-span-2">
                      <button
                        className="focus-ring inline-flex h-9 items-center justify-center rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
                        type="submit"
                      >
                        Save hearing outcome
                      </button>
                    </div>
                  </form>
                  <form action={scheduleAssignedHearingReminder.bind(null, caseRecord.id, hearing.id)}>
                    <button
                      className="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
                      type="submit"
                    >
                      <BellRing aria-hidden="true" className="h-4 w-4" />
                      Schedule reminder
                    </button>
                  </form>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No hearings have been added to this case.
              </div>
            )}
          </div>
        </section>
      </section>

      <section className="rounded-md border border-border bg-white shadow-panel">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
          <div className="flex items-center gap-2">
            <FileUp aria-hidden="true" className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold">Case documents</h2>
          </div>
          <StatusBadge>{caseDocuments?.total ?? 0} files</StatusBadge>
        </div>
        <div className="grid gap-6 p-4 lg:grid-cols-[360px_1fr] md:p-5">
          <form action={uploadAssignedCaseDocument.bind(null, caseRecord.id)} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">File</span>
              <input
                className="focus-ring mt-2 w-full rounded-md border border-dashed border-border px-3 py-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
                name="document"
                required
                type="file"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Document type</span>
                <select
                  className="focus-ring mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
                  defaultValue="lawyer_note"
                  name="document_type"
                >
                  <option value="lawyer_note">Lawyer note</option>
                  <option value="evidence">Evidence</option>
                  <option value="court_notice">Court notice</option>
                  <option value="court_order">Court order</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Access</span>
                <select
                  className="focus-ring mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
                  defaultValue="case_private"
                  name="access_level"
                >
                  <option value="case_private">Case private</option>
                  <option value="lawyer_private">Lawyer private</option>
                </select>
              </label>
            </div>
            <button
              className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
              type="submit"
            >
              <FileUp aria-hidden="true" className="h-4 w-4" />
              Upload
            </button>
          </form>

          <div className="space-y-3">
            {caseDocuments?.documents.length ? (
              caseDocuments.documents.map((document) => (
                <LawyerDocumentCard
                  caseId={caseRecord.id}
                  document={document}
                  key={document.id}
                />
              ))
            ) : (
              <div className="rounded-md border border-border px-4 py-10 text-center text-sm text-muted-foreground">
                No documents are attached to this assigned case.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-md border border-border bg-white shadow-panel">
        <div className="border-b border-border px-4 py-3 md:px-5">
          <h2 className="text-base font-semibold">Timeline</h2>
        </div>
        <div className="divide-y divide-border">
          {timeline?.events.length ? (
            timeline.events.map((event) => (
              <div className="px-4 py-4 md:px-5" key={event.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{event.title}</h3>
                  <StatusBadge>{event.event_type}</StatusBadge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(event.created_at).toLocaleString()}
                </p>
                {event.description ? (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {event.description}
                  </p>
                ) : null}
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No timeline events yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function LawyerDocumentCard({ caseId, document }: { caseId: string; document: DocumentRecord }) {
  return (
    <div className="rounded-md border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-medium">{document.original_file_name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {document.document_type.replaceAll("_", " ")} - {formatFileSize(document.file_size)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone={document.ocr_status === "failed" ? "danger" : "primary"}>
            OCR {document.ocr_status.replaceAll("_", " ")}
          </StatusBadge>
          <StatusBadge>{document.access_level.replaceAll("_", " ")}</StatusBadge>
        </div>
      </div>
      {document.ocr_text ? (
        <details className="mt-3 rounded-md border border-border bg-muted/50 p-3 text-sm leading-6">
          <summary className="cursor-pointer font-medium">Extracted text</summary>
          <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{document.ocr_text}</p>
        </details>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <form action={downloadAssignedCaseDocument.bind(null, caseId, document.id)}>
          <button
            className="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
            type="submit"
          >
            <Download aria-hidden="true" className="h-4 w-4" />
            Download
          </button>
        </form>
        <form action={retryAssignedDocumentOcr.bind(null, caseId, document.id)}>
          <button
            className="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
            type="submit"
          >
            <ScanText aria-hidden="true" className="h-4 w-4" />
            OCR
          </button>
        </form>
        <form action={deleteAssignedCaseDocument.bind(null, caseId, document.id)}>
          <button
            className="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700 hover:bg-red-50"
            type="submit"
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}

function Input({
  defaultValue,
  label,
  name,
  type = "text"
}: {
  defaultValue?: string;
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className="focus-ring mt-2 h-10 w-full rounded-md border border-border px-3 text-sm"
        defaultValue={defaultValue}
        name={name}
        type={type}
      />
    </label>
  );
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
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
        className="focus-ring mt-2 min-h-24 w-full rounded-md border border-border px-3 py-2 text-sm"
        defaultValue={defaultValue}
        name={name}
      />
    </label>
  );
}
