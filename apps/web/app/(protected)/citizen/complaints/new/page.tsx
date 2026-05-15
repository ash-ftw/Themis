import { createManualComplaint } from "./actions";

export default function NewComplaintPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Complaint draft</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Prepare a structured complaint or FIR-support draft. The generated output stays editable
          and should be reviewed before submission.
        </p>
      </div>

      <form
        action={createManualComplaint}
        className="rounded-md border border-border bg-white p-4 shadow-panel md:p-5"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Complainant name" name="complainant_name" />
          <Input label="Phone" name="phone" />
          <Input label="Email" name="email" />
          <Input label="Authority or police station" name="authority_name" />
          <Input label="Date and time" name="incident_date_time" />
          <Input label="Incident location" name="incident_location" />
          <Input label="Place" name="place" />
          <Input label="Accused details" name="accused_details" />
          <Textarea label="Address" name="address" />
          <Textarea label="Incident description" name="incident_description" />
          <Textarea label="Witnesses" name="witnesses" />
          <Textarea label="Evidence list" name="evidence" />
          <Textarea label="Possible legal sections" name="possible_sections" />
          <Textarea label="Requested action" name="requested_action" />
        </div>

        <button
          className="focus-ring mt-5 inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
          type="submit"
        >
          Generate preview
        </button>
      </form>
    </div>
  );
}

function Input({ label, name }: { label: string; name: string }) {
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

function Textarea({ label, name }: { label: string; name: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <textarea
        className="focus-ring mt-2 min-h-24 w-full rounded-md border border-border px-3 py-2 text-sm"
        name={name}
      />
    </label>
  );
}
