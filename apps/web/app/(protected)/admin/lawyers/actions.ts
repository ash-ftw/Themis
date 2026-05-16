"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { approveLawyer, rejectLawyer } from "@/lib/api";

export async function approveLawyerVerification(lawyerId: string, formData: FormData) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  await approveLawyer(token, lawyerId, { notes: valueOf(formData, "notes") });
  revalidatePath("/admin/lawyers");
}

export async function rejectLawyerVerification(lawyerId: string, formData: FormData) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  await rejectLawyer(token, lawyerId, { notes: valueOf(formData, "notes") });
  revalidatePath("/admin/lawyers");
}

function valueOf(formData: FormData, key: string) {
  const value = formData.get(key)?.toString().trim();
  return value || undefined;
}
