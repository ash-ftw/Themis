import { NextRequest, NextResponse } from "next/server";

import { isAppRole, roleHome } from "@/lib/auth";
import type { AppRole } from "@/lib/auth";

const publicPrefixes = ["/login", "/auth/callback"];
const protectedRolePrefixes: Record<AppRole, string> = {
  citizen: "/citizen",
  lawyer: "/lawyer",
  admin: "/admin"
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const session = request.cookies.get("themis-session")?.value;
  const roleCookie = request.cookies.get("themis-role")?.value;
  const role = isAppRole(roleCookie) ? roleCookie : undefined;

  if (!session || role === undefined) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const requestedRole = roleForPath(pathname);
  if (requestedRole !== undefined && requestedRole !== role) {
    return NextResponse.redirect(new URL(roleHome[role], request.url));
  }

  const verification = request.cookies.get("themis-verification")?.value;
  const lawyerAllowedWhilePending =
    pathname.startsWith("/lawyer/profile") || pathname.startsWith("/lawyer/verification-pending");

  if (role === "lawyer" && verification === "pending" && !lawyerAllowedWhilePending) {
    return NextResponse.redirect(new URL("/lawyer/verification-pending", request.url));
  }

  return NextResponse.next();
}

function roleForPath(pathname: string): AppRole | undefined {
  return (Object.keys(protectedRolePrefixes) as AppRole[]).find((role) =>
    pathname.startsWith(protectedRolePrefixes[role])
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
