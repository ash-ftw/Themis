"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { generateComplaint } from "@/lib/api";

export async function createManualComplaint(formData: FormData) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const draft = await generateComplaint(token, {
    structured_fields: {
      complainant_name: valueOf(formData, "complainant_name"),
      address: valueOf(formData, "address"),
      phone: valueOf(formData, "phone"),
      email: valueOf(formData, "email"),
      authority_name: valueOf(formData, "authority_name"),
      incident_date_time: valueOf(formData, "incident_date_time"),
      incident_location: valueOf(formData, "incident_location"),
      accused_details: valueOf(formData, "accused_details"),
      incident_description: valueOf(formData, "incident_description"),
      witnesses: valueOf(formData, "witnesses"),
      requested_action: valueOf(formData, "requested_action"),
      place: valueOf(formData, "place"),
      evidence: listOf(formData, "evidence"),
      possible_sections: listOf(formData, "possible_sections")
    }
  });

  redirect(`/citizen/complaints/${draft.id}`);
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
