"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { createLawSection, updateLawSection } from "@/lib/api";

export async function saveLawSectionAction(formData: FormData) {
  const token = (await cookies()).get("themis-session")?.value;
  if (!token) {
    throw new Error("Missing local auth session.");
  }

  const sectionId = valueOf(formData, "sectionId");
  const payload = {
    act_name: requiredValue(formData, "actName"),
    section_number: requiredValue(formData, "sectionNumber"),
    title: requiredValue(formData, "title"),
    original_text: nullableValue(formData, "originalText"),
    plain_language: requiredValue(formData, "plainLanguage"),
    example_scenarios: listValue(formData, "exampleScenarios"),
    punishment: nullableValue(formData, "punishment"),
    is_bailable: booleanValue(formData, "isBailable"),
    is_cognizable: booleanValue(formData, "isCognizable"),
    ipc_mapping: nullableValue(formData, "ipcMapping"),
    related_sections: listValue(formData, "relatedSections"),
    category_tags: listValue(formData, "categoryTags"),
    jurisdiction_notes: nullableValue(formData, "jurisdictionNotes"),
    source_reference: nullableValue(formData, "sourceReference"),
    review_status: requiredValue(formData, "reviewStatus")
  };

  if (sectionId) {
    await updateLawSection(token, sectionId, payload);
  } else {
    await createLawSection(token, payload);
  }

  revalidatePath("/admin/laws");
  revalidatePath("/citizen/laws");
}

function requiredValue(formData: FormData, key: string) {
  const value = valueOf(formData, key);
  if (!value) {
    throw new Error(`${key} is required.`);
  }

  return value;
}

function nullableValue(formData: FormData, key: string) {
  return valueOf(formData, key) || null;
}

function listValue(formData: FormData, key: string) {
  return (valueOf(formData, key) || "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function booleanValue(formData: FormData, key: string) {
  const value = valueOf(formData, key);
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }

  return null;
}

function valueOf(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
