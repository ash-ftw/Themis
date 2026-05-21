"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { reactivateAdminUser, suspendAdminUser } from "@/lib/api";

export async function suspendUserAction(userId: string, formData: FormData) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const reason = String(formData.get("reason") ?? "").trim();
  await suspendAdminUser(token, userId, { reason: reason || null });
  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");
}

export async function reactivateUserAction(userId: string, formData: FormData) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const reason = String(formData.get("reason") ?? "").trim();
  await reactivateAdminUser(token, userId, { reason: reason || null });
  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");
}
