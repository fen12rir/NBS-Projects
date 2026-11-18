import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";

async function runMigration() {
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
