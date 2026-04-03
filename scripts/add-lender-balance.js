const mysql = require('mysql2/promise');

async function addLenderBalance() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'pulalend',
  });

  try {
    console.log('=== Adding Balance to Demo Lender ===\n');

    const lenderId = 3;
    const addAmount = 30000; // Add P30,000

    await pool.execute(
      `UPDATE lender_profiles 
       SET available_balance = available_balance + ? 
       WHERE user_id = ?`,
      [addAmount, lenderId]
    );

    // Verify
    const [rows] = await pool.execute(
      `SELECT available_balance FROM lender_profiles WHERE user_id = ?`,
      [lenderId]
    );

    console.log(`✅ Added P${addAmount.toLocaleString()} to lender balance`);
    console.log(`New Available Balance: P${Number(rows[0].available_balance).toLocaleString()}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addLenderBalance();
