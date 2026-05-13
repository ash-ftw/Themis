import { StatusBadge } from "@/components/ui/status-badge";

export default function LawyerProfilePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-amber-950">Verification pending</h2>
            <p className="mt-1 text-sm text-amber-900">
              Admin approval is required before legal aid requests are available.
            </p>
          </div>
          <StatusBadge tone="warning">Pending</StatusBadge>
        </div>
      </div>

      <form className="rounded-md border border-border bg-white p-4 shadow-panel md:p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Bar number" name="barNumber" />
          <Field label="State Bar Council" name="stateBarCouncil" />
          <Field label="District" name="district" />
          <Field label="Languages" name="languages" placeholder="English, Hindi, Marathi" />
          <Field label="Specializations" name="specializations" placeholder="Consumer, RTI" />
          <Field label="Maximum active cases" name="maxActiveCases" type="number" defaultValue="3" />
        </div>

        <label className="mt-4 flex items-center gap-3 text-sm text-slate-700">
          <input className="h-4 w-4 rounded border-border" name="isProBono" type="checkbox" />
          Available for pro bono matters
        </label>

        <div className="mt-5 flex justify-end">
          <button
            className="focus-ring rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            type="button"
          >
            Save profile
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700" htmlFor={name}>
        {label}
      </label>
      <input
        className="focus-ring mt-2 h-10 w-full rounded-md border border-border px-3 text-sm"
        defaultValue={defaultValue}
        id={name}
        name={name}
        placeholder={placeholder}
        type={type}
      />
    </div>
  );
}
