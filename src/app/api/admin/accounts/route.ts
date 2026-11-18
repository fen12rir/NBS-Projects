import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { normalizePhilippineMobile, validatePassword } from "@/lib/auth/validation";
import { MOCK_ADMIN_ACCOUNTS } from "@/lib/auth/demo-admin-data";

// GET /api/admin/accounts - List administrative accounts (Super Admin only)
export async function GET(request: NextRequest) {
  const auth = await requireAdmin({ requireSuperAdmin: true });
  if (!auth.authorized) return auth.errorResponse!;

  const admin = auth.user!;
  if (admin.id.startsWith("demo-")) {
    return NextResponse.json({ accounts: MOCK_ADMIN_ACCOUNTS });
  }

  try {
    const rows = await query<any[]>(
      `SELECT u.id, u.full_name, u.email, u.contact_no, u.branch_code, u.role, u.status,
              u.last_login_at, u.created_at, b.name AS branch_name
       FROM users u
       LEFT JOIN branches b ON u.branch_code = b.code
       WHERE u.role IN ('branch_admin', 'super_admin')
       ORDER BY u.role DESC, u.created_at DESC`
    );

    return NextResponse.json({
      accounts: (rows || []).map((r) => ({
        id: r.id,
        fullName: r.full_name,
        email: r.email,
        contactNo: r.contact_no,
        branchCode: r.branch_code,
        branchName: r.branch_name,
        role: r.role,
        status: r.status,
        lastLoginAt: r.last_login_at,
        createdAt: r.created_at,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ accounts: MOCK_ADMIN_ACCOUNTS });
  }
}

// POST /api/admin/accounts - Create a new admin account (Super Admin only)
export async function POST(request: NextRequest) {
  const auth = await requireAdmin({ requireSuperAdmin: true });
  if (!auth.authorized) return auth.errorResponse!;

  const superAdmin = auth.user!;

  try {
    const body = await request.json();
    const fullName = (body.fullName || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const rawContact = (body.contactNo || "").trim();
    const branchCode = (body.branchCode || "2438").trim();
    const role = body.role === "super_admin" ? "super_admin" : "branch_admin";
    const password = body.password || "";

    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ error: "Please enter a valid administrator name." }, { status: 400 });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const contactNo = normalizePhilippineMobile(rawContact) || "+639170000000";

    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      return NextResponse.json({ error: passCheck.reason }, { status: 400 });
    }

    if (superAdmin.id.startsWith("demo-")) {
      return NextResponse.json({
        success: true,
        message: `Administrator account for ${fullName} (${role}) created successfully (Demo Mode).`,
      });
    }

    const existing = await query<any[]>("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    const userId = "adm-" + crypto.randomUUID().slice(0, 8);
    const passwordHash = await bcrypt.hash(password, 10);

    await query(
      `INSERT INTO users (id, full_name, email, contact_no, branch_code, password_hash, role, status, access_expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NULL)`,
      [userId, fullName, email, contactNo, branchCode, passwordHash, role]
    );

    await query(
      `INSERT INTO audit_log (actor_id, action, target_user_id, details)
       VALUES (?, 'admin_account_created', ?, ?)`,
      [
        superAdmin.id,
        userId,
        JSON.stringify({
          createdByName: superAdmin.fullName,
          adminEmail: email,
          role,
          branchCode,
        }),
      ]
    );

    return NextResponse.json({
      success: true,
      message: `Administrator account for ${fullName} (${role}) created successfully.`,
    });
  } catch (error: any) {
    if (superAdmin.id.startsWith("demo-")) {
      return NextResponse.json({
        success: true,
        message: "Administrator account created successfully (Demo Mode).",
      });
    }
    return NextResponse.json(
      { error: error?.message || "Failed to create administrator account." },
      { status: 500 }
    );
  }
}
