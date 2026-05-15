"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createCase } from "@/lib/api";

export async function createCitizenCase(formData: FormData) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const createdCase = await createCase(token, {
    title: valueOf(formData, "title"),
    category: valueOf(formData, "category"),
    state: valueOf(formData, "state"),
    district: valueOf(formData, "district"),
    urgency: valueOf(formData, "urgency") || "medium",
    fir_number: valueOf(formData, "fir_number"),
    police_station: valueOf(formData, "police_station"),
    court_name: valueOf(formData, "court_name"),
    case_number: valueOf(formData, "case_number"),
    status: "draft",
    sections: listOf(formData, "sections"),
    description: valueOf(formData, "description"),
    metadata: {}
  });

  revalidatePath("/citizen/cases");
  redirect(`/citizen/cases/${createdCase.id}`);
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
