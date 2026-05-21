"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { generateRtiDraft } from "@/lib/api";

export async function createRtiDraft(formData: FormData) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const draft = await generateRtiDraft(token, {
    applicant_address: valueOf(formData, "applicant_address"),
    applicant_name: valueOf(formData, "applicant_name"),
    bpl_status: formData.get("bpl_status") === "on",
    department: valueOf(formData, "department"),
    information_requested: valueOf(formData, "information_requested"),
    preferred_response_format: valueOf(formData, "preferred_response_format"),
    public_authority: valueOf(formData, "public_authority"),
    time_period: valueOf(formData, "time_period")
  });
  redirect(`/citizen/rti/${draft.id}`);
}

function valueOf(formData: FormData, key: string) {
  const value = formData.get(key)?.toString().trim();
  return value || undefined;
}
