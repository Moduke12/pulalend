/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

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

async function upsertUser(conn, { email, password, firstName, lastName, phone, userType }) {
  const passwordHash = await bcrypt.hash(password, 10);

  await conn.execute(
    `INSERT INTO users (email, password_hash, first_name, last_name, phone, user_type, status, email_verified)
     VALUES (?, ?, ?, ?, ?, ?, 'active', TRUE)
     ON DUPLICATE KEY UPDATE
       password_hash = VALUES(password_hash),
       first_name = VALUES(first_name),
       last_name = VALUES(last_name),
       phone = VALUES(phone),
       user_type = VALUES(user_type),
       status = 'active'`,
    [email, passwordHash, firstName, lastName, phone || null, userType]
  );

  const [rows] = await conn.execute("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
  if (!rows || rows.length === 0) throw new Error(`Failed to fetch user id for ${email}`);
  return rows[0].id;
}

async function main() {
  const env = { ...loadEnvLocal(), ...process.env };

  const host = env.DB_HOST || "localhost";
  const port = Number(env.DB_PORT || 3306);
  const user = env.DB_USER || "root";
  const password = env.DB_PASSWORD || "";
  const database = env.DB_NAME || "pulalend";

  console.log("Connecting to MySQL...", { host, port, user, database });
  const conn = await mysql.createConnection({ host, port, user, password, database });

  try {
    await conn.beginTransaction();

    const borrowerEmail = "borrower@pulalend.com";
    const lenderEmail = "lender@pulalend.com";

    const borrowerId = await upsertUser(conn, {
      email: borrowerEmail,
      password: "borrower123",
      firstName: "Demo",
      lastName: "Borrower",
      phone: "+26700000001",
      userType: "borrower",
    });

    const lenderId = await upsertUser(conn, {
      email: lenderEmail,
      password: "lender123",
      firstName: "Demo",
      lastName: "Lender",
      phone: "+26700000002",
      userType: "lender",
    });

    await conn.execute(
      `INSERT IGNORE INTO borrower_profiles (user_id, business_name, business_type, city, country, credit_score, verified)
       VALUES (?, 'Demo Business', 'Retail', 'Gaborone', 'Botswana', 650, FALSE)`,
      [borrowerId]
    );

    await conn.execute(
      `INSERT IGNORE INTO lender_profiles (user_id, available_balance, total_invested, total_earned, verified)
       VALUES (?, 0.00, 0.00, 0.00, FALSE)`,
      [lenderId]
    );

    await conn.commit();

    console.log("Seeded/updated demo accounts:");
    console.log("Borrower:");
    console.log("  email: borrower@pulalend.com");
    console.log("  password: borrower123");
    console.log("Lender:");
    console.log("  email: lender@pulalend.com");
    console.log("  password: lender123");
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("DB seed failed:");
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
