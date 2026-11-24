import mysql from "mysql2/promise";

// Global Connection Pool Cache
const globalForDb = globalThis as unknown as { pool: mysql.Pool | undefined };

const sslOption =
  process.env.DB_SSL === "true" || process.env.DB_SSL === "1"
    ? { rejectUnauthorized: false }
    : undefined;

export const dbPool =
  globalForDb.pool ||
  mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "ptp_user",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "nbs_pos_training",
    ssl: sslOption,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = dbPool;
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const [results] = await dbPool.execute(sql, params);
  return results as T;
}

let posColumnsChecked = false;
export async function ensurePosCredentialColumns(): Promise<void> {
  if (posColumnsChecked) return;
  posColumnsChecked = true;
  try {
    await dbPool.query(
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS pos_username VARCHAR(32) NULL AFTER employee_id, ADD COLUMN IF NOT EXISTS pos_password VARCHAR(64) NULL AFTER pos_username"
    );
  } catch {
    // Non-fatal fallback
  }
}

export function generatePosCredentials(branchCode?: string): {
  posUsername: string;
  posPassword: string;
} {
  const prefix = (branchCode || "24").replace(/\D/g, "").slice(0, 2) || "24";
  const randUser = Math.floor(1000 + Math.random() * 9000).toString();
  const randPass = Math.floor(100000 + Math.random() * 900000).toString();
  return {
    posUsername: `${prefix}${randUser}`,
    posPassword: randPass,
  };
}

export async function testDbConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    await dbPool.query("SELECT 1 AS connected");
    return { connected: true, message: "Database connection successful" };
  } catch (error: any) {
    return { connected: false, message: error?.message || "Database connection failed" };
  }
}
