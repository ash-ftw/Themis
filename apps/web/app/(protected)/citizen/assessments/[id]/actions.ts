"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { generateComplaint, saveAssessmentToCase } from "@/lib/api";

export async function generateComplaintFromAssessment(assessmentId: string, formData: FormData) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const draft = await generateComplaint(token, {
    assessment_id: assessmentId,
    structured_fields: {
      complainant_name: valueOf(formData, "complainant_name"),
      address: valueOf(formData, "address"),
      phone: valueOf(formData, "phone"),
      authority_name: valueOf(formData, "authority_name"),
      accused_details: valueOf(formData, "accused_details"),
      witnesses: valueOf(formData, "witnesses"),
      requested_action: valueOf(formData, "requested_action")
    }
  });

  redirect(`/citizen/complaints/${draft.id}`);
}

export async function saveAssessmentCase(assessmentId: string, formData: FormData) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  await saveAssessmentToCase(token, assessmentId, {
    title: valueOf(formData, "title"),
    description: valueOf(formData, "description"),
    urgency: valueOf(formData, "urgency") || "medium"
  });
  revalidatePath(`/citizen/assessments/${assessmentId}`);
}

function valueOf(formData: FormData, key: string) {
  const value = formData.get(key)?.toString().trim();
  return value || undefined;
}
