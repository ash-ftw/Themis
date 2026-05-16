"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { acceptLegalAidRequest, declineLegalAidRequest } from "@/lib/api";

export async function acceptRequest(requestId: string) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  await acceptLegalAidRequest(token, requestId);
  revalidatePath("/lawyer/requests");
  revalidatePath("/lawyer/cases");
}

export async function declineRequest(requestId: string) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  await declineLegalAidRequest(token, requestId);
  revalidatePath("/lawyer/requests");
}
