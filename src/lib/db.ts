import mysql from "mysql2/promise";

// Global cache for connection pool across Next.js hot reloads in development
const globalForDb = globalThis as unknown as { pool: mysql.Pool | undefined };

export const dbPool =
  globalForDb.pool ||
  mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "ptp_user",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "nbs_pos_training",
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

export async function testDbConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const [rows] = await dbPool.query("SELECT 1 AS connected");
    return { connected: true, message: "Database connection successful" };
  } catch (error: any) {
    return { connected: false, message: error?.message || "Database connection failed" };
  }
}
