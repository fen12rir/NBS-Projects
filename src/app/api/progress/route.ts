import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/progress?userId=xyz
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "demo-cashier-001";

    const rows = await query<any[]>(
      "SELECT completed_lessons, completed_modules, last_active_lesson_id, last_active_module_id, certification_completed_at FROM user_progress WHERE user_id = ?",
      [userId]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        completedLessons: [],
        completedModules: [],
        scenarioAttempts: [],
      });
    }

    const record = rows[0];

    // Fetch attempts
    const attempts = await query<any[]>(
      "SELECT id, scenario_id, scenario_title, timestamp, score, passed, steps_completed, total_steps, hints_used, time_spent_seconds, mistakes FROM scenario_attempts WHERE user_id = ? ORDER BY timestamp DESC",
      [userId]
    );

    return NextResponse.json({
      completedLessons: JSON.parse(record.completed_lessons || "[]"),
      completedModules: JSON.parse(record.completed_modules || "[]"),
      lastActiveLessonId: record.last_active_lesson_id,
      lastActiveModuleId: record.last_active_module_id,
      certificationCompletedAt: record.certification_completed_at,
      scenarioAttempts: attempts.map((a) => ({
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
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch progress from database" },
      { status: 500 }
    );
  }
}

// POST /api/progress
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId || "demo-cashier-001";
    const completedLessons = JSON.stringify(body.completedLessons || []);
    const completedModules = JSON.stringify(body.completedModules || []);
    const lastActiveLessonId = body.lastActiveLessonId || null;
    const lastActiveModuleId = body.lastActiveModuleId || null;
    const certDate = body.certificationCompletedAt || null;

    // Upsert into user_progress
    await query(
      `INSERT INTO user_progress (user_id, completed_lessons, completed_modules, last_active_lesson_id, last_active_module_id, certification_completed_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         completed_lessons = VALUES(completed_lessons),
         completed_modules = VALUES(completed_modules),
         last_active_lesson_id = VALUES(last_active_lesson_id),
         last_active_module_id = VALUES(last_active_module_id),
         certification_completed_at = VALUES(certification_completed_at)`,
      [userId, completedLessons, completedModules, lastActiveLessonId, lastActiveModuleId, certDate]
    );

    // If there is a new scenario attempt to record
    if (body.newAttempt) {
      const a = body.newAttempt;
      await query(
        `INSERT INTO scenario_attempts (id, user_id, scenario_id, scenario_title, score, passed, steps_completed, total_steps, hints_used, time_spent_seconds, mistakes, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE score = VALUES(score)`,
        [
          a.id,
          userId,
          a.scenarioId,
          a.scenarioTitle,
          a.score,
          a.passed ? 1 : 0,
          a.stepsCompleted,
          a.totalSteps,
          a.hintsUsed || 0,
          a.timeSpentSeconds || 0,
          JSON.stringify(a.mistakes || []),
          a.timestamp || new Date(),
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
