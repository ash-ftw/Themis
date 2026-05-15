"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { bookmarkLawSection } from "@/lib/api";

export async function bookmarkLawSectionAction(formData: FormData) {
  const token = (await cookies()).get("themis-session")?.value;
  const sectionId = formData.get("sectionId");

  if (!token || typeof sectionId !== "string" || !sectionId) {
    throw new Error("Unable to bookmark this law section.");
  }

  await bookmarkLawSection(token, sectionId);
  revalidatePath(`/citizen/laws/${sectionId}`);
}
