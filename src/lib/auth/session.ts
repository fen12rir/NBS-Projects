import crypto from "crypto";
import { cookies } from "next/headers";
import { query, ensurePosCredentialColumns, generatePosCredentials } from "@/lib/db";
import { AuthSessionUser } from "./types";

export const SESSION_COOKIE_NAME = "nbs_session";
export const DEMO_COOKIE_NAME = "nbs_demo_mode";

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

let lastExpiredSessionPurge = 0;

export async function purgeExpiredSessions(): Promise<void> {
  const nowMs = Date.now();
  if (nowMs - lastExpiredSessionPurge < 15 * 60 * 1000) return;
  lastExpiredSessionPurge = nowMs;
  try {
    await query("DELETE FROM sessions WHERE expires_at < NOW()");
  } catch {
    // Non-fatal
  }
}

export async function createSession(
  userId: string,
  userAgent?: string | null
): Promise<{ rawToken: string; expiresAt: Date }> {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const ttlSeconds = getSessionTtlSeconds();
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  // Purge any expired sessions
  try {
    await query("DELETE FROM sessions WHERE expires_at < NOW()");
    lastExpiredSessionPurge = Date.now();
  } catch {
    // Non-fatal
  }

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
  if (rawToken.startsWith("demo-")) return;
  try {
    const tokenHash = hashToken(rawToken);
    await query("DELETE FROM sessions WHERE token_hash = ?", [tokenHash]);
  } catch {
    // Non-fatal
  }
}

export async function destroyAllUserSessions(userId: string): Promise<void> {
  try {
    await query("DELETE FROM sessions WHERE user_id = ?", [userId]);
  } catch {
    // Non-fatal
  }
}

export interface SessionVerificationResult {
  user: AuthSessionUser | null;
  error?: "NO_SESSION" | "EXPIRED" | "PENDING" | "REJECTED" | "DEACTIVATED" | "ACCESS_EXPIRED" | "LOCKED" | "SUSPENDED" | "NOT_FOUND";
  message?: string;
}

export async function getSessionUser(rawToken?: string): Promise<SessionVerificationResult> {
  let token = rawToken;
  let demoMode: string | undefined;

  try {
    const cookieStore = cookies();
    if (!token) {
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    }
    demoMode = cookieStore.get(DEMO_COOKIE_NAME)?.value;
  } catch {
    // In non-request context (e.g. testing)
  }

  // 1. Check for Demo Admin Session
  if (token === "demo-admin-token" || demoMode === "admin") {
    const adminUser: AuthSessionUser = {
      id: "demo-admin-001",
      fullName: "System Administrator (Demo Admin)",
      email: "admin@nbs.com.ph",
      contactNo: "+639170000000",
      branchCode: "2438",
      branchName: "NBS SM North Edsa",
      branchRegion: "NCR - North",
      role: "super_admin",
      status: "active",
      employeeId: "NBS-ADM-001",
      posUsername: "241209",
      posPassword: "241209",
      accessExpiresAt: null,
      createdAt: new Date().toISOString(),
    };
    return { user: adminUser };
  }

  // 2. Check for Demo Trainee Session
  if (token === "demo-trainee-token" || demoMode === "trainee") {
    const traineeUser: AuthSessionUser = {
      id: "demo-cashier-001",
      fullName: "Maria Santos (Demo Trainee)",
      email: "maria.santos@training.nbs.internal",
      contactNo: "+639171234567",
      branchCode: "2438",
      branchName: "NBS SM North Edsa",
      branchRegion: "NCR - North",
      role: "trainee",
      status: "active",
      employeeId: "NBS-EMP-2026-0891",
      posUsername: "241209",
      posPassword: "241209",
      accessExpiresAt: null,
      createdAt: new Date().toISOString(),
    };
    return { user: traineeUser };
  }

  if (!token) {
    return { user: null, error: "NO_SESSION" };
  }

  const tokenHash = hashToken(token);
  const now = new Date();

  try {
    await ensurePosCredentialColumns();
    void purgeExpiredSessions();
    const rows = await query<any[]>(
      `SELECT s.token_hash, s.user_id, s.expires_at,
              u.id, u.full_name, u.email, u.contact_no, u.branch_code, u.role, u.status,
              u.rejection_reason, u.employee_id, u.pos_username, u.pos_password,
              u.access_expires_at, u.suspended_from,
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

    let posUsername = row.pos_username;
    let posPassword = row.pos_password;
    if (!posUsername || !posPassword) {
      const creds = generatePosCredentials(row.branch_code);
      posUsername = posUsername || creds.posUsername;
      posPassword = posPassword || creds.posPassword;
      try {
        await query(
          "UPDATE users SET pos_username = ?, pos_password = ? WHERE id = ?",
          [posUsername, posPassword, row.id]
        );
      } catch {}
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
      posUsername,
      posPassword,
      accessExpiresAt: row.access_expires_at ? new Date(row.access_expires_at).toISOString() : null,
      suspendedFrom: row.suspended_from ? new Date(row.suspended_from).toISOString() : null,
      suspendedUntil: row.suspended_until ? new Date(row.suspended_until).toISOString() : null,
      disabledReason: row.disabled_reason,
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at).toISOString() : null,
      createdAt: new Date(row.created_at).toISOString(),
    };

    return { user };
  } catch (error: any) {
    // If DB is offline and token was not found, check if it's demo
    if (token && token.includes("demo")) {
      return {
        user: {
          id: "demo-cashier-001",
          fullName: "Maria Santos (Demo Trainee)",
          email: "maria.santos@training.nbs.internal",
          contactNo: "+639171234567",
          branchCode: "2438",
          branchName: "NBS SM North Edsa",
          role: "trainee",
          status: "active",
          createdAt: new Date().toISOString(),
        },
      };
    }
    return { user: null, error: "NOT_FOUND" };
  }
}
