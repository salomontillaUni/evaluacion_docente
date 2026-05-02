import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rolePathMap = {
  admin: "/views/admin",
  docente: "/views/docente",
  estudiante: "/views/estudiante",
} as const;

type UserRole = keyof typeof rolePathMap;

const protectedPaths = ["/views/admin", "/views/docente", "/views/estudiante"];

function isValidRole(role: string | undefined): role is UserRole {
  return role === "admin" || role === "docente" || role === "estudiante";
}

/**
 * Next.js 16 Proxy Function
 * Replaces the traditional middleware for enhanced request handling and proxying.
 */
export function proxy(request: NextRequest) {
  const roleCookie = request.cookies.get("role")?.value;
  const role = isValidRole(roleCookie) ? roleCookie : undefined;
  const pathname = request.nextUrl.pathname;

  // Root path handling: Use rewrite to "proxy" the user's dashboard content
  // without changing the URL in the address bar.
  if (pathname === "/") {
    if (role) {
      return NextResponse.rewrite(new URL(rolePathMap[role], request.url));
    }
    return NextResponse.next();
  }

  // Check if the current path is a protected view
  if (!protectedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Redirect to home if no role is found for protected paths
  if (!role) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Cross-role protection: Redirect to their own dashboard if they try to access another role's view
  if (pathname.startsWith("/views/admin") && role !== "admin") {
    return NextResponse.redirect(new URL(rolePathMap[role], request.url));
  }

  if (pathname.startsWith("/views/docente") && role !== "docente") {
    return NextResponse.redirect(new URL(rolePathMap[role], request.url));
  }

  if (pathname.startsWith("/views/estudiante") && role !== "estudiante") {
    return NextResponse.redirect(new URL(rolePathMap[role], request.url));
  }

  return NextResponse.next();
}

/**
 * Proxy configuration
 */
export const config = {
  matcher: ["/", "/views/:path*"],
};
