import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { MOCK_BRANCHES } from "@/lib/auth/demo-admin-data";

export async function GET() {
  try {
    const rows = await query<any[]>(
      "SELECT code, name, region, is_active FROM branches WHERE is_active = 1 ORDER BY code ASC"
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        branches: MOCK_BRANCHES.map((b) => ({ ...b, isActive: true })),
      });
    }

    return NextResponse.json({
      branches: (rows || []).map((b) => ({
        code: b.code,
        name: b.name,
        region: b.region,
        isActive: Boolean(b.is_active),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({
      branches: MOCK_BRANCHES.map((b) => ({ ...b, isActive: true })),
    });
  }
}
