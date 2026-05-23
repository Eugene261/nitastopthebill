import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionValue,
} from "@/lib/adminSession";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    if (process.env.NODE_ENV === "production") {
      return new Response("ADMIN_PASSWORD is not configured.", { status: 503 });
    }
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isValid = await verifyAdminSessionValue(sessionCookie);

  if (isValid) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: "/admin/:path*",
};
