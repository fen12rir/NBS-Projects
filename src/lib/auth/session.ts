import crypto from "crypto";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { AuthSessionUser } from "./types";

export const SESSION_COOKIE_NAME = "nbs_session";

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getSessionTtlSeconds(): number {
  const days = Number(process.env.SESSION_TTL_DAYS) || 7;
  return days * 24 * 60 * 60;
}

export function isCookieSecure(): boolean {
  const conf = process.env.COOKIE_SECURE?.toLowerCase();
  if (conf === "true") return true;
  if (conf === "false") return false;
  return process.env.NODE_ENV === "production";
}

export async function createSession(
  userId: string,
  userAgent?: string | null
): Promise<{ rawToken: string; expiresAt: Date }> {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const ttlSeconds = getSessionTtlSeconds();
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  // If single session setting is enabled, purge prior sessions for this user
  try {
    const [setting] = await query<any[]>(
      "SELECT setting_value FROM app_settings WHERE setting_key = 'single_session_enabled' LIMIT 1"
    );
    if (setting && setting.setting_value === "true") {
      await query("DELETE FROM sessions WHERE user_id = ?", [userId]);
    }
  } catch {
    // Non-fatal if setting table check fails
  }

  await query(
    `INSERT INTO sessions (token_hash, user_id, expires_at, user_agent)
     VALUES (?, ?, ?, ?)`,
    [tokenHash, userId, expiresAt, userAgent?.slice(0, 255) || null]
  );

  return { rawToken, expiresAt };
}

export async function destroySession(rawToken: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  await query("DELETE FROM sessions WHERE token_hash = ?", [tokenHash]);
}

export async function destroyAllUserSessions(userId: string): Promise<void> {
  await query("DELETE FROM sessions WHERE user_id = ?", [userId]);
}

export interface SessionVerificationResult {
  user: AuthSessionUser | null;
  error?: "NO_SESSION" | "EXPIRED" | "PENDING" | "REJECTED" | "DEACTIVATED" | "ACCESS_EXPIRED" | "LOCKED" | "SUSPENDED" | "NOT_FOUND";
  message?: string;
}

export async function getSessionUser(rawToken?: string): Promise<SessionVerificationResult> {
  let token = rawToken;
  if (!token) {
    try {
      const cookieStore = cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch {
      // In non-request context (e.g. testing)
    }
  }

  if (!token) {
    return { user: null, error: "NO_SESSION" };
  }

  const tokenHash = hashToken(token);
  const now = new Date();

  try {
    const rows = await query<any[]>(
      `SELECT s.token_hash, s.user_id, s.expires_at,
              u.id, u.full_name, u.email, u.contact_no, u.branch_code, u.role, u.status,
              u.rejection_reason, u.employee_id, u.access_expires_at, u.suspended_from,
              u.suspended_until, u.disabled_reason, u.locked_until, u.last_login_at, u.created_at,
              b.name AS branch_name, b.region AS branch_region
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       JOIN branches b ON u.branch_code = b.code
       WHERE s.token_hash = ?
       LIMIT 1`,
      [tokenHash]
    );

    if (!rows || rows.length === 0) {
      return { user: null, error: "NOT_FOUND" };
    }

    const row = rows[0];

    // Session TTL Expiry Check
    if (new Date(row.expires_at) < now) {
      await query("DELETE FROM sessions WHERE token_hash = ?", [tokenHash]);
      return { user: null, error: "EXPIRED", message: "Your login session has expired. Please log in again." };
    }

    // Trainee Status Check
    if (row.status === "pending") {
      return {
        user: null,
        error: "PENDING",
        message: "Your account is awaiting approval from your branch admin.",
      };
    }
    if (row.status === "rejected") {
      return {
        user: null,
        error: "REJECTED",
        message: row.rejection_reason
          ? `Your registration was declined: ${row.rejection_reason}`
          : "Your registration was declined. Please contact your branch supervisor.",
      };
    }
    if (row.status === "deactivated") {
      return {
        user: null,
        error: "DEACTIVATED",
        message: row.disabled_reason
          ? `Account deactivated: ${row.disabled_reason}`
          : "Your account has been deactivated. Please contact your administrator.",
      };
    }

    // Access Expiry Date Check (Trainee access window)
    if (row.access_expires_at && new Date(row.access_expires_at) < now) {
      // Automatic session eviction
      await query("DELETE FROM sessions WHERE token_hash = ?", [tokenHash]);
      return {
        user: null,
        error: "ACCESS_EXPIRED",
        message: "Your training access period has ended. Please contact your branch administrator to extend your access.",
      };
    }

    // Account Temporary Suspension Check
    if (row.suspended_from && row.suspended_until) {
      const from = new Date(row.suspended_from);
      const until = new Date(row.suspended_until);
      if (now >= from && now <= until) {
        return {
          user: null,
          error: "SUSPENDED",
          message: `Your account is temporarily suspended until ${until.toLocaleDateString()}.`,
        };
      }
    }

    // Lockout Check
    if (row.locked_until && new Date(row.locked_until) > now) {
      return {
        user: null,
        error: "LOCKED",
        message: "Account is temporarily locked due to failed login attempts. Try again later.",
      };
    }

    const user: AuthSessionUser = {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      contactNo: row.contact_no,
      branchCode: row.branch_code,
      branchName: row.branch_name,
      branchRegion: row.branch_region,
      role: row.role,
      status: row.status,
      employeeId: row.employee_id,
      accessExpiresAt: row.access_expires_at ? new Date(row.access_expires_at).toISOString() : null,
      suspendedFrom: row.suspended_from ? new Date(row.suspended_from).toISOString() : null,
      suspendedUntil: row.suspended_until ? new Date(row.suspended_until).toISOString() : null,
      disabledReason: row.disabled_reason,
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at).toISOString() : null,
      createdAt: new Date(row.created_at).toISOString(),
    };

    return { user };
  } catch (error: any) {
    console.error("Session lookup error:", error);
    return { user: null, error: "NOT_FOUND" };
  }
}
