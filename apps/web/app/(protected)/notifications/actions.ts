"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { markAllNotificationsRead, markNotificationRead } from "@/lib/api";

export async function readNotification(notificationId: string) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  await markNotificationRead(token, notificationId);
  revalidatePath("/notifications");
}

export async function readAllNotifications() {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  await markAllNotificationsRead(token);
  revalidatePath("/notifications");
}
