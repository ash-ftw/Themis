import { Archive, BellRing, CalendarPlus, Save } from "lucide-react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/ui/status-badge";
import { getCase, getCaseTimeline, listHearings } from "@/lib/api";

import {
  archiveCitizenCase,
  createCaseHearing,
  deleteCaseHearing,
  scheduleCaseHearingReminder,
  updateCaseHearing,
  updateCitizenCase
} from "./actions";

type PageParams = Promise<{ id: string }>;

const statuses = [
  "draft",
  "assessment_completed",
  "complaint_prepared",
  "complaint_submitted",
  "fir_filed",
  "under_investigation",
  "legal_aid_requested",
  "lawyer_assigned",
  "in_court",
  "hearing_scheduled",
  "awaiting_order",
  "closed"
];

export default async function CitizenCaseDetailPage({ params }: { params: PageParams }) {
  const { id } = await params;
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const [caseRecord, timeline, hearings] = token
    ? await Promise.all([
        getCase(token, id).catch(() => null),
        getCaseTimeline(token, id).catch(() => null),
        listHearings(token, id).catch(() => null)
      ])
    : [null, null, null];

  if (!caseRecord) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-md border border-border bg-white p-4 shadow-panel md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">{caseRecord.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {caseRecord.category} - {caseRecord.district}, {caseRecord.state}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={caseRecord.urgency === "emergency" ? "danger" : "primary"}>
              {caseRecord.urgency}
            </StatusBadge>
            <StatusBadge>{caseRecord.status.replaceAll("_", " ")}</StatusBadge>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form
          action={updateCitizenCase.bind(null, caseRecord.id)}
          className="rounded-md border border-border bg-white p-4 shadow-panel md:p-5"
        >
          <h2 className="text-base font-semibold">Case details</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Input defaultValue={caseRecord.title} label="Title" name="title" required />
            <Input defaultValue={caseRecord.category} label="Category" name="category" required />
            <Input defaultValue={caseRecord.state} label="State" name="state" required />
            <Input defaultValue={caseRecord.district} label="District" name="district" required />
            <Input defaultValue={caseRecord.police_station ?? ""} label="Police station" name="police_station" />
            <Input defaultValue={caseRecord.fir_number ?? ""} label="FIR number" name="fir_number" />
            <Input defaultValue={caseRecord.court_name ?? ""} label="Court name" name="court_name" />
            <Input defaultValue={caseRecord.case_number ?? ""} label="Case number" name="case_number" />
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Urgency</span>
              <select
                className="focus-ring mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
                defaultValue={caseRecord.urgency}
                name="urgency"
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
                <option value="emergency">emergency</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select
                className="focus-ring mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
                defaultValue={caseRecord.status}
                name="status"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <Textarea
              defaultValue={caseRecord.sections.join("\n")}
              label="Sections"
              name="sections"
            />
            <Textarea
              defaultValue={caseRecord.description}
              label="Description"
              name="description"
              required
              wide
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
              type="submit"
            >
              <Save aria-hidden="true" className="h-4 w-4" />
              Save details
            </button>
          </div>
        </form>

        <div className="space-y-6">
          <form
            action={createCaseHearing.bind(null, caseRecord.id)}
            className="rounded-md border border-border bg-white p-4 shadow-panel md:p-5"
          >
            <div className="flex items-center gap-2">
              <CalendarPlus aria-hidden="true" className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold">Add hearing</h2>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Input label="Date" name="hearing_date" required type="date" />
              <Input label="Time" name="hearing_time" type="time" />
              <Input label="Court" name="court" required />
              <Input label="Court room" name="court_room" />
              <Input label="Judge" name="judge" />
              <Textarea label="Purpose" name="purpose" required wide />
              <Textarea label="Notes" name="notes" wide />
            </div>
            <button
              className="focus-ring mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
              type="submit"
            >
              Add hearing
            </button>
          </form>

          <section className="rounded-md border border-border bg-white shadow-panel">
            <div className="border-b border-border px-4 py-3 md:px-5">
              <h2 className="text-base font-semibold">Hearings</h2>
            </div>
            <div className="divide-y divide-border">
              {hearings?.hearings.length ? (
                hearings.hearings.map((hearing) => (
                  <div className="space-y-3 px-4 py-4 md:px-5" key={hearing.id}>
                    <form
                      action={updateCaseHearing.bind(null, caseRecord.id, hearing.id)}
                      className="grid gap-3 md:grid-cols-2"
                    >
                      <Input defaultValue={hearing.hearing_date} label="Date" name="hearing_date" type="date" />
                      <Input defaultValue={hearing.hearing_time ?? ""} label="Time" name="hearing_time" type="time" />
                      <Input defaultValue={hearing.court} label="Court" name="court" />
                      <Input defaultValue={hearing.court_room ?? ""} label="Court room" name="court_room" />
                      <Input defaultValue={hearing.judge ?? ""} label="Judge" name="judge" />
                      <Input defaultValue={hearing.next_date ?? ""} label="Next date" name="next_date" type="date" />
                      <Textarea defaultValue={hearing.purpose} label="Purpose" name="purpose" />
                      <Textarea defaultValue={hearing.outcome ?? ""} label="Outcome" name="outcome" />
                      <Textarea defaultValue={hearing.notes ?? ""} label="Notes" name="notes" wide />
                      <div className="flex flex-wrap items-center gap-2 md:col-span-2">
                        <StatusBadge>{hearing.reminder_status}</StatusBadge>
                        <button
                          className="focus-ring inline-flex h-9 items-center justify-center rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
                          type="submit"
                        >
                          Save hearing
                        </button>
                      </div>
                    </form>
                    <div className="flex flex-wrap gap-2">
                      <form action={scheduleCaseHearingReminder.bind(null, caseRecord.id, hearing.id)}>
                        <button
                          className="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
                          type="submit"
                        >
                          <BellRing aria-hidden="true" className="h-4 w-4" />
                          Schedule reminder
                        </button>
                      </form>
                      <form action={deleteCaseHearing.bind(null, caseRecord.id, hearing.id)}>
                        <button
                          className="focus-ring inline-flex h-9 items-center justify-center rounded-md border border-red-200 px-3 text-sm font-medium text-red-700 hover:bg-red-50"
                          type="submit"
                        >
                          Delete hearing
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No hearings added yet.
                </div>
              )}
            </div>
          </section>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="rounded-md border border-border bg-white shadow-panel">
          <div className="border-b border-border px-4 py-3 md:px-5">
            <h2 className="text-base font-semibold">Timeline</h2>
          </div>
          <div className="divide-y divide-border">
            {timeline?.events.length ? (
              timeline.events.map((event) => (
                <div className="px-4 py-4 md:px-5" key={event.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{event.title}</h3>
                    <StatusBadge>{event.event_type}</StatusBadge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(event.created_at).toLocaleString()}
                  </p>
                  {event.description ? (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {event.description}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No timeline events yet.
              </div>
            )}
          </div>
        </div>

        <form
          action={archiveCitizenCase.bind(null, caseRecord.id)}
          className="rounded-md border border-border bg-white p-4 shadow-panel"
        >
          <h2 className="text-base font-semibold">Archive case</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Archived cases are hidden from the default case list but remain retained.
          </p>
          <button
            className="focus-ring mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-red-200 px-4 text-sm font-medium text-red-700 hover:bg-red-50"
            type="submit"
          >
            <Archive aria-hidden="true" className="h-4 w-4" />
            Archive
          </button>
        </form>
      </section>
    </div>
  );
}

function Input({
  defaultValue,
  label,
  name,
  required = false,
  type = "text"
}: {
  defaultValue?: string;
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className="focus-ring mt-2 h-10 w-full rounded-md border border-border px-3 text-sm"
        defaultValue={defaultValue}
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}

function Textarea({
  defaultValue,
  label,
  name,
  required = false,
  wide = false
}: {
  defaultValue?: string;
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
        defaultValue={defaultValue}
        name={name}
        required={required}
      />
    </label>
  );
}
