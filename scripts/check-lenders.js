const mysql = require('mysql2/promise');

async function checkLenders() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pulalend'
  });

  try {
    console.log('=== Checking Lenders ===\n');
    
    const [lenders] = await connection.execute(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.user_type, 
              lp.verified, lp.available_balance, lp.total_invested
       FROM users u 
       LEFT JOIN lender_profiles lp ON lp.user_id = u.id 
       WHERE u.user_type = 'lender'`
    );

    if (lenders.length === 0) {
      console.log('❌ No lenders found in the database\n');
    } else {
      console.log(`Found ${lenders.length} lender(s):\n`);
      lenders.forEach((lender, idx) => {
        console.log(`${idx + 1}. ${lender.first_name} ${lender.last_name} (${lender.email})`);
        console.log(`   User ID: ${lender.id}`);
        console.log(`   Verified: ${lender.verified ? '✓ YES' : '✗ NO'}`);
        console.log(`   Available Balance: P${lender.available_balance || 0}`);
        console.log(`   Total Invested: P${lender.total_invested || 0}`);
        console.log('');
      });
    }

    // Check what the API would return
    const [apiResults] = await connection.execute(
      `SELECT u.id, u.first_name AS firstName, u.last_name AS lastName,
              lp.available_balance AS availableBalance, lp.verified AS verified
       FROM users u
       INNER JOIN lender_profiles lp ON lp.user_id = u.id
       WHERE u.user_type = 'lender' AND lp.verified = TRUE AND lp.available_balance > 0
       ORDER BY lp.available_balance DESC`
    );

    console.log('=== API Would Return ===');
    if (apiResults.length === 0) {
      console.log('❌ No lenders meet the criteria (verified = TRUE AND available_balance > 0)\n');
    } else {
      console.log(`✓ ${apiResults.length} lender(s) would be shown to borrowers\n`);
      apiResults.forEach((lender, idx) => {
        console.log(`${idx + 1}. ${lender.firstName} ${lender.lastName} - P${lender.availableBalance}`);
      });
    }

  } finally {
    await connection.end();
  }
}

checkLenders().catch(console.error);
