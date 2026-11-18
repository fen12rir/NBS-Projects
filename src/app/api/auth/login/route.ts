import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import {
  createSession,
  SESSION_COOKIE_NAME,
  getSessionTtlSeconds,
  isCookieSecure,
} from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Please enter your email and password." },
        { status: 400 }
      );
    }

    const now = new Date();

    // Query user
    const rows = await query<any[]>(
      `SELECT u.id, u.full_name, u.email, u.contact_no, u.branch_code, u.password_hash,
              u.role, u.status, u.rejection_reason, u.employee_id, u.access_expires_at,
              u.suspended_from, u.suspended_until, u.disabled_reason, u.failed_login_count,
              u.locked_until, b.name AS branch_name, b.region AS branch_region
       FROM users u
       LEFT JOIN branches b ON u.branch_code = b.code
       WHERE u.email = ?
       LIMIT 1`,
      [email]
    );

    if (!rows || rows.length === 0) {
      // Constant-time dummy compare to prevent timing side-channels
      await bcrypt.compare(
        password,
        "$2a$10$e8wB69dPn/3t.1L.U7Ffke0t0pDfxjT5p0K0Q6y3U9jM6i7G3QJ5S"
      );
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const user = rows[0];

    // Check account lockout
    if (user.locked_until && new Date(user.locked_until) > now) {
      const waitMinutes = Math.ceil(
        (new Date(user.locked_until).getTime() - now.getTime()) / 60000
      );
      return NextResponse.json(
        {
          error: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${waitMinutes} minute${waitMinutes === 1 ? "" : "s"}, or contact your administrator.`,
        },
        { status: 423 }
      );
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      const newFailedCount = (user.failed_login_count || 0) + 1;
      let lockSql = "UPDATE users SET failed_login_count = ? WHERE id = ?";
      const lockParams: any[] = [newFailedCount, user.id];

      if (newFailedCount >= 5) {
        lockSql =
          "UPDATE users SET failed_login_count = ?, locked_until = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = ?";
      }

      await query(lockSql, lockParams);

      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Password is valid - reset lock and failed count
    await query(
      "UPDATE users SET failed_login_count = 0, locked_until = NULL, last_login_at = NOW() WHERE id = ?",
      [user.id]
    );

    // Verify status
    if (user.status === "pending") {
      return NextResponse.json(
        {
          code: "PENDING",
          error:
            "Your account registration is awaiting approval from your branch administrator.",
        },
        { status: 403 }
      );
    }

    if (user.status === "rejected") {
      return NextResponse.json(
        {
          code: "REJECTED",
          error: user.rejection_reason
            ? `Your account was declined: ${user.rejection_reason}`
            : "Your account registration was declined. Please contact your branch supervisor.",
        },
        { status: 403 }
      );
    }

    if (user.status === "deactivated") {
      return NextResponse.json(
        {
          code: "DEACTIVATED",
          error: user.disabled_reason
            ? `Your account is deactivated: ${user.disabled_reason}`
            : "Your account has been deactivated. Please contact your administrator.",
        },
        { status: 403 }
      );
    }

    // Verify access expiry
    if (user.access_expires_at && new Date(user.access_expires_at) < now) {
      return NextResponse.json(
        {
          code: "ACCESS_EXPIRED",
          error:
            "Your training access period has ended. Please contact your branch administrator to extend your access.",
        },
        { status: 403 }
      );
    }

    // Verify temporary suspension
    if (user.suspended_from && user.suspended_until) {
      const from = new Date(user.suspended_from);
      const until = new Date(user.suspended_until);
      if (now >= from && now <= until) {
        return NextResponse.json(
          {
            code: "SUSPENDED",
            error: `Your account is temporarily suspended until ${until.toLocaleDateString()}.`,
          },
          { status: 403 }
        );
      }
    }

    // Create session in database
    const userAgent = request.headers.get("user-agent");
    const { rawToken } = await createSession(user.id, userAgent);

    // Prepare response with httpOnly cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        contactNo: user.contact_no,
        branchCode: user.branch_code,
        branchName: user.branch_name,
        role: user.role,
        status: user.status,
        accessExpiresAt: user.access_expires_at,
      },
    });

    const ttlSeconds = getSessionTtlSeconds();
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: rawToken,
      httpOnly: true,
      sameSite: "lax",
      secure: isCookieSecure(),
      path: "/",
      maxAge: ttlSeconds,
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
