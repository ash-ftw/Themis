import { NextRequest, NextResponse } from "next/server";

import { syncProfile } from "@/lib/api";
import { isAppRole, roleHome } from "@/lib/auth";

const maxAge = 60 * 60 * 8;

export async function GET(request: NextRequest) {
  const requestedRole = request.nextUrl.searchParams.get("role") ?? undefined;
  const role = isAppRole(requestedRole) ? requestedRole : "citizen";
  const authToken = `dev-${role}`;

  const syncedProfile = await syncProfile(authToken, {}).catch(() => null);

  if (!syncedProfile?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "auth-sync");
    loginUrl.searchParams.set("role", role);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.redirect(new URL(roleHome[role], request.url));

  response.cookies.set("themis-session", authToken, {
    maxAge,
    path: "/",
    sameSite: "lax"
  });
  response.cookies.set("themis-role", role, {
    maxAge,
    path: "/",
    sameSite: "lax"
  });

  if (role === "lawyer") {
    const verificationStatus =
      syncedProfile?.user?.lawyer_profile?.verification_status ??
      (syncedProfile?.user?.is_verified ? "approved" : "pending");
    response.cookies.set("themis-verification", verificationStatus, {
      maxAge,
      path: "/",
      sameSite: "lax"
    });
  } else {
    response.cookies.delete("themis-verification");
  }

  return response;
}
