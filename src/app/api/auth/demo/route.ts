import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, DEMO_COOKIE_NAME, isCookieSecure } from "@/lib/auth/session";
import { DEMO_ADMIN_USER, DEMO_TRAINEE_USER } from "@/lib/auth/demo-user";
import { isDemoAccessEnabled } from "@/lib/auth/demo-access";

export async function POST(request: NextRequest) {
  try {
    const enabled = await isDemoAccessEnabled();
    if (!enabled) {
      return NextResponse.json(
        { error: "Instant Demo Access has been disabled by the System Administrator. Please sign in with your account." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const mode = body.mode === "admin" ? "admin" : "trainee";

    const user = mode === "admin" ? DEMO_ADMIN_USER : DEMO_TRAINEE_USER;
    const sessionToken = mode === "admin" ? "demo-admin-token" : "demo-trainee-token";

    const response = NextResponse.json({
      success: true,
      mode,
      user,
      message: `Entered demo mode as ${mode === "admin" ? "Super Administrator" : "Trainee Cashier"}`,
    });

    const secure = isCookieSecure();

    // Session Cookies
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
    });

    // Set demo mode cookie for middleware & client
    response.cookies.set({
      name: DEMO_COOKIE_NAME,
      value: mode,
      httpOnly: false,
      sameSite: "lax",
      secure,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to activate demo mode" },
      { status: 500 }
    );
  }
}
