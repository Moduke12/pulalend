const mysql = require('mysql2/promise');

async function verifyLender() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pulalend'
  });

  try {
    // Update all lenders to verified status
    const [result] = await connection.execute(
      `UPDATE lender_profiles SET verified = TRUE WHERE user_id IN (SELECT id FROM users WHERE user_type = 'lender')`
    );

    console.log(`✓ Updated ${result.affectedRows} lender profile(s) to verified status`);
    
    // Show the updated lenders
    const [lenders] = await connection.execute(
      `SELECT u.id, u.email, u.first_name, u.last_name, 
              lp.verified, lp.available_balance
       FROM users u 
       INNER JOIN lender_profiles lp ON lp.user_id = u.id 
       WHERE u.user_type = 'lender'`
    );

    console.log('\n=== Verified Lenders ===');
    lenders.forEach((lender, idx) => {
      console.log(`${idx + 1}. ${lender.first_name} ${lender.last_name} (${lender.email})`);
      console.log(`   Verified: ${lender.verified ? '✓ YES' : '✗ NO'}`);
      console.log(`   Available Balance: P${lender.available_balance}`);
    });

  } finally {
    await connection.end();
  }
}

verifyLender().catch(console.error);
