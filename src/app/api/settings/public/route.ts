import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin-guard";

// Global in-memory fallback for Demo Mode
const globalForSettings = globalThis as unknown as { demoAccessEnabled?: boolean };

export async function isDemoAccessEnabled(): Promise<boolean> {
  try {
    const rows = await query<any[]>(
      "SELECT setting_value FROM app_settings WHERE setting_key = 'demo_access_enabled' LIMIT 1"
    );
    if (rows && rows.length > 0) {
      return rows[0].setting_value !== "false";
    }
    return true;
  } catch {
    return globalForSettings.demoAccessEnabled !== undefined
      ? globalForSettings.demoAccessEnabled
      : true;
  }
}

// GET /api/settings/public - Publicly readable portal settings (e.g. demo_access_enabled)
export async function GET() {
  const demoAccessEnabled = await isDemoAccessEnabled();
  return NextResponse.json({ demoAccessEnabled });
}

// PATCH /api/settings/public - Update portal settings (Super Admin only)
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin({ requireSuperAdmin: true });
  if (!auth.authorized) return auth.errorResponse!;

  const superAdmin = auth.user!;

  try {
    const body = await request.json();
    const demoAccessEnabled = Boolean(body.demoAccessEnabled);
    globalForSettings.demoAccessEnabled = demoAccessEnabled;

    if (!superAdmin.id.startsWith("demo-")) {
      try {
        await query(
          `INSERT INTO app_settings (setting_key, setting_value)
           VALUES ('demo_access_enabled', ?)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [String(demoAccessEnabled)]
        );

        await query(
          `INSERT INTO audit_log (actor_id, action, details)
           VALUES (?, 'demo_access_toggled', ?)`,
          [
            superAdmin.id,
            JSON.stringify({
              adminName: superAdmin.fullName,
              demoAccessEnabled,
            }),
          ]
        );
      } catch {
        // Fallback if DB is unreachable
      }
    }

    return NextResponse.json({
      success: true,
      demoAccessEnabled,
      message: demoAccessEnabled
        ? "Instant Demo Access is now visible on Login and Landing pages."
        : "Instant Demo Access is now hidden from Login and Landing pages.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update setting." },
      { status: 500 }
    );
  }
}
