import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { isAppRole, roleHome } from "@/lib/auth";

export default async function Home() {
  const cookieStore = await cookies();
  const role = cookieStore.get("themis-role")?.value;

  if (isAppRole(role)) {
    redirect(roleHome[role]);
  }

  redirect("/login");
}
