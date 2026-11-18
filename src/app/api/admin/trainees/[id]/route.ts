import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { destroyAllUserSessions } from "@/lib/auth/session";

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

  try {
    const userRows = await query<any[]>(
      `SELECT u.id, u.full_name, u.email, u.contact_no, u.branch_code, u.role, u.status,
              u.rejection_reason, u.employee_id, u.access_expires_at, u.suspended_from,
              u.suspended_until, u.disabled_reason, u.failed_login_count, u.locked_until,
              u.last_login_at, u.created_at, b.name AS branch_name, b.region AS branch_region
       FROM users u
       JOIN branches b ON u.branch_code = b.code
       WHERE u.id = ?
       LIMIT 1`,
      [traineeId]
    );

    if (!userRows || userRows.length === 0) {
      return NextResponse.json({ error: "Trainee not found" }, { status: 404 });
    }

    const trainee = userRows[0];

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
    console.error("Fetch trainee detail error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch trainee details" },
      { status: 500 }
    );
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

    // Check trainee existence & branch
    const userRows = await query<any[]>(
      "SELECT id, full_name, branch_code, status FROM users WHERE id = ? LIMIT 1",
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

    // 1. Status Update (Activate / Deactivate)
    if (action === "update_status") {
      if (!["active", "deactivated"].includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      await query(
        "UPDATE users SET status = ?, disabled_reason = ? WHERE id = ?",
        [status, status === "deactivated" ? disabledReason || "Deactivated by admin" : null, traineeId]
      );

      // If deactivated, evict sessions immediately
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
          // If already has expiry in the future, extend from current expiry; otherwise extend from NOW()
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

    // 4. Force Logout (Evict active sessions)
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
    console.error("Update trainee error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update trainee." },
      { status: 500 }
    );
  }
}
