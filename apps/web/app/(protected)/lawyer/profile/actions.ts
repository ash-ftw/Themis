"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { upsertLawyerProfile } from "@/lib/api";

export async function saveLawyerProfile(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("themis-session")?.value ?? "";
  const profile = await upsertLawyerProfile(token, {
    bar_number: valueOf(formData, "bar_number"),
    state_bar_council: valueOf(formData, "state_bar_council"),
    district: valueOf(formData, "district"),
    specializations: listOf(formData, "specializations"),
    languages: listOf(formData, "languages"),
    is_pro_bono: formData.get("is_pro_bono") === "true",
    availability: {
      notes: valueOf(formData, "availability")
    },
    max_active_cases: Number(valueOf(formData, "max_active_cases") ?? "3")
  });

  cookieStore.set("themis-verification", profile.verification_status, {
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax"
  });
  revalidatePath("/lawyer/profile");
  revalidatePath("/lawyer/verification-pending");
}

function valueOf(formData: FormData, key: string) {
  const value = formData.get(key)?.toString().trim();
  return value || undefined;
}

function listOf(formData: FormData, key: string) {
  return (
    valueOf(formData, key)
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean) ?? []
  );
}
