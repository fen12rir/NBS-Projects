import { NextRequest, NextResponse } from "next/server";
import { query, ensurePosCredentialColumns, generatePosCredentials } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { destroyAllUserSessions } from "@/lib/auth/session";
import { MOCK_TRAINEES } from "@/lib/auth/demo-admin-data";
import { TRAINING_MODULES } from "@/data/modules";
import { sendPosCredentialsEmail } from "@/lib/email";

function getMockDossier(traineeId: string) {
  const match = MOCK_TRAINEES.find((t) => t.id === traineeId) || MOCK_TRAINEES[0];

  const allLessonIds = TRAINING_MODULES.flatMap((m) => m.lessons.map((l) => l.id));
  const completedLessons = allLessonIds.slice(0, match.completedLessonsCount);

  const lessonCompletions = completedLessons.map((lId, idx) => {
    const parts = lId.replace("les-", "").split("-");
    const modId = `mod-${parts[0] || "1"}`;
    return {
      lessonId: lId,
      moduleId: modId,
      completedAt: new Date(Date.now() - (completedLessons.length - idx) * 86400000).toISOString(),
    };
  });

  const attempts = [
    {
      id: "att-demo-01",
      scenarioId: "exam-practical",
      scenarioTitle: "Comprehensive Practical Cashier Certification Exam",
      score: match.examScore || 96,
      passed: match.examPassed,
      stepsCompleted: 15,
      totalSteps: 15,
      hintsUsed: 0,
      timeSpentSeconds: 420,
      mistakes: [],
      caseResults: [
        { caseNumber: 1, title: "Standard Book & School Supplies Sale", score: 100, passed: true },
        { caseNumber: 2, title: "Senior Citizen Discount with Tender", score: 95, passed: true },
        { caseNumber: 3, title: "LNQR Sulit Coins & Physical Gift Card", score: 95, passed: true },
      ],
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "att-demo-02",
      scenarioId: "scen-les-8-3",
      scenarioTitle: "Lesson 8-3 Practice: LNQR Sulit Coins Redemption & NBS Gift Card",
      score: 100,
      passed: true,
      stepsCompleted: 19,
      totalSteps: 19,
      hintsUsed: 1,
      timeSpentSeconds: 245,
      mistakes: [],
      caseResults: null,
      timestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: "att-demo-03",
      scenarioId: "scen-les-7-3",
      scenarioTitle: "Lesson 7-3 Practice: eGC Reloading (Non-Sales Transaction)",
      score: 95,
      passed: true,
      stepsCompleted: 12,
      totalSteps: 12,
      hintsUsed: 0,
      timeSpentSeconds: 180,
      mistakes: [],
      caseResults: null,
      timestamp: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
  ];

  const auditLogs = [
    {
      id: 1,
      actorId: "demo-admin-001",
      actorName: "System Administrator",
      action: "trainee_approved",
      details: { accessDays: 30, branch: match.branchCode },
      createdAt: match.createdAt,
    },
    {
      id: 2,
      actorId: "demo-admin-001",
      actorName: "System Administrator",
      action: "access_expiry_extended",
      details: { daysAdded: 30 },
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ];

  return {
    trainee: {
      id: match.id,
      fullName: match.fullName,
      email: match.email,
      contactNo: match.contactNo,
      branchCode: match.branchCode,
      branchName: match.branchName,
      branchRegion: match.branchRegion,
      role: "trainee",
      status: match.status,
      rejectionReason: null,
      employeeId: match.employeeId,
      posUsername: "241209",
      posPassword: "241209",
      accessExpiresAt: match.accessExpiresAt,
      disabledReason: null,
      lastLoginAt: match.lastLoginAt,
      createdAt: match.createdAt,
    },
    progress: {
      completedLessons,
      completedModules: match.progressPercent === 100 ? TRAINING_MODULES.map((m) => m.id) : ["mod-1", "mod-2"],
      lastActiveLessonId: completedLessons[completedLessons.length - 1] || "les-1-1",
      lastActiveModuleId: "mod-1",
      certificationCompletedAt: match.isCertified ? new Date(Date.now() - 86400000 * 2).toISOString() : null,
      certificateId: match.certificateId,
    },
    lessonCompletions,
    attempts,
    auditLogs,
  };
}

// GET /api/admin/trainees/[id] - Fetch detailed trainee dossier
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.errorResponse!;

  const admin = auth.user!;
  const isSuper = admin.role === "super_admin";
  const traineeId = params.id;

  if (admin.id.startsWith("demo-") || traineeId.startsWith("demo-") || traineeId.startsWith("usr-demo-")) {
    return NextResponse.json(getMockDossier(traineeId));
  }

  try {
    await ensurePosCredentialColumns();
    const userRows = await query<any[]>(
      `SELECT u.id, u.full_name, u.email, u.contact_no, u.branch_code, u.role, u.status,
              u.rejection_reason, u.employee_id, u.pos_username, u.pos_password,
              u.access_expires_at, u.suspended_from,
              u.suspended_until, u.disabled_reason, u.failed_login_count, u.locked_until,
              u.last_login_at, u.created_at, b.name AS branch_name, b.region AS branch_region
       FROM users u
       JOIN branches b ON u.branch_code = b.code
       WHERE u.id = ?
       LIMIT 1`,
      [traineeId]
    );

    if (!userRows || userRows.length === 0) {
      return NextResponse.json(getMockDossier(traineeId));
    }

    const trainee = userRows[0];
    if (trainee.status === "active" && (!trainee.pos_username || !trainee.pos_password)) {
      const creds = generatePosCredentials(trainee.branch_code);
      trainee.pos_username = trainee.pos_username || creds.posUsername;
      trainee.pos_password = trainee.pos_password || creds.posPassword;
      try {
        await query(
          "UPDATE users SET pos_username = ?, pos_password = ? WHERE id = ?",
          [trainee.pos_username, trainee.pos_password, trainee.id]
        );
      } catch {}
    }

    // Check branch scoping
    if (!isSuper && trainee.branch_code !== admin.branchCode) {
      return NextResponse.json(
        { error: "Access denied. Trainee is assigned to a different branch." },
        { status: 403 }
      );
    }

    // Fetch progress
    const progressRows = await query<any[]>(
      `SELECT completed_lessons, completed_modules, last_active_lesson_id, last_active_module_id,
              certification_completed_at, certificate_id
       FROM user_progress
       WHERE user_id = ?
       LIMIT 1`,
      [traineeId]
    );
    const progress = progressRows[0] || {};

    // Fetch lesson completions
    const lessonRows = await query<any[]>(
      `SELECT lesson_id, module_id, completed_at
       FROM lesson_completions
       WHERE user_id = ?
       ORDER BY completed_at ASC`,
      [traineeId]
    );

    // Fetch scenario attempts
    const attemptRows = await query<any[]>(
      `SELECT id, scenario_id, scenario_title, score, passed, steps_completed,
              total_steps, hints_used, time_spent_seconds, mistakes, case_results, timestamp
       FROM scenario_attempts
       WHERE user_id = ?
       ORDER BY timestamp DESC`,
      [traineeId]
    );

    // Fetch audit log
    const auditRows = await query<any[]>(
      `SELECT a.id, a.actor_id, a.action, a.details, a.created_at, u.full_name AS actor_name
       FROM audit_log a
       LEFT JOIN users u ON a.actor_id = u.id
       WHERE a.target_user_id = ?
       ORDER BY a.created_at DESC
       LIMIT 20`,
      [traineeId]
    );

    return NextResponse.json({
      trainee: {
        id: trainee.id,
        fullName: trainee.full_name,
        email: trainee.email,
        contactNo: trainee.contact_no,
        branchCode: trainee.branch_code,
        branchName: trainee.branch_name,
        branchRegion: trainee.branch_region,
        role: trainee.role,
        status: trainee.status,
        rejectionReason: trainee.rejection_reason,
        employeeId: trainee.employee_id,
        posUsername: trainee.pos_username,
        posPassword: trainee.pos_password,
        accessExpiresAt: trainee.access_expires_at,
        disabledReason: trainee.disabled_reason,
        lockedUntil: trainee.locked_until,
        lastLoginAt: trainee.last_login_at,
        createdAt: trainee.created_at,
      },
      progress: {
        completedLessons: JSON.parse(progress.completed_lessons || "[]"),
        completedModules: JSON.parse(progress.completed_modules || "[]"),
        lastActiveLessonId: progress.last_active_lesson_id,
        lastActiveModuleId: progress.last_active_module_id,
        certificationCompletedAt: progress.certification_completed_at,
        certificateId: progress.certificate_id,
      },
      lessonCompletions: (lessonRows || []).map((l) => ({
        lessonId: l.lesson_id,
        moduleId: l.module_id,
        completedAt: l.completed_at,
      })),
      attempts: (attemptRows || []).map((a) => ({
        id: a.id,
        scenarioId: a.scenario_id,
        scenarioTitle: a.scenario_title,
        score: a.score,
        passed: Boolean(a.passed),
        stepsCompleted: a.steps_completed,
        totalSteps: a.total_steps,
        hintsUsed: a.hints_used,
        timeSpentSeconds: a.time_spent_seconds,
        mistakes: JSON.parse(a.mistakes || "[]"),
        caseResults: a.case_results ? JSON.parse(a.case_results) : null,
        timestamp: a.timestamp,
      })),
      auditLogs: (auditRows || []).map((log) => ({
        id: log.id,
        actorId: log.actor_id,
        actorName: log.actor_name || "System",
        action: log.action,
        details: log.details ? JSON.parse(log.details) : null,
        createdAt: log.created_at,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(getMockDossier(traineeId));
  }
}

// PATCH /api/admin/trainees/[id] - Update trainee status, expiry, or actions
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.errorResponse!;

  const admin = auth.user!;
  const isSuper = admin.role === "super_admin";
  const traineeId = params.id;

  try {
    const body = await request.json();
    const { action, status, accessExpiresAt, daysToAdd, disabledReason, employeeId } = body;

    if (admin.id.startsWith("demo-")) {
      return NextResponse.json({
        success: true,
        message: "Action processed successfully (Demo Mode).",
      });
    }

    // Check trainee existence & branch
    await ensurePosCredentialColumns();
    const userRows = await query<any[]>(
      `SELECT u.id, u.full_name, u.email, u.branch_code, u.status, u.pos_username, u.pos_password, b.name AS branch_name
       FROM users u
       LEFT JOIN branches b ON u.branch_code = b.code
       WHERE u.id = ? LIMIT 1`,
      [traineeId]
    );

    if (!userRows || userRows.length === 0) {
      return NextResponse.json({ error: "Trainee not found" }, { status: 404 });
    }

    const trainee = userRows[0];

    if (!isSuper && trainee.branch_code !== admin.branchCode) {
      return NextResponse.json(
        { error: "Access denied. Trainee is assigned to a different branch." },
        { status: 403 }
      );
    }

    if (action === "resend_pos_credentials") {
      const creds = generatePosCredentials(trainee.branch_code);
      const posUsername = trainee.pos_username || creds.posUsername;
      const posPassword = trainee.pos_password || creds.posPassword;
      await query(
        "UPDATE users SET pos_username = ?, pos_password = ? WHERE id = ?",
        [posUsername, posPassword, traineeId]
      );
      const mailRes = await sendPosCredentialsEmail({
        to: trainee.email,
        fullName: trainee.full_name,
        branchCode: trainee.branch_code,
        branchName: trainee.branch_name,
        posUsername,
        posPassword,
      });
      return NextResponse.json({
        success: true,
        message: mailRes.sent
          ? `POS Simulator credentials emailed to ${trainee.email}.`
          : `POS credentials ready (${posUsername} / ${posPassword}). Configure SMTP in .env.local to send email.`,
      });
    }

    // 1. Status Update (Activate / Deactivate)
    if (action === "update_status") {
      if (!["active", "deactivated"].includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      await query(
        "UPDATE users SET status = ?, disabled_reason = ? WHERE id = ?",
        [status, status === "deactivated" ? disabledReason || "Deactivated by admin" : null, traineeId]
      );

      if (status === "deactivated") {
        await destroyAllUserSessions(traineeId);
      }

      await query(
        `INSERT INTO audit_log (actor_id, action, target_user_id, details)
         VALUES (?, ?, ?, ?)`,
        [
          admin.id,
          status === "active" ? "trainee_activated" : "trainee_deactivated",
          traineeId,
          JSON.stringify({ adminName: admin.fullName, reason: disabledReason || null }),
        ]
      );

      return NextResponse.json({ success: true, message: `Account status updated to ${status}.` });
    }

    // 2. Access Expiry Update / Extension
    if (action === "update_expiry") {
      let newExpirySql = "access_expires_at = ?";
      let newExpiryParam: any = accessExpiresAt ? new Date(accessExpiresAt) : null;

      if (typeof daysToAdd === "number") {
        if (daysToAdd === 0) {
          newExpirySql = "access_expires_at = NULL";
          newExpiryParam = null;
        } else {
          newExpirySql = `
            access_expires_at = CASE 
              WHEN access_expires_at IS NOT NULL AND access_expires_at > NOW() 
              THEN DATE_ADD(access_expires_at, INTERVAL ? DAY)
              ELSE DATE_ADD(NOW(), INTERVAL ? DAY)
            END
          `;
          await query(
            `UPDATE users SET ${newExpirySql} WHERE id = ?`,
            [daysToAdd, daysToAdd, traineeId]
          );

          await query(
            `INSERT INTO audit_log (actor_id, action, target_user_id, details)
             VALUES (?, 'access_expiry_extended', ?, ?)`,
            [
              admin.id,
              traineeId,
              JSON.stringify({ adminName: admin.fullName, daysAdded: daysToAdd }),
            ]
          );

          return NextResponse.json({ success: true, message: `Access extended by ${daysToAdd} days.` });
        }
      }

      await query(
        `UPDATE users SET ${newExpirySql} WHERE id = ?`,
        newExpiryParam ? [newExpiryParam, traineeId] : [traineeId]
      );

      await query(
        `INSERT INTO audit_log (actor_id, action, target_user_id, details)
         VALUES (?, 'access_expiry_updated', ?, ?)`,
        [
          admin.id,
          traineeId,
          JSON.stringify({ adminName: admin.fullName, newExpiry: newExpiryParam }),
        ]
      );

      return NextResponse.json({ success: true, message: "Access expiry updated successfully." });
    }

    // 3. Reset Practical Exam Attempts
    if (action === "reset_exam_attempts") {
      await query(
        "DELETE FROM scenario_attempts WHERE user_id = ? AND scenario_id = 'exam-practical'",
        [traineeId]
      );

      await query(
        `INSERT INTO audit_log (actor_id, action, target_user_id, details)
         VALUES (?, 'exam_attempts_reset', ?, ?)`,
        [
          admin.id,
          traineeId,
          JSON.stringify({ adminName: admin.fullName }),
        ]
      );

      return NextResponse.json({
        success: true,
        message: "Practical Exam attempts reset successfully. Trainee can now retake the exam.",
      });
    }

    // 4. Force Logout
    if (action === "force_logout") {
      await destroyAllUserSessions(traineeId);

      await query(
        `INSERT INTO audit_log (actor_id, action, target_user_id, details)
         VALUES (?, 'user_force_logged_out', ?, ?)`,
        [
          admin.id,
          traineeId,
          JSON.stringify({ adminName: admin.fullName }),
        ]
      );

      return NextResponse.json({
        success: true,
        message: "Trainee sessions revoked. User will be logged out immediately on their next action.",
      });
    }

    // 5. Update Employee ID
    if (action === "update_employee_id") {
      await query("UPDATE users SET employee_id = ? WHERE id = ?", [employeeId || null, traineeId]);

      return NextResponse.json({ success: true, message: "Employee ID updated successfully." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    if (admin.id.startsWith("demo-")) {
      return NextResponse.json({ success: true, message: "Updated successfully (Demo Mode)." });
    }
    return NextResponse.json(
      { error: error?.message || "Failed to update trainee." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/trainees/[id] - Permanently delete trainee account (Super Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin({ requireSuperAdmin: true });
  if (!auth.authorized) return auth.errorResponse!;

  const superAdmin = auth.user!;
  const traineeId = params.id;

  try {
    if (superAdmin.id.startsWith("demo-")) {
      return NextResponse.json({
        success: true,
        message: "Trainee account permanently deleted (Demo Mode).",
      });
    }

    await destroyAllUserSessions(traineeId);
    await query("DELETE FROM users WHERE id = ? AND role = 'trainee'", [traineeId]);

    await query(
      `INSERT INTO audit_log (actor_id, action, target_user_id, details)
       VALUES (?, 'trainee_account_deleted', ?, ?)`,
      [
        superAdmin.id,
        traineeId,
        JSON.stringify({ deletedByName: superAdmin.fullName }),
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Trainee account permanently deleted.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete trainee account." },
      { status: 500 }
    );
  }
}
