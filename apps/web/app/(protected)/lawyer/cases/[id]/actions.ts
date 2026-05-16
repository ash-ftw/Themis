"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  deleteDocument,
  getDocumentDownloadUrl,
  requestDocumentOcr,
  scheduleHearingReminders,
  updateCase,
  updateHearing
} from "@/lib/api";
import { uploadCaseDocumentFile } from "@/lib/document-upload";

export async function updateAssignedCase(caseId: string, formData: FormData) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  await updateCase(token, caseId, {
    status: valueOf(formData, "status"),
    court_name: valueOf(formData, "court_name"),
    case_number: valueOf(formData, "case_number"),
    description: valueOf(formData, "description")
  });
  revalidatePath(`/lawyer/cases/${caseId}`);
}

export async function updateAssignedHearing(caseId: string, hearingId: string, formData: FormData) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  await updateHearing(token, hearingId, {
    outcome: valueOf(formData, "outcome"),
    next_date: valueOf(formData, "next_date"),
    notes: valueOf(formData, "notes")
  });
  revalidatePath(`/lawyer/cases/${caseId}`);
}

export async function scheduleAssignedHearingReminder(caseId: string, hearingId: string) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  await scheduleHearingReminders(token, hearingId);
  revalidatePath(`/lawyer/cases/${caseId}`);
}

export async function uploadAssignedCaseDocument(caseId: string, formData: FormData) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  await uploadCaseDocumentFile(token, caseId, formData);
  revalidatePath(`/lawyer/cases/${caseId}`);
}

export async function downloadAssignedCaseDocument(caseId: string, documentId: string) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const download = await getDocumentDownloadUrl(token, documentId);
  revalidatePath(`/lawyer/cases/${caseId}`);
  redirect(download.download_url as Parameters<typeof redirect>[0]);
}

export async function retryAssignedDocumentOcr(caseId: string, documentId: string) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  await requestDocumentOcr(token, documentId);
  revalidatePath(`/lawyer/cases/${caseId}`);
}

export async function deleteAssignedCaseDocument(caseId: string, documentId: string) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  await deleteDocument(token, documentId);
  revalidatePath(`/lawyer/cases/${caseId}`);
}

function valueOf(formData: FormData, key: string) {
  const value = formData.get(key)?.toString().trim();
  return value || undefined;
}
