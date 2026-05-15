import { NextRequest, NextResponse } from "next/server";

import { syncProfile } from "@/lib/api";
import { isAppRole, roleHome } from "@/lib/auth";

const maxAge = 60 * 60 * 8;

export async function GET(request: NextRequest) {
  const requestedRole = request.nextUrl.searchParams.get("role") ?? undefined;
  const role = isAppRole(requestedRole) ? requestedRole : "citizen";
  const authToken = `dev-${role}`;

  await syncProfile(authToken, {}).catch(() => null);

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
    response.cookies.set("themis-verification", "pending", {
      maxAge,
      path: "/",
      sameSite: "lax"
    });
  } else {
    response.cookies.delete("themis-verification");
  }

  return response;
}
