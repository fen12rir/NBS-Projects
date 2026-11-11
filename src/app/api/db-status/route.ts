import { NextResponse } from "next/server";
import { testDbConnection } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await testDbConnection();
  return NextResponse.json({
    database: "MariaDB",
    ...result,
  });
}
