import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { MOCK_PENDING_TRAINEES } from "@/lib/auth/demo-admin-data";

// GET /api/admin/approvals - List pending trainee sign-ups
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.errorResponse!;

  const admin = auth.user!;
  const isSuper = admin.role === "super_admin";

  if (admin.id.startsWith("demo-")) {
    const list = isSuper
      ? MOCK_PENDING_TRAINEES
      : MOCK_PENDING_TRAINEES.filter((t) => t.branchCode === admin.branchCode);
    return NextResponse.json({ defaultDays: 30, pending: list });
  }

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
    let defaultDays = 30;
    try {
      const [settingRow] = await query<any[]>(
        "SELECT setting_value FROM app_settings WHERE setting_key = 'default_access_days' LIMIT 1"
      );
      if (settingRow) defaultDays = Number(settingRow.setting_value) || 30;
    } catch {}

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
    // If DB is offline, provide mock pending trainees
    const list = isSuper
      ? MOCK_PENDING_TRAINEES
      : MOCK_PENDING_TRAINEES.filter((t) => t.branchCode === admin.branchCode);
    return NextResponse.json({ defaultDays: 30, pending: list });
  }
}

// POST /api/admin/approvals - Approve or Reject one or multiple trainees
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.errorResponse!;

  const admin = auth.user!;
  const isSuper = admin.role === "super_admin";

  try {
    const body = await request.json();
    const { userId, userIds, action, days, rejectionReason } = body;

    const targetIds: string[] = Array.isArray(userIds)
      ? userIds.filter((id: any) => typeof id === "string" && id.trim().length > 0)
      : userId
      ? [userId]
      : [];

    if (targetIds.length === 0 || !action) {
      return NextResponse.json(
        { error: "Missing required parameters (userId/userIds, action)." },
        { status: 400 }
      );
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Invalid action specified." }, { status: 400 });
    }

    const isBulk = targetIds.length > 1;
    const accessDays = typeof days === "number" && days > 0 ? days : 30;
    const isUnlimited = days === 0 || days === null;

    if (admin.id.startsWith("demo-")) {
      return NextResponse.json({
        success: true,
        processedCount: targetIds.length,
        message:
          action === "approve"
            ? isBulk
              ? `${targetIds.length} accounts approved (Demo Mode) with ${isUnlimited ? "unlimited" : accessDays + " days"} access.`
              : `Account approved (Demo Mode). Status is now active with ${isUnlimited ? "unlimited" : accessDays + " days"} access.`
            : isBulk
            ? `${targetIds.length} trainee registrations declined (Demo Mode).`
            : "Account registration declined (Demo Mode).",
      });
    }

    // Verify all target trainees exist and check branch permissions
    const placeholders = targetIds.map(() => "?").join(", ");
    const userRows = await query<any[]>(
      `SELECT id, full_name, email, branch_code, status FROM users WHERE id IN (${placeholders})`,
      targetIds
    );

    if (!userRows || userRows.length === 0) {
      return NextResponse.json({ error: "No matching trainees found." }, { status: 404 });
    }

    // Branch admin permission check
    if (!isSuper) {
      const unauthorized = userRows.find((t) => t.branch_code !== admin.branchCode);
      if (unauthorized) {
        return NextResponse.json(
          { error: "Unauthorized. You may only review trainees assigned to your branch." },
          { status: 403 }
        );
      }
    }

    if (action === "approve") {
      for (const trainee of userRows) {
        const updateSql = `
          UPDATE users 
          SET status = 'active', 
              rejection_reason = NULL,
              access_expires_at = ${isUnlimited ? "NULL" : `DATE_ADD(NOW(), INTERVAL ? DAY)`}
          WHERE id = ?
        `;
        const updateParams = isUnlimited ? [trainee.id] : [accessDays, trainee.id];
        await query(updateSql, updateParams);

        await query(
          `INSERT INTO audit_log (actor_id, action, target_user_id, details)
           VALUES (?, 'trainee_approved', ?, ?)`,
          [
            admin.id,
            trainee.id,
            JSON.stringify({
              adminName: admin.fullName,
              adminEmail: admin.email,
              adminBranch: admin.branchCode,
              accessDays: isUnlimited ? "Unlimited" : accessDays,
              bulkAction: isBulk,
            }),
          ]
        );
      }

      return NextResponse.json({
        success: true,
        processedCount: userRows.length,
        message: isBulk
          ? `Approved ${userRows.length} trainee accounts with ${isUnlimited ? "unlimited" : accessDays + " days"} access.`
          : `Account approved for ${userRows[0].full_name}. Status is now active with ${isUnlimited ? "unlimited" : accessDays + " days"} access.`,
      });
    }

    // action === "reject"
    const reason = (rejectionReason || "").trim() || "Registration declined by administrator.";

    for (const trainee of userRows) {
      await query(
        "UPDATE users SET status = 'rejected', rejection_reason = ? WHERE id = ?",
        [reason, trainee.id]
      );

      await query(
        `INSERT INTO audit_log (actor_id, action, target_user_id, details)
         VALUES (?, 'trainee_rejected', ?, ?)`,
        [
          admin.id,
          trainee.id,
          JSON.stringify({
            adminName: admin.fullName,
            adminEmail: admin.email,
            reason,
            bulkAction: isBulk,
          }),
        ]
      );
    }

    return NextResponse.json({
      success: true,
      processedCount: userRows.length,
      message: isBulk
        ? `Declined ${userRows.length} trainee registrations.`
        : `Account registration rejected for ${userRows[0].full_name}.`,
    });
  } catch (error: any) {
    if (admin.id.startsWith("demo-")) {
      return NextResponse.json({
        success: true,
        message: "Action processed successfully (Demo Mode).",
      });
    }
    return NextResponse.json(
      { error: error?.message || "Failed to process approval action" },
      { status: 500 }
    );
  }
}
