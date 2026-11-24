import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";

function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf8");
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (process.env[key] === undefined) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

function sqlLiteral(val: any): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") return Number.isFinite(val) ? String(val) : "NULL";
  if (typeof val === "boolean") return val ? "1" : "0";
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return "NULL";
    const pad = (n: number) => String(n).padStart(2, "0");
    const formatted = `${val.getFullYear()}-${pad(val.getMonth() + 1)}-${pad(val.getDate())} ${pad(val.getHours())}:${pad(val.getMinutes())}:${pad(val.getSeconds())}`;
    return `'${formatted}'`;
  }
  const str = String(val)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n");
  return `'${str}'`;
}

async function runBackup() {
  loadEnv();

  const host = process.env.DB_HOST || "127.0.0.1";
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || "ptp_user";
  const password = process.env.DB_PASSWORD || "";
  const database = process.env.DB_NAME || "nbs_pos_training";
  const retentionDays = Number(process.env.BACKUP_RETENTION_DAYS) || 30;

  console.log(`=== NBS POS Training: Database Maintenance & Backup (${database}) ===`);

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
  });

  try {
    // 1. Purge expired sessions
    const [purgeResult]: any = await conn.execute(
      "DELETE FROM sessions WHERE expires_at < NOW()"
    );
    console.log(`Purged expired sessions: ${purgeResult?.affectedRows || 0} row(s) removed.`);

    // 2. Prepare backups directory
    const backupDir = path.resolve(process.cwd(), "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const backupFile = path.join(backupDir, `${database}_${stamp}.sql`);

    const tables = [
      "branches",
      "users",
      "user_progress",
      "lesson_completions",
      "scenario_attempts",
      "app_settings",
      "audit_log",
    ];

    const lines: string[] = [
      `-- NBS POS Training Automated SQL Backup (Compatible with MySQL Workbench & phpMyAdmin)`,
      `-- Database: ${database}`,
      `-- Generated At: ${now.toISOString()}`,
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
      `USE \`${database}\`;`,
      `SET FOREIGN_KEY_CHECKS = 0;`,
      "",
    ];

    for (const table of tables) {
      try {
        const [createRows]: [any[], any] = await conn.query(`SHOW CREATE TABLE \`${table}\``);
        const createSql = (createRows?.[0]?.["Create Table"] || "").replace(
          /^CREATE TABLE/i,
          "CREATE TABLE IF NOT EXISTS"
        );
        const [rows]: [any[], any] = await conn.query(`SELECT * FROM \`${table}\``);
        lines.push(`-- Table: ${table} (${rows.length} rows)`);
        if (createSql) {
          lines.push(`${createSql};`);
        }
        if (rows.length > 0) {
          const cols = Object.keys(rows[0]).map((c) => `\`${c}\``).join(", ");
          for (const row of rows) {
            const vals = Object.values(row).map(sqlLiteral).join(", ");
            lines.push(`REPLACE INTO \`${table}\` (${cols}) VALUES (${vals});`);
          }
        }
        lines.push("");
      } catch (err: any) {
        console.warn(`Skipping table ${table}: ${err.message}`);
      }
    }

    lines.push("SET FOREIGN_KEY_CHECKS = 1;");
    fs.writeFileSync(backupFile, lines.join("\n"), "utf8");
    console.log(`Backup written to: ${backupFile}`);

    // 3. Rotate backups older than retentionDays
    const cutoffMs = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    let deletedCount = 0;
    for (const entry of fs.readdirSync(backupDir)) {
      if (!entry.endsWith(".sql")) continue;
      const full = path.join(backupDir, entry);
      const stat = fs.statSync(full);
      if (stat.mtimeMs < cutoffMs) {
        fs.unlinkSync(full);
        deletedCount++;
      }
    }
    if (deletedCount > 0) {
      console.log(`Rotated ${deletedCount} backup(s) older than ${retentionDays} days.`);
    }

    console.log("=== Database Maintenance & Backup Completed ===");
  } finally {
    await conn.end();
  }
}

runBackup().catch((err) => {
  console.error("Backup failed:", err.message || err);
  process.exit(1);
});
