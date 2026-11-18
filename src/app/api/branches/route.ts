import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query<any[]>(
      "SELECT code, name, region, is_active FROM branches WHERE is_active = 1 ORDER BY code ASC"
    );

    return NextResponse.json({
      branches: (rows || []).map((b) => ({
        code: b.code,
        name: b.name,
        region: b.region,
        isActive: Boolean(b.is_active),
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load branches" },
      { status: 500 }
    );
  }
}
