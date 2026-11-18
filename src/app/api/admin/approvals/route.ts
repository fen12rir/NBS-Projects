import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin-guard";

// GET /api/admin/approvals - List pending trainee sign-ups
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.errorResponse!;

  const admin = auth.user!;
  const isSuper = admin.role === "super_admin";

  try {
    const branchFilterSql = isSuper ? "" : " AND u.branch_code = ?";
    const branchFilterParams = isSuper ? [] : [admin.branchCode];

    const rows = await query<any[]>(
      `SELECT u.id, u.full_name, u.email, u.contact_no, u.branch_code, u.status, u.created_at,
              b.name AS branch_name, b.region AS branch_region
       FROM users u
       JOIN branches b ON u.branch_code = b.code
       WHERE u.role = 'trainee' AND u.status = 'pending' ${branchFilterSql}
       ORDER BY u.created_at ASC`,
      branchFilterParams
    );

    // Fetch default access days setting
    const [settingRow] = await query<any[]>(
      "SELECT setting_value FROM app_settings WHERE setting_key = 'default_access_days' LIMIT 1"
    );
    const defaultDays = Number(settingRow?.setting_value) || 30;

    return NextResponse.json({
      defaultDays,
      pending: (rows || []).map((r) => ({
        id: r.id,
        fullName: r.full_name,
        email: r.email,
        contactNo: r.contact_no,
        branchCode: r.branch_code,
        branchName: r.branch_name,
        branchRegion: r.branch_region,
        status: r.status,
        createdAt: r.created_at,
      })),
    });
  } catch (error: any) {
    console.error("Fetch approvals error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch pending approvals" },
      { status: 500 }
    );
  }
}

// POST /api/admin/approvals - Approve or Reject a trainee
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.errorResponse!;

  const admin = auth.user!;
  const isSuper = admin.role === "super_admin";

  try {
    const body = await request.json();
    const { userId, action, days, rejectionReason } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: "Missing required parameters (userId, action)." },
        { status: 400 }
      );
    }

    // Verify trainee exists and check branch permissions
    const userRows = await query<any[]>(
      "SELECT id, full_name, email, branch_code, status FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (!userRows || userRows.length === 0) {
      return NextResponse.json({ error: "Trainee not found." }, { status: 404 });
    }

    const trainee = userRows[0];

    // Branch admin permission check
    if (!isSuper && trainee.branch_code !== admin.branchCode) {
      return NextResponse.json(
        { error: "Unauthorized. You may only review trainees assigned to your branch." },
        { status: 403 }
      );
    }

    if (action === "approve") {
      const accessDays = typeof days === "number" && days > 0 ? days : 30;
      const isUnlimited = days === 0 || days === null;

      let updateSql = `
        UPDATE users 
        SET status = 'active', 
            rejection_reason = NULL,
            access_expires_at = ${isUnlimited ? "NULL" : `DATE_ADD(NOW(), INTERVAL ? DAY)`}
        WHERE id = ?
      `;
      const updateParams = isUnlimited ? [userId] : [accessDays, userId];

      await query(updateSql, updateParams);

      // Audit log
      await query(
        `INSERT INTO audit_log (actor_id, action, target_user_id, details)
         VALUES (?, 'trainee_approved', ?, ?)`,
        [
          admin.id,
          userId,
          JSON.stringify({
            adminName: admin.fullName,
            adminEmail: admin.email,
            adminBranch: admin.branchCode,
            accessDays: isUnlimited ? "Unlimited" : accessDays,
          }),
        ]
      );

      return NextResponse.json({
        success: true,
        message: `Account approved for ${trainee.full_name}. Status is now active with ${isUnlimited ? "unlimited" : accessDays + " days"} access.`,
      });
    }

    if (action === "reject") {
      const reason = (rejectionReason || "").trim() || "Registration declined by administrator.";

      await query(
        "UPDATE users SET status = 'rejected', rejection_reason = ? WHERE id = ?",
        [reason, userId]
      );

      // Audit log
      await query(
        `INSERT INTO audit_log (actor_id, action, target_user_id, details)
         VALUES (?, 'trainee_rejected', ?, ?)`,
        [
          admin.id,
          userId,
          JSON.stringify({
            adminName: admin.fullName,
            adminEmail: admin.email,
            reason,
          }),
        ]
      );

      return NextResponse.json({
        success: true,
        message: `Account registration rejected for ${trainee.full_name}.`,
      });
    }

    return NextResponse.json({ error: "Invalid action specified." }, { status: 400 });
  } catch (error: any) {
    console.error("Process approval error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process approval action" },
      { status: 500 }
    );
  }
}
