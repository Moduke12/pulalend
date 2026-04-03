const mysql = require('mysql2/promise');

async function checkLenderBalance() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pulalend'
  });

  try {
    console.log('=== Checking Lender Balance ===\n');
    
    // Get all lenders
    const [lenders] = await connection.execute(
      `SELECT u.id, u.email, u.first_name, u.last_name,
              lp.available_balance, lp.total_invested, lp.total_deposited
       FROM users u
       INNER JOIN lender_profiles lp ON lp.user_id = u.id
       WHERE u.user_type = 'lender'`
    );

    if (lenders.length === 0) {
      console.log('❌ No lenders found\n');
      return;
    }

    lenders.forEach((lender, idx) => {
      console.log(`${idx + 1}. ${lender.first_name} ${lender.last_name} (${lender.email})`);
      console.log(`   User ID: ${lender.id}`);
      console.log(`   Available Balance: P${lender.available_balance}`);
      console.log(`   Total Invested: P${lender.total_invested || 0}`);
      console.log(`   Total Deposited: P${lender.total_deposited || 0}`);
      console.log('');
    });

    // Check if there's a lender dashboard API issue
    console.log('=== Testing Lender Dashboard API Query ===\n');
    
    const userId = lenders[0].id;
    console.log(`Testing for user ID ${userId}...\n`);

    // Simulate the dashboard API query
    const [portfolioRows] = await connection.execute(
      `SELECT 
         COALESCE(SUM(i.amount), 0) AS totalInvested,
         COALESCE(SUM(i.amount + (i.amount * (lr.interest_rate/100) * (lr.duration_months/12))), 0) AS expectedReturns
       FROM investments i
       INNER JOIN loan_requests lr ON lr.id = i.loan_id
       WHERE i.lender_id = ?`,
      [userId]
    );

    console.log('Portfolio query result:', portfolioRows[0]);

    const [lenderProfileRows] = await connection.execute(
      `SELECT available_balance, total_invested, total_deposited
       FROM lender_profiles
       WHERE user_id = ?`,
      [userId]
    );

    console.log('Lender profile:', lenderProfileRows[0]);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkLenderBalance().catch(console.error);
