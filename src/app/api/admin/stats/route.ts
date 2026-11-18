import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin-guard";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.errorResponse!;

  const admin = auth.user!;
  const isSuper = admin.role === "super_admin";

  try {
    const branchFilterSql = isSuper ? "" : " AND u.branch_code = ?";
    const branchFilterParams = isSuper ? [] : [admin.branchCode];

    // Trainee Counts by Status
    const countsQuery = `
      SELECT 
        COUNT(*) AS total_trainees,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_count,
        SUM(CASE WHEN status = 'deactivated' THEN 1 ELSE 0 END) AS deactivated_count
      FROM users u
      WHERE role = 'trainee' ${branchFilterSql}
    `;
    const countRows = await query<any[]>(countsQuery, branchFilterParams);
    const counts = countRows[0] || {
      total_trainees: 0,
      pending_count: 0,
      active_count: 0,
      deactivated_count: 0,
    };

    // Certified Trainees Count
    const certQuery = `
      SELECT COUNT(DISTINCT up.user_id) AS certified_count
      FROM user_progress up
      JOIN users u ON up.user_id = u.id
      WHERE u.role = 'trainee' AND up.certification_completed_at IS NOT NULL ${branchFilterSql}
    `;
    const certRows = await query<any[]>(certQuery, branchFilterParams);
    const certifiedCount = certRows[0]?.certified_count || 0;

    // Exam Pass Rate
    const examQuery = `
      SELECT 
        COUNT(*) AS total_attempts,
        SUM(CASE WHEN sa.passed = 1 THEN 1 ELSE 0 END) AS passed_attempts
      FROM scenario_attempts sa
      JOIN users u ON sa.user_id = u.id
      WHERE u.role = 'trainee' AND sa.scenario_id = 'exam-practical' ${branchFilterSql}
    `;
    const examRows = await query<any[]>(examQuery, branchFilterParams);
    const totalAttempts = examRows[0]?.total_attempts || 0;
    const passedAttempts = examRows[0]?.passed_attempts || 0;
    const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

    // Branch Breakdown
    const branchBreakdownQuery = `
      SELECT 
        b.code,
        b.name,
        b.region,
        COUNT(u.id) AS total_users,
        SUM(CASE WHEN u.status = 'active' THEN 1 ELSE 0 END) AS active_users,
        SUM(CASE WHEN u.status = 'pending' THEN 1 ELSE 0 END) AS pending_users,
        SUM(CASE WHEN up.certification_completed_at IS NOT NULL THEN 1 ELSE 0 END) AS certified_users
      FROM branches b
      LEFT JOIN users u ON b.code = u.branch_code AND u.role = 'trainee'
      LEFT JOIN user_progress up ON u.id = up.user_id
      ${isSuper ? "" : "WHERE b.code = ?"}
      GROUP BY b.code, b.name, b.region
      ORDER BY b.code ASC
    `;
    const branchRows = await query<any[]>(
      branchBreakdownQuery,
      isSuper ? [] : [admin.branchCode]
    );

    // Recent attempts activity
    const recentActivityQuery = `
      SELECT 
        sa.id,
        sa.user_id,
        u.full_name,
        u.branch_code,
        b.name AS branch_name,
        sa.scenario_title,
        sa.score,
        sa.passed,
        sa.timestamp
      FROM scenario_attempts sa
      JOIN users u ON sa.user_id = u.id
      JOIN branches b ON u.branch_code = b.code
      WHERE 1=1 ${branchFilterSql}
      ORDER BY sa.timestamp DESC
      LIMIT 10
    `;
    const recentAttempts = await query<any[]>(recentActivityQuery, branchFilterParams);

    return NextResponse.json({
      admin: {
        id: admin.id,
        fullName: admin.fullName,
        role: admin.role,
        branchCode: admin.branchCode,
        branchName: admin.branchName,
      },
      stats: {
        totalTrainees: Number(counts.total_trainees) || 0,
        pendingApprovals: Number(counts.pending_count) || 0,
        activeTrainees: Number(counts.active_count) || 0,
        deactivatedTrainees: Number(counts.deactivated_count) || 0,
        certifiedTrainees: Number(certifiedCount) || 0,
        examAttempts: Number(totalAttempts) || 0,
        examPassRate: passRate,
      },
      branches: branchRows.map((b) => ({
        code: b.code,
        name: b.name,
        region: b.region,
        totalUsers: Number(b.total_users) || 0,
        activeUsers: Number(b.active_users) || 0,
        pendingUsers: Number(b.pending_users) || 0,
        certifiedUsers: Number(b.certified_users) || 0,
      })),
      recentActivity: recentAttempts.map((a) => ({
        id: a.id,
        userId: a.user_id,
        fullName: a.full_name,
        branchCode: a.branch_code,
        branchName: a.branch_name,
        scenarioTitle: a.scenario_title,
        score: a.score,
        passed: Boolean(a.passed),
        timestamp: a.timestamp,
      })),
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load admin stats" },
      { status: 500 }
    );
  }
}
