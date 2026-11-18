import { NextRequest, NextResponse } from "next/server";
import { destroySession, SESSION_COOKIE_NAME, isCookieSecure } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const rawToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (rawToken) {
      await destroySession(rawToken);
    }

    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: isCookieSecure(),
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to log out" },
      { status: 500 }
    );
  }
}
