import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const rawToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!rawToken) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const result = await getSessionUser(rawToken);

    if (!result.user) {
      return NextResponse.json(
        {
          user: null,
          code: result.error,
          message: result.message || "Session invalid or expired",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({ user: result.user });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve session" },
      { status: 500 }
    );
  }
}
