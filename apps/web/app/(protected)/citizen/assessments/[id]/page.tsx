import { FileText, FolderPlus, ShieldAlert } from "lucide-react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/ui/status-badge";
import { getAssessment } from "@/lib/api";

import { generateComplaintFromAssessment, saveAssessmentCase } from "./actions";

type PageParams = Promise<{ id: string }>;

const confidenceTone = {
  low: "neutral",
  medium: "warning",
  high: "success"
} as const;

export default async function AssessmentResultPage({ params }: { params: PageParams }) {
  const { id } = await params;
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const assessment = token ? await getAssessment(token, id).catch(() => null) : null;

  if (!assessment) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-md border border-amber-200 bg-amber-50 p-4 shadow-panel md:p-5">
        <div className="flex gap-3">
          <ShieldAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <h1 className="text-base font-semibold text-amber-950">Assessment result</h1>
            <p className="mt-1 text-sm leading-6 text-amber-900">
              These suggestions are informational and use rule-based matching. They do not confirm
              liability, remedies, or legal advice.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-md border border-border bg-white shadow-panel">
          <div className="border-b border-border px-4 py-3 md:px-5">
            <h2 className="text-base font-semibold">Possible matches</h2>
          </div>
          <div className="space-y-4 p-4 md:p-5">
            <p className="text-sm leading-6 text-muted-foreground">
              {assessment.result_summary ?? "No analysis has been generated yet."}
            </p>

            <div className="space-y-3">
              {assessment.section_suggestions.map((suggestion) => (
                <div className="rounded-md border border-border p-4" key={suggestion.section}>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{suggestion.section}</h3>
                    <StatusBadge tone={confidenceTone[suggestion.confidence]}>
                      {suggestion.confidence} confidence
                    </StatusBadge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {suggestion.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-md border border-border bg-white shadow-panel">
          <div className="border-b border-border px-4 py-3 md:px-5">
            <h2 className="text-base font-semibold">Evidence checklist</h2>
          </div>
          <div className="divide-y divide-border">
            {assessment.evidence_checklist.map((item) => (
              <div className="px-4 py-3 md:px-5" key={item.label}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.label}</span>
                  <StatusBadge tone={item.required ? "warning" : "neutral"}>
                    {item.required ? "recommended" : "supporting"}
                  </StatusBadge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <form
          action={generateComplaintFromAssessment.bind(null, assessment.id)}
          className="rounded-md border border-border bg-white p-4 shadow-panel md:p-5"
        >
          <div className="flex items-center gap-2">
            <FileText aria-hidden="true" className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold">Generate complaint draft</h2>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Input name="complainant_name" label="Complainant name" />
            <Input name="phone" label="Phone" />
            <Input name="authority_name" label="Authority or police station" />
            <Input name="accused_details" label="Accused details" />
            <Textarea name="address" label="Address" />
            <Textarea name="witnesses" label="Witnesses" />
            <Textarea name="requested_action" label="Requested action" wide />
          </div>
          <button
            className="focus-ring mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            type="submit"
          >
            Generate draft
          </button>
        </form>

        <form
          action={saveAssessmentCase.bind(null, assessment.id)}
          className="rounded-md border border-border bg-white p-4 shadow-panel md:p-5"
        >
          <div className="flex items-center gap-2">
            <FolderPlus aria-hidden="true" className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold">Save to case</h2>
          </div>
          {assessment.case_id ? (
            <p className="mt-4 text-sm text-muted-foreground">
              This assessment is already linked to a case.
            </p>
          ) : (
            <>
              <div className="mt-4 grid gap-3">
                <Input
                  name="title"
                  label="Case title"
                  placeholder={`${assessment.issue_category.replaceAll("_", " ")} assessment`}
                />
                <Textarea name="description" label="Case description" />
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Urgency</span>
                  <select
                    className="focus-ring mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
                    defaultValue="medium"
                    name="urgency"
                  >
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                    <option value="emergency">emergency</option>
                  </select>
                </label>
              </div>
              <button
                className="focus-ring mt-4 inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
                type="submit"
              >
                Save assessment
              </button>
            </>
          )}
        </form>
      </section>
    </div>
  );
}

function Input({
  label,
  name,
  placeholder
}: {
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className="focus-ring mt-2 h-10 w-full rounded-md border border-border px-3 text-sm"
        name={name}
        placeholder={placeholder}
      />
    </label>
  );
}

function Textarea({ label, name, wide = false }: { label: string; name: string; wide?: boolean }) {
  return (
    <label className={`block ${wide ? "md:col-span-2" : ""}`}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <textarea
        className="focus-ring mt-2 min-h-24 w-full rounded-md border border-border px-3 py-2 text-sm"
        name={name}
      />
    </label>
  );
}
