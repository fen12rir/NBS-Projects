import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import crypto from "crypto";

async function seedAdmin() {
  console.log("=== NBS POS Training Platform: Seed Super Admin ===");

  const args = process.argv.slice(2);
  const getArg = (name: string, fallback: string) => {
    const idx = args.findIndex((a) => a === `--${name}` || a.startsWith(`--${name}=`));
    if (idx === -1) return fallback;
    if (args[idx].includes("=")) return args[idx].split("=")[1];
    return args[idx + 1] || fallback;
  };

  const email = (getArg("email", "admin@nbs.com.ph") || "").trim().toLowerCase();
  const password = getArg("password", "Admin123!");
  const fullName = getArg("name", "System Administrator");
  const branchCode = getArg("branch", "2438");
  const contactNo = getArg("contact", "+639170000000");

  const host = process.env.DB_HOST || "localhost";
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || "ptp_user";
  const dbPassword = process.env.DB_PASSWORD || "";
  const database = process.env.DB_NAME || "nbs_pos_training";
  const ssl =
    process.env.DB_SSL === "true" || process.env.DB_SSL === "1"
      ? { rejectUnauthorized: false }
      : undefined;

  console.log(`Target database: ${user}@${host}:${port}/${database}`);
  console.log(`Admin Email: ${email}`);
  console.log(`Admin Name: ${fullName}`);
  console.log(`Admin Branch: ${branchCode}`);

  let connection: mysql.Connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password: dbPassword,
      database,
      ssl,
    });
  } catch (err: any) {
    console.error("❌ Failed to connect to database:", err.message);
    process.exit(1);
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = "admin-" + crypto.randomUUID().slice(0, 8);

    await connection.query(
      `INSERT INTO users (id, full_name, email, contact_no, branch_code, password_hash, role, status, access_expires_at)
       VALUES (?, ?, ?, ?, ?, ?, 'super_admin', 'active', NULL)
       ON DUPLICATE KEY UPDATE
         full_name = VALUES(full_name),
         password_hash = VALUES(password_hash),
         role = 'super_admin',
         status = 'active',
         access_expires_at = NULL`,
      [userId, fullName, email, contactNo, branchCode, passwordHash]
    );

    console.log("✅ Super Admin account created/updated successfully!");
    console.log(`Login Email:    ${email}`);
    console.log(`Login Password: ${password}`);
    console.log("Role:           super_admin (Full Access across all branches)");
  } catch (err: any) {
    console.error("❌ Failed to seed super admin:", err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedAdmin();
