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

async function runMigration() {
  loadEnv();

  console.log("=== NBS POS Training Platform: Database Migration ===");

  const host = process.env.DB_HOST || "localhost";
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || "ptp_user";
  const password = process.env.DB_PASSWORD || "";
  const database = process.env.DB_NAME || "nbs_pos_training";
  const ssl =
    process.env.DB_SSL === "true" || process.env.DB_SSL === "1"
      ? { rejectUnauthorized: false }
      : undefined;

  console.log(`Connecting to ${user}@${host}:${port}/${database}...`);

  let connection: mysql.Connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true,
      ssl,
    });
  } catch (err: any) {
    console.error("❌ Failed to connect to database server:", err.message);
    console.error("\nTroubleshooting tips:");
    console.error("1. Ensure MariaDB / MySQL is running on your machine or server.");
    console.error("2. Verify credentials in your .env or .env.local file (see .env.example).");
    console.error(`3. Current target: host='${host}', port=${port}, user='${user}'.`);
    process.exit(1);
  }

  try {
    const schemaPath = path.resolve(process.cwd(), "schema.sql");
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    console.log("Executing schema.sql...");

    await connection.query(schemaSql);
    console.log("✅ Schema successfully applied!");

    // Verify created tables
    await connection.changeUser({ database });
    const [tables]: [any[], any] = await connection.query("SHOW TABLES");
    console.log("Existing tables in database:");
    tables.forEach((t) => console.log(`  - ${Object.values(t)[0]}`));

    // Verify branch count
    const [branches]: [any[], any] = await connection.query("SELECT COUNT(*) AS count FROM branches");
    console.log(`Seeded branches count: ${branches[0].count}`);

    console.log("=== Migration completed successfully ===");
  } catch (err: any) {
    console.error("❌ Migration error:", err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
