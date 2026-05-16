import { cookies } from "next/headers";

import { StatusBadge } from "@/components/ui/status-badge";
import { getLawyerProfile } from "@/lib/api";

import { saveLawyerProfile } from "./actions";

export default async function LawyerProfilePage() {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const profile = token ? await getLawyerProfile(token).catch(() => null) : null;
  const status = profile?.verification_status ?? "pending";

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-amber-950">
              Verification {status.replaceAll("_", " ")}
            </h2>
            <p className="mt-1 text-sm text-amber-900">
              Admin approval is required before legal aid requests are available.
            </p>
            {profile?.verification_notes ? (
              <p className="mt-2 text-sm text-amber-900">{profile.verification_notes}</p>
            ) : null}
          </div>
          <StatusBadge tone={status === "approved" ? "success" : "warning"}>{status}</StatusBadge>
        </div>
      </div>

      <form
        action={saveLawyerProfile}
        className="rounded-md border border-border bg-white p-4 shadow-panel md:p-5"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Bar number" name="bar_number" defaultValue={profile?.bar_number} required />
          <Field
            label="State Bar Council"
            name="state_bar_council"
            defaultValue={profile?.state_bar_council}
            required
          />
          <Field label="District" name="district" defaultValue={profile?.district} required />
          <Field
            label="Languages"
            name="languages"
            placeholder="English, Hindi, Marathi"
            defaultValue={profile?.languages.join(", ")}
          />
          <Field
            label="Specializations"
            name="specializations"
            placeholder="Consumer complaint, RTI"
            defaultValue={profile?.specializations.join(", ")}
          />
          <Field
            label="Maximum active cases"
            name="max_active_cases"
            type="number"
            defaultValue={`${profile?.max_active_cases ?? 3}`}
          />
          <Field
            label="Availability notes"
            name="availability"
            defaultValue={availabilityNotes(profile?.availability)}
          />
        </div>

        <label className="mt-4 flex items-center gap-3 text-sm text-slate-700">
          <input
            className="h-4 w-4 rounded border-border"
            defaultChecked={profile?.is_pro_bono ?? false}
            name="is_pro_bono"
            type="checkbox"
            value="true"
          />
          Available for pro bono matters
        </label>

        <div className="mt-5 flex justify-end">
          <button
            className="focus-ring rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            type="submit"
          >
            Save profile
          </button>
        </div>
      </form>
    </div>
  );
}

function availabilityNotes(value: Record<string, unknown> | undefined) {
  const notes = value?.notes;
  return typeof notes === "string" ? notes : "";
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  required = false
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
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
        required={required}
        type={type}
      />
    </div>
  );
}
