import { Plus } from "lucide-react";
import { cookies } from "next/headers";

import { StatusBadge } from "@/components/ui/status-badge";
import { searchLaws } from "@/lib/api";

export default async function AdminLawsPage() {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const searchResponse = token ? await searchLaws(token, { limit: "25" }).catch(() => null) : null;

  return (
    <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1fr_360px]">
      <section className="rounded-md border border-border bg-white shadow-panel">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
          <h2 className="text-base font-semibold">Legal content</h2>
          <StatusBadge>{searchResponse?.total ?? 0} records</StatusBadge>
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
                  href={`/citizen/laws/${lawSection.id}`}
                >
                  Preview
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
          <h2 className="text-base font-semibold">Create or edit section</h2>
        </div>
        <form className="mt-4 space-y-4">
          <Field label="Act name" name="actName" />
          <Field label="Section number" name="sectionNumber" />
          <Field label="Title" name="title" />
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Plain-language explanation</span>
            <textarea
              className="focus-ring mt-2 min-h-28 w-full rounded-md border border-border px-3 py-2 text-sm"
              name="plainLanguage"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Review status</span>
            <select
              className="focus-ring mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
              name="reviewStatus"
            >
              <option value="draft">Draft</option>
              <option value="reviewed">Reviewed</option>
              <option value="deprecated">Deprecated</option>
            </select>
          </label>
          <button
            className="focus-ring inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            type="button"
          >
            Save legal record
          </button>
        </form>
      </aside>
    </div>
  );
}

function Field({ label, name }: { label: string; name: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className="focus-ring mt-2 h-10 w-full rounded-md border border-border px-3 text-sm"
        name={name}
      />
    </label>
  );
}
