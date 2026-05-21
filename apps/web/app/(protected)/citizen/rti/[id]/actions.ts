"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { exportRtiPdf, saveRtiToCase, updateRtiDraft } from "@/lib/api";

export async function updateRti(draftId: string, formData: FormData) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  await updateRtiDraft(token, draftId, {
    department: valueOf(formData, "department"),
    draft_text: valueOf(formData, "draft_text"),
    information_requested: valueOf(formData, "information_requested"),
    preferred_response_format: valueOf(formData, "preferred_response_format"),
    public_authority: valueOf(formData, "public_authority"),
    time_period: valueOf(formData, "time_period")
  });
  revalidatePath(`/citizen/rti/${draftId}`);
}

export async function exportRti(draftId: string) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  await exportRtiPdf(token, draftId);
  revalidatePath(`/citizen/rti/${draftId}`);
}

export async function saveRtiDraftToCase(draftId: string) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const result = await saveRtiToCase(token, draftId);
  redirect(`/citizen/cases/${result.case.id}`);
}

function valueOf(formData: FormData, key: string) {
  const value = formData.get(key)?.toString().trim();
  return value || undefined;
}
