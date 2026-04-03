const mysql = require('mysql2/promise');

async function testAPI() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pulalend'
  });

  try {
    // Simulate the API query
    const [rows] = await connection.execute(
      `SELECT u.id, u.first_name AS firstName, u.last_name AS lastName,
              lp.available_balance AS availableBalance, lp.verified AS verified
       FROM users u
       INNER JOIN lender_profiles lp ON lp.user_id = u.id
       WHERE u.user_type = 'lender' AND lp.verified = TRUE AND lp.available_balance > 0
       ORDER BY lp.available_balance DESC`
    );

    console.log('=== API Response Simulation ===\n');
    console.log('GET /api/borrower/lenders would return:\n');
    console.log(JSON.stringify({
      lenders: rows.map((row) => ({
        id: row.id,
        firstName: row.firstName,
        lastName: row.lastName,
        availableBalance: Number(row.availableBalance || 0),
        verified: Boolean(row.verified),
      }))
    }, null, 2));

    if (rows.length > 0) {
      console.log(`\n✓ SUCCESS: ${rows.length} lender(s) will appear in the "Choose Lender(s)" dropdown`);
    } else {
      console.log('\n❌ ERROR: No lenders would be returned');
    }

  } finally {
    await connection.end();
  }
}

testAPI().catch(console.error);
