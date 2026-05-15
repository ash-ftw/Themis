import { Search } from "lucide-react";
import { cookies } from "next/headers";

import { StatusBadge } from "@/components/ui/status-badge";
import { searchLaws } from "@/lib/api";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const categories = [
  { label: "All categories", value: "" },
  { label: "Consumer", value: "consumer_complaint" },
  { label: "Cyber fraud", value: "cyber_fraud" },
  { label: "Domestic violence", value: "domestic_violence" },
  { label: "RTI", value: "rti_request" }
];

export default async function LegalSearchPage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedParams = await searchParams;
  const q = valueOf(resolvedParams.q);
  const category = valueOf(resolvedParams.category);
  const actName = valueOf(resolvedParams.act_name);
  const sectionNumber = valueOf(resolvedParams.section_number);
  const token = (await cookies()).get("themis-session")?.value ?? "";

  const searchResponse = token
    ? await searchLaws(token, {
        q,
        category,
        act_name: actName,
        section_number: sectionNumber,
        review_status: "reviewed"
      }).catch(() => null)
    : null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <form className="rounded-md border border-border bg-white p-4 shadow-panel md:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_180px_auto]">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Keyword</span>
            <input
              className="focus-ring mt-2 h-10 w-full rounded-md border border-border px-3 text-sm"
              defaultValue={q}
              name="q"
              placeholder="Search act, section, issue, or phrase"
              type="search"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Act</span>
            <input
              className="focus-ring mt-2 h-10 w-full rounded-md border border-border px-3 text-sm"
              defaultValue={actName}
              name="act_name"
              placeholder="BNS, RTI"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Section</span>
            <input
              className="focus-ring mt-2 h-10 w-full rounded-md border border-border px-3 text-sm"
              defaultValue={sectionNumber}
              name="section_number"
              placeholder="318"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Category</span>
            <select
              className="focus-ring mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
              defaultValue={category}
              name="category"
            >
              {categories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <button
            className="focus-ring mt-7 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            type="submit"
          >
            <Search aria-hidden="true" className="h-4 w-4" />
            Search
          </button>
        </div>
      </form>

      <section className="rounded-md border border-border bg-white shadow-panel">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
          <h2 className="text-base font-semibold">Search results</h2>
          <StatusBadge>{searchResponse?.total ?? 0} found</StatusBadge>
        </div>
        <div className="divide-y divide-border">
          {searchResponse?.results.length ? (
            searchResponse.results.map(({ law_section: lawSection }) => (
              <a
                className="block px-4 py-4 transition hover:bg-muted md:px-5"
                href={`/citizen/laws/${lawSection.id}`}
                key={lawSection.id}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{lawSection.title}</h3>
                  <StatusBadge tone="primary">{lawSection.section_number}</StatusBadge>
                  <StatusBadge tone={lawSection.review_status === "reviewed" ? "success" : "neutral"}>
                    {lawSection.review_status}
                  </StatusBadge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{lawSection.act_name}</p>
                <p className="mt-3 line-clamp-2 text-sm leading-6">{lawSection.plain_language}</p>
              </a>
            ))
          ) : (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              Search by keyword, act, section number, or category.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function valueOf(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
