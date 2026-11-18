import { NextResponse } from "next/server";
import { getSessionUser } from "./session";
import { AuthSessionUser } from "./types";

export interface AdminAuthCheck {
  authorized: boolean;
  user?: AuthSessionUser;
  errorResponse?: NextResponse;
}

export async function requireAdmin(
  options: { requireSuperAdmin?: boolean } = {}
): Promise<AdminAuthCheck> {
  const result = await getSessionUser();

  if (!result.user) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: "Authentication required to access administrative resources." },
        { status: 401 }
      ),
    };
  }

  const { role, status } = result.user;

  if (status !== "active") {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: "Your account is not active." },
        { status: 403 }
      ),
    };
  }

  if (options.requireSuperAdmin && role !== "super_admin") {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: "Access denied. Super Administrator privileges required." },
        { status: 403 }
      ),
    };
  }

  if (role !== "branch_admin" && role !== "super_admin") {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, user: result.user };
}
