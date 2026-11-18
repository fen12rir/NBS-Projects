import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE_NAME = "nbs_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Protected paths requiring an active session cookie
  const protectedPrefixes = [
    "/dashboard",
    "/simulator",
    "/modules",
    "/results",
    "/certificate",
    "/admin",
  ];

  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user visits /login or /signup while already having a session, allow or let them log in
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/simulator/:path*",
    "/modules/:path*",
    "/results/:path*",
    "/certificate/:path*",
    "/admin/:path*",
  ],
};
