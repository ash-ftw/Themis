export default function CitizenProfilePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <form className="rounded-md border border-border bg-white p-4 shadow-panel md:p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name" name="fullName" />
          <Field label="Phone" name="phone" type="tel" />
          <Field label="State" name="state" />
          <Field label="District" name="district" />
          <Field label="Preferred language" name="preferredLanguage" defaultValue="English" />
          <Field label="Emergency contact" name="emergencyContact" type="tel" />
        </div>

        <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="address">
          Address
        </label>
        <textarea
          className="focus-ring mt-2 min-h-24 w-full rounded-md border border-border px-3 py-2 text-sm"
          id="address"
          name="address"
        />

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
  defaultValue
}: {
  label: string;
  name: string;
  type?: string;
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
        type={type}
      />
    </div>
  );
}
