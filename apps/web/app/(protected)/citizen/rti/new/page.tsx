import { FileText } from "lucide-react";

import { createRtiDraft } from "./actions";

export default function NewRtiPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <form action={createRtiDraft} className="rounded-md border border-border bg-white p-4 shadow-panel md:p-5">
        <div className="flex items-center gap-2">
          <FileText aria-hidden="true" className="h-5 w-5 text-primary" />
          <h1 className="text-base font-semibold">Generate RTI application</h1>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Input label="Applicant name" name="applicant_name" />
          <Input label="Public authority" name="public_authority" required />
          <Input label="Department" name="department" />
          <Input label="Time period" name="time_period" />
          <Input
            defaultValue="certified copies / written reply"
            label="Preferred format"
            name="preferred_response_format"
          />
          <label className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
            <input className="h-4 w-4" name="bpl_status" type="checkbox" />
            BPL fee waiver
          </label>
          <Textarea label="Applicant address" name="applicant_address" />
          <Textarea
            label="Information requested"
            name="information_requested"
            required
            wide
          />
        </div>
        <button
          className="focus-ring mt-5 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          type="submit"
        >
          Generate draft
        </button>
      </form>
    </div>
  );
}

function Input({
  defaultValue,
  label,
  name,
  required = false
}: {
  defaultValue?: string;
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className="focus-ring mt-2 h-10 w-full rounded-md border border-border px-3 text-sm"
        defaultValue={defaultValue}
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
        className="focus-ring mt-2 min-h-28 w-full rounded-md border border-border px-3 py-2 text-sm"
        name={name}
        required={required}
      />
    </label>
  );
}
