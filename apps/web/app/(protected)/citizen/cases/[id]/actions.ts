"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  archiveCase,
  cancelLegalAidRequest,
  createHearing,
  createLegalAidRequest,
  deleteHearing,
  scheduleHearingReminders,
  updateCase,
  updateHearing
} from "@/lib/api";

export async function updateCitizenCase(caseId: string, formData: FormData) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  await updateCase(token, caseId, {
    title: valueOf(formData, "title"),
    category: valueOf(formData, "category"),
    state: valueOf(formData, "state"),
    district: valueOf(formData, "district"),
    urgency: valueOf(formData, "urgency"),
    fir_number: valueOf(formData, "fir_number"),
    police_station: valueOf(formData, "police_station"),
    court_name: valueOf(formData, "court_name"),
    case_number: valueOf(formData, "case_number"),
    status: valueOf(formData, "status"),
    sections: listOf(formData, "sections"),
    description: valueOf(formData, "description")
  });
  revalidatePath(`/citizen/cases/${caseId}`);
}

export async function archiveCitizenCase(caseId: string) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  await archiveCase(token, caseId);
  revalidatePath("/citizen/cases");
  redirect("/citizen/cases");
}

export async function createCaseHearing(caseId: string, formData: FormData) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  await createHearing(token, caseId, hearingPayload(formData));
  revalidatePath(`/citizen/cases/${caseId}`);
}

export async function updateCaseHearing(caseId: string, hearingId: string, formData: FormData) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  await updateHearing(token, hearingId, hearingPayload(formData));
  revalidatePath(`/citizen/cases/${caseId}`);
}

export async function deleteCaseHearing(caseId: string, hearingId: string) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  await deleteHearing(token, hearingId);
  revalidatePath(`/citizen/cases/${caseId}`);
}

export async function scheduleCaseHearingReminder(caseId: string, hearingId: string) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  await scheduleHearingReminders(token, hearingId);
  revalidatePath(`/citizen/cases/${caseId}`);
}

export async function requestLegalAid(caseId: string, lawyerId: string, formData: FormData) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  await createLegalAidRequest(token, caseId, {
    lawyer_id: lawyerId,
    message: valueOf(formData, "message")
  });
  revalidatePath(`/citizen/cases/${caseId}`);
}

export async function cancelCaseLegalAidRequest(caseId: string, requestId: string) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  await cancelLegalAidRequest(token, requestId);
  revalidatePath(`/citizen/cases/${caseId}`);
}

function hearingPayload(formData: FormData) {
  return {
    hearing_date: valueOf(formData, "hearing_date"),
    hearing_time: valueOf(formData, "hearing_time"),
    court: valueOf(formData, "court"),
    court_room: valueOf(formData, "court_room"),
    judge: valueOf(formData, "judge"),
    purpose: valueOf(formData, "purpose"),
    outcome: valueOf(formData, "outcome"),
    next_date: valueOf(formData, "next_date"),
    notes: valueOf(formData, "notes")
  };
}

function valueOf(formData: FormData, key: string) {
  const value = formData.get(key)?.toString().trim();
  return value || undefined;
}

function listOf(formData: FormData, key: string) {
  return (
    valueOf(formData, key)
      ?.split("\n")
      .map((item) => item.trim())
      .filter(Boolean) ?? []
  );
}
