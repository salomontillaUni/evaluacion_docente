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

export function middleware(request: NextRequest) {
  const roleCookie = request.cookies.get("role")?.value;
  const role = isValidRole(roleCookie) ? roleCookie : undefined;
  const pathname = request.nextUrl.pathname;

  if (pathname === "/") {
    if (role) {
      return NextResponse.redirect(new URL(rolePathMap[role], request.url));
    }
    return NextResponse.next();
  }

  if (!protectedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (!role) {
    return NextResponse.redirect(new URL("/", request.url));
  }

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

export const config = {
  matcher: ["/", "/views/:path*"],
};
