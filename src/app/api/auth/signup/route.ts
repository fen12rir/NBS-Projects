import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { normalizePhilippineMobile, validatePassword } from "@/lib/auth/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fullName = (body.fullName || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const rawContact = (body.contactNo || "").trim();
    const branchCode = (body.branchCode || "").trim();
    const password = body.password || "";
    const confirmPassword = body.confirmPassword || "";

    // Validation
    if (!fullName || fullName.length < 2 || fullName.length > 100) {
      return NextResponse.json(
        { error: "Full Name must be between 2 and 100 characters." },
        { status: 400 }
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const contactNo = normalizePhilippineMobile(rawContact);
    if (!contactNo) {
      return NextResponse.json(
        { error: "Invalid mobile number. Please enter a Philippine mobile number (e.g. 09171234567 or +639171234567)." },
        { status: 400 }
      );
    }

    if (!branchCode) {
      return NextResponse.json(
        { error: "Please select your assigned NBS branch." },
        { status: 400 }
      );
    }

    // Verify branch exists and is active
    const branchRows = await query<any[]>(
      "SELECT code, name FROM branches WHERE code = ? AND is_active = 1",
      [branchCode]
    );
    if (!branchRows || branchRows.length === 0) {
      return NextResponse.json(
        { error: "Selected branch is invalid or inactive." },
        { status: 400 }
      );
    }
    const branch = branchRows[0];

    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      return NextResponse.json({ error: passCheck.reason }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    // Check if email already registered
    const existing = await query<any[]>(
      "SELECT id, email, status FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existing && existing.length > 0) {
      const user = existing[0];
      if (user.status === "pending") {
        return NextResponse.json(
          { error: "An account with this email is already registered and awaiting administrator approval." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "An account with this email address already exists. Please log in instead." },
        { status: 409 }
      );
    }

    const userId = "usr-" + crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user with pending status
    await query(
      `INSERT INTO users (id, full_name, email, contact_no, branch_code, password_hash, role, status)
       VALUES (?, ?, ?, ?, ?, ?, 'trainee', 'pending')`,
      [userId, fullName, email, contactNo, branchCode, passwordHash]
    );

    // Initialize progress record
    await query(
      `INSERT INTO user_progress (user_id, completed_lessons, completed_modules)
       VALUES (?, '[]', '[]')
       ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)`,
      [userId]
    );

    // Log registration in audit log
    await query(
      `INSERT INTO audit_log (actor_id, action, target_user_id, details)
       VALUES (?, 'trainee_signup', ?, ?)`,
      [
        userId,
        userId,
        JSON.stringify({
          fullName,
          email,
          contactNo,
          branchCode,
          branchName: branch.name,
        }),
      ]
    );

    return NextResponse.json({
      success: true,
      message: `Registration submitted successfully for ${fullName}. Your account is pending approval from your branch administrator at ${branch.name}.`,
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to complete registration." },
      { status: 500 }
    );
  }
}
