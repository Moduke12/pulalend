/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return {};
  const raw = fs.readFileSync(envPath, "utf8");

  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function sanitizeSql(sql) {
  // Remove BOM if present
  let cleaned = sql.replace(/^\uFEFF/, "");

  // Strip single-line comments to avoid driver edge cases
  cleaned = cleaned
    .split(/\r?\n/)
    .filter((line) => {
      const t = line.trim();
      if (!t) return true;
      if (t.startsWith("--")) return false;
      return true;
    })
    .join("\n");

  return cleaned;
}

async function main() {
  const env = { ...loadEnvLocal(), ...process.env };

  const host = env.DB_HOST || "localhost";
  const port = Number(env.DB_PORT || 3306);
  const user = env.DB_USER || "root";
  const password = env.DB_PASSWORD || "";

  const schemaPath = path.join(process.cwd(), "database", "schema.sql");
  if (!fs.existsSync(schemaPath)) {
    console.error("Schema file not found:", schemaPath);
    process.exit(1);
  }

  const sql = sanitizeSql(fs.readFileSync(schemaPath, "utf8"));

  console.log("Connecting to MySQL...", { host, port, user });
  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true,
  });

  try {
    console.log("Applying schema...", schemaPath);
    await connection.query(sql);
    console.log("Done. Database and tables are ready.");
    console.log("Seeded admin:");
    console.log("  email: admin@pulalend.com");
    console.log("  password: admin123");
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error("DB init failed:");
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
