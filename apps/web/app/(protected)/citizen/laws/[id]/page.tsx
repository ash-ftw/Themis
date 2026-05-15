import { Bookmark, ExternalLink } from "lucide-react";
import { cookies } from "next/headers";

import { StatusBadge } from "@/components/ui/status-badge";
import { getLawSection } from "@/lib/api";

import { bookmarkLawSectionAction } from "./actions";

type Params = Promise<{ id: string }>;

export default async function LawDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const lawSection = token ? await getLawSection(token, id).catch(() => null) : null;

  if (lawSection === null) {
    return (
      <div className="mx-auto max-w-3xl rounded-md border border-border bg-white p-5 shadow-panel">
        <h2 className="text-base font-semibold">Law section unavailable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The section could not be loaded. Return to search and try again.
        </p>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-md border border-border bg-white p-5 shadow-panel">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="primary">{lawSection.section_number}</StatusBadge>
          <StatusBadge tone={lawSection.review_status === "reviewed" ? "success" : "neutral"}>
            {lawSection.review_status}
          </StatusBadge>
          {lawSection.is_bailable !== null ? (
            <StatusBadge>{lawSection.is_bailable ? "Bailable" : "Non-bailable"}</StatusBadge>
          ) : null}
          {lawSection.is_cognizable !== null ? (
            <StatusBadge>{lawSection.is_cognizable ? "Cognizable" : "Non-cognizable"}</StatusBadge>
          ) : null}
        </div>

        <h2 className="mt-4 text-2xl font-semibold">{lawSection.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{lawSection.act_name}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <form action={bookmarkLawSectionAction}>
            <input name="sectionId" type="hidden" value={lawSection.id} />
            <button
              className="focus-ring inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
              type="submit"
            >
              <Bookmark aria-hidden="true" className="h-4 w-4" />
              Bookmark
            </button>
          </form>
          {lawSection.source_reference ? (
            <span className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground">
              <ExternalLink aria-hidden="true" className="h-4 w-4" />
              {lawSection.source_reference}
            </span>
          ) : null}
        </div>
      </section>

      <Section title="Plain-language explanation">{lawSection.plain_language}</Section>

      {lawSection.original_text ? (
        <Section title="Original text">{lawSection.original_text}</Section>
      ) : null}

      {lawSection.punishment ? <Section title="Possible punishment">{lawSection.punishment}</Section> : null}

      {lawSection.jurisdiction_notes ? (
        <Section title="Jurisdiction notes">{lawSection.jurisdiction_notes}</Section>
      ) : null}

      {lawSection.example_scenarios.length ? (
        <section className="rounded-md border border-border bg-white p-5 shadow-panel">
          <h3 className="text-base font-semibold">Example scenarios</h3>
          <ul className="mt-3 space-y-2 text-sm leading-6">
            {lawSection.example_scenarios.map((scenario) => (
              <li key={scenario}>{scenario}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-border bg-white p-5 shadow-panel">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6">{children}</p>
    </section>
  );
}
