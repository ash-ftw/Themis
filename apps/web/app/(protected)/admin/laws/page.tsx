import { Plus } from "lucide-react";
import { cookies } from "next/headers";

import { StatusBadge } from "@/components/ui/status-badge";
import { getLawSection, searchLaws } from "@/lib/api";
import type { LawSection } from "@/lib/api";

import { saveLawSectionAction } from "./actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminLawsPage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedParams = await searchParams;
  const selectedId = valueOf(resolvedParams.edit);
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const searchResponse = token ? await searchLaws(token, { limit: "25" }).catch(() => null) : null;
  const selectedLawSection =
    token && selectedId ? await getLawSection(token, selectedId).catch(() => null) : null;

  return (
    <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1fr_360px]">
      <section className="rounded-md border border-border bg-white shadow-panel">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
          <h2 className="text-base font-semibold">Legal content</h2>
          <div className="flex items-center gap-2">
            <StatusBadge>{searchResponse?.total ?? 0} records</StatusBadge>
            <StatusBadge tone="primary">{searchResponse?.elapsed_ms ?? 0} ms</StatusBadge>
          </div>
        </div>
        <div className="divide-y divide-border">
          {searchResponse?.results.length ? (
            searchResponse.results.map(({ law_section: lawSection }) => (
              <div
                className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_auto] md:items-center md:px-5"
                key={lawSection.id}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{lawSection.title}</h3>
                    <StatusBadge tone="primary">{lawSection.section_number}</StatusBadge>
                    <StatusBadge
                      tone={lawSection.review_status === "reviewed" ? "success" : "neutral"}
                    >
                      {lawSection.review_status}
                    </StatusBadge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{lawSection.act_name}</p>
                </div>
                <a
                  className="focus-ring inline-flex h-9 items-center justify-center rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
                  href={`/admin/laws?edit=${lawSection.id}`}
                >
                  Edit
                </a>
              </div>
            ))
          ) : (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              Seed or create legal records to populate this table.
            </div>
          )}
        </div>
      </section>

      <aside className="rounded-md border border-border bg-white p-4 shadow-panel md:p-5">
        <div className="flex items-center gap-2">
          <Plus aria-hidden="true" className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold">
            {selectedLawSection ? "Edit section" : "Create section"}
          </h2>
        </div>
        <form action={saveLawSectionAction} className="mt-4 space-y-4">
          <input name="sectionId" type="hidden" value={selectedLawSection?.id ?? ""} />
          <Field label="Act name" name="actName" value={selectedLawSection?.act_name} />
          <Field
            label="Section number"
            name="sectionNumber"
            value={selectedLawSection?.section_number}
          />
          <Field label="Title" name="title" value={selectedLawSection?.title} />
          <Field label="IPC mapping" name="ipcMapping" value={selectedLawSection?.ipc_mapping} />
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Plain-language explanation</span>
            <textarea
              className="focus-ring mt-2 min-h-28 w-full rounded-md border border-border px-3 py-2 text-sm"
              defaultValue={selectedLawSection?.plain_language}
              name="plainLanguage"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Original text</span>
            <textarea
              className="focus-ring mt-2 min-h-20 w-full rounded-md border border-border px-3 py-2 text-sm"
              defaultValue={selectedLawSection?.original_text ?? ""}
              name="originalText"
            />
          </label>
          <Field label="Punishment" name="punishment" value={selectedLawSection?.punishment} />
          <Field
            label="Categories"
            name="categoryTags"
            value={joinList(selectedLawSection?.category_tags)}
          />
          <Field
            label="Related sections"
            name="relatedSections"
            value={joinList(selectedLawSection?.related_sections)}
          />
          <Field
            label="Example scenarios"
            name="exampleScenarios"
            value={joinList(selectedLawSection?.example_scenarios)}
          />
          <Field
            label="Jurisdiction notes"
            name="jurisdictionNotes"
            value={selectedLawSection?.jurisdiction_notes}
          />
          <Field
            label="Source reference"
            name="sourceReference"
            value={selectedLawSection?.source_reference}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectBoolean
              label="Bailable"
              name="isBailable"
              value={selectedLawSection?.is_bailable}
            />
            <SelectBoolean
              label="Cognizable"
              name="isCognizable"
              value={selectedLawSection?.is_cognizable}
            />
          </div>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Review status</span>
            <select
              className="focus-ring mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
              defaultValue={selectedLawSection?.review_status ?? "draft"}
              name="reviewStatus"
            >
              <option value="draft">Draft</option>
              <option value="reviewed">Reviewed</option>
              <option value="deprecated">Deprecated</option>
            </select>
          </label>
          <button
            className="focus-ring inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            type="submit"
          >
            Save legal record
          </button>
        </form>
      </aside>
    </div>
  );
}

function Field({ label, name, value }: { label: string; name: string; value?: string | null }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className="focus-ring mt-2 h-10 w-full rounded-md border border-border px-3 text-sm"
        defaultValue={value ?? ""}
        name={name}
      />
    </label>
  );
}

function SelectBoolean({
  label,
  name,
  value
}: {
  label: string;
  name: string;
  value?: boolean | null;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        className="focus-ring mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
        defaultValue={value === null || value === undefined ? "" : String(value)}
        name={name}
      >
        <option value="">Not applicable</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    </label>
  );
}

function valueOf(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function joinList(value: LawSection[keyof LawSection] | undefined) {
  return Array.isArray(value) ? value.join(", ") : "";
}
