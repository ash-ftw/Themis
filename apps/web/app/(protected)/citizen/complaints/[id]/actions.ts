"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { exportComplaintPdf, saveComplaintToCase, updateComplaintDraft } from "@/lib/api";

export async function updateDraft(draftId: string, formData: FormData) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  await updateComplaintDraft(token, draftId, {
    draft_text: formData.get("draft_text")?.toString() ?? ""
  });
  revalidatePath(`/citizen/complaints/${draftId}`);
}

export async function exportDraftPdf(draftId: string) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  await exportComplaintPdf(token, draftId);
  revalidatePath(`/citizen/complaints/${draftId}`);
}

export async function saveDraftToCase(draftId: string) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  await saveComplaintToCase(token, draftId);
  revalidatePath(`/citizen/complaints/${draftId}`);
}
