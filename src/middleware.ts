import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE_NAME = "nbs_session";
export const DEMO_COOKIE_NAME = "nbs_demo_mode";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const demoCookie = request.cookies.get(DEMO_COOKIE_NAME)?.value;

  const hasAccess = Boolean(sessionCookie || demoCookie);

  // Protected paths requiring an active session or demo mode
  const protectedPrefixes = [
    "/dashboard",
    "/simulator",
    "/modules",
    "/results",
    "/certificate",
    "/admin",
  ];

  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !hasAccess) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

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
