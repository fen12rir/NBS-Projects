import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionUser, SESSION_COOKIE_NAME } from "@/lib/auth/session";

function toMysqlDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  const parsed = new Date(String(val));
  return isNaN(parsed.getTime()) ? null : parsed;
}

// Progress API Route (GET)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await getSessionUser(rawToken);
    const userId = session.user?.id || searchParams.get("userId") || "demo-cashier-001";

    const rows = await query<any[]>(
      "SELECT completed_lessons, completed_modules, last_active_lesson_id, last_active_module_id, certification_completed_at, certificate_id FROM user_progress WHERE user_id = ?",
      [userId]
    );

    const record = rows && rows.length > 0 ? rows[0] : null;

    // Scenario Attempts Query
    const attempts = await query<any[]>(
      "SELECT id, scenario_id, scenario_title, timestamp, score, passed, steps_completed, total_steps, hints_used, time_spent_seconds, mistakes, case_results FROM scenario_attempts WHERE user_id = ? ORDER BY timestamp DESC",
      [userId]
    );

    return NextResponse.json({
      completedLessons: record ? JSON.parse(record.completed_lessons || "[]") : [],
      completedModules: record ? JSON.parse(record.completed_modules || "[]") : [],
      lastActiveLessonId: record?.last_active_lesson_id || null,
      lastActiveModuleId: record?.last_active_module_id || null,
      certificationCompletedAt: record?.certification_completed_at || null,
      certificateId: record?.certificate_id || null,
      scenarioAttempts: (attempts || []).map((a) => ({
        id: a.id,
        scenarioId: a.scenario_id,
        scenarioTitle: a.scenario_title,
        timestamp: a.timestamp,
        score: a.score,
        passed: Boolean(a.passed),
        stepsCompleted: a.steps_completed,
        totalSteps: a.total_steps,
        hintsUsed: a.hints_used,
        timeSpentSeconds: a.time_spent_seconds,
        mistakes: JSON.parse(a.mistakes || "[]"),
        caseResults: a.case_results ? JSON.parse(a.case_results) : null,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch progress from database" },
      { status: 500 }
    );
  }
}

// Progress API Route (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await getSessionUser(rawToken);
    const userId = session.user?.id || body.userId || "demo-cashier-001";

    const completedLessons = JSON.stringify(body.completedLessons || []);
    const completedModules = JSON.stringify(body.completedModules || []);
    const lastActiveLessonId = body.lastActiveLessonId || null;
    const lastActiveModuleId = body.lastActiveModuleId || null;
    const certDate = toMysqlDate(body.certificationCompletedAt);
    const certificateId = body.certificateId || null;

    // User Progress Upsert
    await query(
      `INSERT INTO user_progress (user_id, completed_lessons, completed_modules, last_active_lesson_id, last_active_module_id, certification_completed_at, certificate_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         completed_lessons = VALUES(completed_lessons),
         completed_modules = VALUES(completed_modules),
         last_active_lesson_id = VALUES(last_active_lesson_id),
         last_active_module_id = VALUES(last_active_module_id),
         certification_completed_at = COALESCE(VALUES(certification_completed_at), certification_completed_at),
         certificate_id = COALESCE(VALUES(certificate_id), certificate_id)`,
      [
        userId,
        completedLessons,
        completedModules,
        lastActiveLessonId,
        lastActiveModuleId,
        certDate,
        certificateId,
      ]
    );

    // Normalized Lesson Completions
    if (Array.isArray(body.completedLessons)) {
      for (const item of body.completedLessons) {
        const lessonId = typeof item === "string" ? item : item?.lessonId;
        if (lessonId) {
          const parts = lessonId.replace("les-", "").split("-");
          const modNum = parts[0] || "1";
          const moduleId = `mod-${modNum}`;
          await query(
            `INSERT IGNORE INTO lesson_completions (user_id, lesson_id, module_id, completed_at)
             VALUES (?, ?, ?, NOW())`,
            [userId, lessonId, moduleId]
          );
        }
      }
    }

    // Scenario Attempts Upsert
    const attemptsToSave: any[] = [];
    if (body.newAttempt && typeof body.newAttempt === "object") {
      attemptsToSave.push(body.newAttempt);
    }
    if (Array.isArray(body.scenarioAttempts)) {
      for (const att of body.scenarioAttempts) {
        if (att && att.id && !attemptsToSave.some((existing) => existing.id === att.id)) {
          attemptsToSave.push(att);
        }
      }
    }

    for (const a of attemptsToSave) {
      if (!a?.id || !a?.scenarioId) continue;
      const attemptDate = toMysqlDate(a.timestamp) || new Date();
      await query(
        `INSERT INTO scenario_attempts (id, user_id, scenario_id, scenario_title, score, passed, steps_completed, total_steps, hints_used, time_spent_seconds, mistakes, case_results, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           score = VALUES(score),
           passed = VALUES(passed),
           steps_completed = VALUES(steps_completed),
           total_steps = VALUES(total_steps),
           hints_used = VALUES(hints_used),
           time_spent_seconds = VALUES(time_spent_seconds),
           mistakes = VALUES(mistakes),
           case_results = VALUES(case_results)`,
        [
          String(a.id),
          userId,
          String(a.scenarioId),
          String(a.scenarioTitle || a.scenarioId),
          Number(a.score) || 0,
          a.passed ? 1 : 0,
          Number(a.stepsCompleted) || 0,
          Number(a.totalSteps) || 0,
          Number(a.hintsUsed) || 0,
          Number(a.timeSpentSeconds) || 0,
          JSON.stringify(a.mistakes || []),
          a.caseResults ? JSON.stringify(a.caseResults) : null,
          attemptDate,
        ]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to save progress to database" },
      { status: 500 }
    );
  }
}
