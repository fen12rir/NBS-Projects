import { query } from "@/lib/db";

// Global in-memory fallback for Demo Mode
const globalForSettings = globalThis as unknown as { demoAccessEnabled?: boolean };

export function setInMemoryDemoAccessEnabled(enabled: boolean): void {
  globalForSettings.demoAccessEnabled = enabled;
}

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
