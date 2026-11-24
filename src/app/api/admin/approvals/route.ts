import { NextRequest, NextResponse } from "next/server";
import { query, ensurePosCredentialColumns, generatePosCredentials } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { MOCK_PENDING_TRAINEES } from "@/lib/auth/demo-admin-data";
import {
  isEmailConfigured,
  sendAccountApprovalEmail,
  sendPosCredentialsEmail,
  sendAccountRejectionEmail,
} from "@/lib/email";

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
    await ensurePosCredentialColumns();
    const placeholders = targetIds.map(() => "?").join(", ");
    const userRows = await query<any[]>(
      `SELECT u.id, u.full_name, u.email, u.branch_code, u.status, u.pos_username, u.pos_password, b.name AS branch_name
       FROM users u
       LEFT JOIN branches b ON u.branch_code = b.code
       WHERE u.id IN (${placeholders})`,
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

    const emailConfigured = isEmailConfigured();

    if (action === "approve") {
      const approvedTraineesWithCreds: Array<{
        id: string;
        full_name: string;
        email: string;
        branch_code: string;
        branch_name?: string;
        posUsername: string;
        posPassword: string;
      }> = [];

      for (const trainee of userRows) {
        const creds = generatePosCredentials(trainee.branch_code);
        const posUsername = trainee.pos_username || creds.posUsername;
        const posPassword = trainee.pos_password || creds.posPassword;

        const updateSql = `
          UPDATE users 
          SET status = 'active', 
              rejection_reason = NULL,
              pos_username = ?,
              pos_password = ?,
              access_expires_at = ${isUnlimited ? "NULL" : `DATE_ADD(NOW(), INTERVAL ? DAY)`}
          WHERE id = ?
        `;
        const updateParams = isUnlimited
          ? [posUsername, posPassword, trainee.id]
          : [posUsername, posPassword, accessDays, trainee.id];
        await query(updateSql, updateParams);

        approvedTraineesWithCreds.push({
          ...trainee,
          posUsername,
          posPassword,
        });

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
              posUsername,
              bulkAction: isBulk,
            }),
          ]
        );
      }

      // Send both separate emails: (1) Account Approval Email and (2) POS Simulator Credentials Email
      const emailResults = await Promise.allSettled(
        approvedTraineesWithCreds.map(async (trainee) => {
          const approvalMail = await sendAccountApprovalEmail({
            to: trainee.email,
            fullName: trainee.full_name,
            branchName: trainee.branch_name
              ? `${trainee.branch_code} - ${trainee.branch_name}`
              : `Branch ${trainee.branch_code}`,
            accessDays,
            isUnlimited,
          });
          const posMail = await sendPosCredentialsEmail({
            to: trainee.email,
            fullName: trainee.full_name,
            branchCode: trainee.branch_code,
            branchName: trainee.branch_name,
            posUsername: trainee.posUsername,
            posPassword: trainee.posPassword,
          });
          return {
            sent: approvalMail.sent || posMail.sent,
            bothSent: approvalMail.sent && posMail.sent,
          };
        })
      );
      const emailsSent = emailResults.filter(
        (r) => r.status === "fulfilled" && r.value.sent
      ).length;

      const emailNote = emailConfigured
        ? emailsSent > 0
          ? ` Approval & POS credentials emails sent to ${emailsSent} trainee${emailsSent === 1 ? "" : "s"}.`
          : " (Email notifications could not be delivered — check SMTP settings.)"
        : "";

      return NextResponse.json({
        success: true,
        processedCount: userRows.length,
        emailsSent,
        emailConfigured,
        message:
          (isBulk
            ? `Approved ${userRows.length} trainee accounts with ${isUnlimited ? "unlimited" : accessDays + " days"} access.`
            : `Account approved for ${userRows[0].full_name}. Status is now active with ${isUnlimited ? "unlimited" : accessDays + " days"} access.`) +
          emailNote,
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

    // Send rejection emails (non-blocking if SMTP is not configured)
    const emailResults = await Promise.allSettled(
      userRows.map((trainee) =>
        sendAccountRejectionEmail({
          to: trainee.email,
          fullName: trainee.full_name,
          branchName: trainee.branch_name
            ? `${trainee.branch_code} - ${trainee.branch_name}`
            : `Branch ${trainee.branch_code}`,
          reason,
        })
      )
    );
    const emailsSent = emailResults.filter(
      (r) => r.status === "fulfilled" && r.value.sent
    ).length;

    const emailNote = emailConfigured
      ? emailsSent > 0
        ? ` Email notification sent to ${emailsSent} trainee${emailsSent === 1 ? "" : "s"}.`
        : " (Email notification could not be delivered — check SMTP settings.)"
      : "";

    return NextResponse.json({
      success: true,
      processedCount: userRows.length,
      emailsSent,
      emailConfigured,
      message:
        (isBulk
          ? `Declined ${userRows.length} trainee registrations.`
          : `Account registration rejected for ${userRows[0].full_name}.`) +
        emailNote,
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
