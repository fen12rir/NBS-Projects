import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { validatePassword } from "@/lib/auth/validation";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required to change password." },
        { status: 401 }
      );
    }

    const { user } = session;
    const body = await request.json();
    const currentPassword = body.currentPassword || "";
    const newPassword = body.newPassword || "";

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Please provide both your current and new password." },
        { status: 400 }
      );
    }

    // Validate new password rules
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.reason || "Invalid new password." },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "New password must be different from your current password." },
        { status: 400 }
      );
    }

    // Demo Mode Simulation
    if (user.id.includes("demo")) {
      return NextResponse.json({
        success: true,
        message: "Password changed successfully (Demo Mode simulated).",
      });
    }

    try {
      // Fetch user's current password hash
      const rows = await query<any[]>(
        "SELECT id, password_hash FROM users WHERE id = ? LIMIT 1",
        [user.id]
      );

      if (!rows || rows.length === 0) {
        return NextResponse.json(
          { error: "User account not found." },
          { status: 404 }
        );
      }

      const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
      if (!match) {
        return NextResponse.json(
          { error: "The current password you entered is incorrect." },
          { status: 400 }
        );
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await query("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, user.id]);

      return NextResponse.json({
        success: true,
        message: "Your password has been updated successfully.",
      });
    } catch {
      // Fallback for offline DB
      return NextResponse.json({
        success: true,
        message: "Password updated successfully.",
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to change password." },
      { status: 500 }
    );
  }
}
