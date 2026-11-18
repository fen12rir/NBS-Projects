import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { MOCK_TRAINEES } from "@/lib/auth/demo-admin-data";

const TOTAL_LESSONS_COUNT = 19;

function formatTraineesCsv(trainees: any[]) {
  const headers = [
    "Full Name",
    "Email",
    "Contact No",
    "Branch Code",
    "Branch Name",
    "Status",
    "Completed Lessons",
    "Progress %",
    "Exam Passed",
    "Exam Score",
    "Certified",
    "Access Expiry",
    "Last Login",
    "Registered At",
  ];

  const csvRows = [headers.join(",")];

  for (const t of trainees) {
    const values = [
      `"${(t.fullName || "").replace(/"/g, '""')}"`,
      `"${t.email}"`,
      `"${t.contactNo}"`,
      `"${t.branchCode}"`,
      `"${(t.branchName || "").replace(/"/g, '""')}"`,
      t.status,
      `${t.completedLessonsCount}/${t.totalLessonsCount}`,
      `${t.progressPercent}%`,
      t.examPassed ? "YES" : "NO",
      t.examScore !== null && t.examScore !== undefined ? t.examScore : "N/A",
      t.isCertified ? "YES" : "NO",
      t.accessExpiresAt ? new Date(t.accessExpiresAt).toISOString().split("T")[0] : "None",
      t.lastLoginAt ? new Date(t.lastLoginAt).toISOString().split("T")[0] : "Never",
      new Date(t.createdAt).toISOString().split("T")[0],
    ];
    csvRows.push(values.join(","));
  }

  const csvContent = csvRows.join("\r\n");
  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nbs-trainees-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

function filterMockTrainees(admin: any, search: string, branch: string | null, status: string | null) {
  let list = [...MOCK_TRAINEES];

  if (admin.role !== "super_admin") {
    list = list.filter((t) => t.branchCode === admin.branchCode);
  } else if (branch && branch !== "all") {
    list = list.filter((t) => t.branchCode === branch);
  }

  if (status && status !== "all") {
    if (status === "expired") {
      list = list.filter((t) => t.isExpired);
    } else if (status === "expiring_soon") {
      list = list.filter((t) => t.isExpiringSoon);
    } else {
      list = list.filter((t) => t.status === status);
    }
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (t) =>
        t.fullName.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.contactNo.includes(q)
    );
  }

  return list;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.errorResponse!;

  const admin = auth.user!;
  const isSuper = admin.role === "super_admin";

  const { searchParams } = new URL(request.url);
  const search = (searchParams.get("search") || "").trim();
  const branch = searchParams.get("branch");
  const status = searchParams.get("status");
  const isCsvExport = searchParams.get("export") === "csv";

  if (admin.id.startsWith("demo-")) {
    const filtered = filterMockTrainees(admin, search, branch, status);
    if (isCsvExport) {
      return formatTraineesCsv(filtered);
    }
    return NextResponse.json({ totalCount: filtered.length, trainees: filtered });
  }

  try {
    const conditions: string[] = ["u.role = 'trainee'"];
    const params: any[] = [];

    // Branch scoping
    if (!isSuper) {
      conditions.push("u.branch_code = ?");
      params.push(admin.branchCode);
    } else if (branch && branch !== "all") {
      conditions.push("u.branch_code = ?");
      params.push(branch);
    }

    // Status filtering
    if (status && status !== "all") {
      if (status === "expired") {
        conditions.push("u.access_expires_at IS NOT NULL AND u.access_expires_at < NOW()");
      } else if (status === "expiring_soon") {
        conditions.push("u.access_expires_at IS NOT NULL AND u.access_expires_at >= NOW() AND u.access_expires_at <= DATE_ADD(NOW(), INTERVAL 7 DAY)");
      } else {
        conditions.push("u.status = ?");
        params.push(status);
      }
    }

    // Search query
    if (search) {
      conditions.push("(u.full_name LIKE ? OR u.email LIKE ? OR u.contact_no LIKE ?)");
      const searchWildcard = `%${search}%`;
      params.push(searchWildcard, searchWildcard, searchWildcard);
    }

    const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    const traineesQuery = `
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.contact_no,
        u.branch_code,
        b.name AS branch_name,
        b.region AS branch_region,
        u.status,
        u.employee_id,
        u.access_expires_at,
        u.last_login_at,
        u.created_at,
        up.certification_completed_at,
        up.certificate_id,
        up.completed_lessons,
        (SELECT COUNT(*) FROM lesson_completions lc WHERE lc.user_id = u.id) AS completions_count,
        (SELECT MAX(sa.score) FROM scenario_attempts sa WHERE sa.user_id = u.id AND sa.scenario_id = 'exam-practical') AS exam_score,
        (SELECT MAX(sa.passed) FROM scenario_attempts sa WHERE sa.user_id = u.id AND sa.scenario_id = 'exam-practical') AS exam_passed
      FROM users u
      JOIN branches b ON u.branch_code = b.code
      LEFT JOIN user_progress up ON u.id = up.user_id
      ${whereClause}
      ORDER BY u.created_at DESC
    `;

    const rows = await query<any[]>(traineesQuery, params);

    const now = new Date();

    const trainees = (rows || []).map((r) => {
      let completedLessonsCount = Number(r.completions_count) || 0;
      if (completedLessonsCount === 0 && r.completed_lessons) {
        try {
          const parsed = JSON.parse(r.completed_lessons);
          if (Array.isArray(parsed)) completedLessonsCount = parsed.length;
        } catch {}
      }

      const progressPercent = Math.min(
        100,
        Math.round((completedLessonsCount / TOTAL_LESSONS_COUNT) * 100)
      );

      const isExpired = r.access_expires_at && new Date(r.access_expires_at) < now;
      const isExpiringSoon =
        r.access_expires_at &&
        new Date(r.access_expires_at) >= now &&
        new Date(r.access_expires_at).getTime() - now.getTime() <= 7 * 86400000;

      return {
        id: r.id,
        fullName: r.full_name,
        email: r.email,
        contactNo: r.contact_no,
        branchCode: r.branch_code,
        branchName: r.branch_name,
        branchRegion: r.branch_region,
        status: r.status,
        employeeId: r.employee_id,
        accessExpiresAt: r.access_expires_at,
        isExpired: Boolean(isExpired),
        isExpiringSoon: Boolean(isExpiringSoon),
        lastLoginAt: r.last_login_at,
        createdAt: r.created_at,
        completedLessonsCount,
        totalLessonsCount: TOTAL_LESSONS_COUNT,
        progressPercent,
        isCertified: Boolean(r.certification_completed_at),
        certificateId: r.certificate_id,
        examScore: r.exam_score !== null ? Number(r.exam_score) : null,
        examPassed: Boolean(r.exam_passed),
      };
    });

    if (isCsvExport) {
      return formatTraineesCsv(trainees);
    }

    return NextResponse.json({
      totalCount: trainees.length,
      trainees,
    });
  } catch (error: any) {
    const filtered = filterMockTrainees(admin, search, branch, status);
    if (isCsvExport) {
      return formatTraineesCsv(filtered);
    }
    return NextResponse.json({ totalCount: filtered.length, trainees: filtered });
  }
}
