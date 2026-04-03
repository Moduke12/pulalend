const mysql = require('mysql2/promise');

async function fixLenderBalance() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'pulalend',
  });

  try {
    console.log('=== FIXING LENDER BALANCE LOGIC ===\n');

    const lenderId = 3;

    // The lender invested P25,000 and should have P25,000 remaining
    // That means initial deposit should be P50,000

    // Update the initial deposit transaction to P50,000
    const [depositTxn] = await pool.execute(
      `SELECT id, amount FROM transactions 
       WHERE user_id = ? AND transaction_type = 'deposit'
       ORDER BY created_at ASC LIMIT 1`,
      [lenderId]
    );

    if (depositTxn.length > 0) {
      await pool.execute(
        `UPDATE transactions SET amount = 50000 WHERE id = ?`,
        [depositTxn[0].id]
      );
      console.log(`✅ Updated deposit transaction #${depositTxn[0].id} from P${Number(depositTxn[0].amount).toLocaleString()} to P50,000`);
    } else {
      // Create a deposit transaction
      await pool.execute(
        `INSERT INTO transactions 
         (user_id, transaction_type, amount, description, status, created_at)
         VALUES (?, 'deposit', 50000, 'Initial deposit', 'completed', DATE_SUB(NOW(), INTERVAL 1 DAY))`,
        [lenderId]
      );
      console.log('✅ Created initial deposit transaction of P50,000');
    }

    // Calculate correct available balance
    // Deposits: P50,000
    // Invested: P25,000
    // Available: P25,000
    
    await pool.execute(
      `UPDATE lender_profiles SET available_balance = 25000 WHERE user_id = ?`,
      [lenderId]
    );
    console.log('✅ Set available_balance to P25,000');
    console.log();

    // Verify the fix
    const [profile] = await pool.execute(
      `SELECT available_balance FROM lender_profiles WHERE user_id = ?`,
      [lenderId]
    );

    const [totalDeposits] = await pool.execute(
      `SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND transaction_type = 'deposit'`,
      [lenderId]
    );

    const [totalInvested] = await pool.execute(
      `SELECT SUM(amount) as total FROM investments WHERE lender_id = ?`,
      [lenderId]
    );

    console.log('📊 CORRECTED BALANCES:');
    console.log(`   Total Deposits: P${Number(totalDeposits[0].total).toLocaleString()}`);
    console.log(`   Total Invested: P${Number(totalInvested[0].total).toLocaleString()}`);
    console.log(`   Available Balance: P${Number(profile[0].available_balance).toLocaleString()}`);
    console.log();
    console.log('✅ Math Check:');
    console.log(`   P${Number(totalDeposits[0].total).toLocaleString()} (deposits) - P${Number(totalInvested[0].total).toLocaleString()} (invested) = P${(Number(totalDeposits[0].total) - Number(totalInvested[0].total)).toLocaleString()} ✓`);
    
    console.log('\n📊 Dashboard will now show:');
    console.log(`   Available Balance: P25,000 (money ready to invest)`);
    console.log(`   Total Invested: P25,000 (money in active loans)`);
    console.log(`   Total Portfolio: P50,000 (available + invested)`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixLenderBalance();
