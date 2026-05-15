import { FilePlus2 } from "lucide-react";
import { cookies } from "next/headers";

import { StatusBadge } from "@/components/ui/status-badge";
import { listCases } from "@/lib/api";

import { createCitizenCase } from "./actions";

export default async function CitizenCasesPage() {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const cases = token ? await listCases(token).catch(() => null) : null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <form
          action={createCitizenCase}
          className="rounded-md border border-border bg-white p-4 shadow-panel md:p-5"
        >
          <div className="flex items-center gap-2">
            <FilePlus2 aria-hidden="true" className="h-5 w-5 text-primary" />
            <h1 className="text-base font-semibold">Create case</h1>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Input label="Title" name="title" required />
            <Input label="Category" name="category" required />
            <Input label="State" name="state" required />
            <Input label="District" name="district" required />
            <Input label="Police station" name="police_station" />
            <Input label="FIR number" name="fir_number" />
            <Input label="Court name" name="court_name" />
            <Input label="Case number" name="case_number" />
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
            <Textarea label="Sections" name="sections" />
            <Textarea label="Description" name="description" required wide />
          </div>

          <button
            className="focus-ring mt-5 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            type="submit"
          >
            Create case
          </button>
        </form>

        <section className="rounded-md border border-border bg-white shadow-panel">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
            <h2 className="text-base font-semibold">Your cases</h2>
            <StatusBadge>{cases?.total ?? 0} total</StatusBadge>
          </div>
          <div className="divide-y divide-border">
            {cases?.results.length ? (
              cases.results.map((caseRecord) => (
                <a
                  className="block px-4 py-4 transition hover:bg-muted md:px-5"
                  href={`/citizen/cases/${caseRecord.id}`}
                  key={caseRecord.id}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{caseRecord.title}</h3>
                    <StatusBadge tone={caseRecord.urgency === "emergency" ? "danger" : "primary"}>
                      {caseRecord.urgency}
                    </StatusBadge>
                    <StatusBadge>{caseRecord.status.replaceAll("_", " ")}</StatusBadge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {caseRecord.category} - {caseRecord.district}, {caseRecord.state}
                  </p>
                  <p className="mt-3 line-clamp-2 text-sm leading-6">{caseRecord.description}</p>
                </a>
              ))
            ) : (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                No cases yet. Create one manually or save an assessment or complaint draft to a
                case.
              </div>
            )}
          </div>
        </section>
      </section>
    </div>
  );
}

function Input({
  label,
  name,
  required = false
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className="focus-ring mt-2 h-10 w-full rounded-md border border-border px-3 text-sm"
        name={name}
        required={required}
      />
    </label>
  );
}

function Textarea({
  label,
  name,
  required = false,
  wide = false
}: {
  label: string;
  name: string;
  required?: boolean;
  wide?: boolean;
}) {
  return (
    <label className={`block ${wide ? "md:col-span-2" : ""}`}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <textarea
        className="focus-ring mt-2 min-h-24 w-full rounded-md border border-border px-3 py-2 text-sm"
        name={name}
        required={required}
      />
    </label>
  );
}
