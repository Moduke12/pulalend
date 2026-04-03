const mysql = require('mysql2/promise');

async function checkLenderBalanceLogic() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'pulalend',
  });

  try {
    console.log('=== LENDER BALANCE LOGIC CHECK ===\n');

    const lenderId = 3;

    // Get current lender profile
    const [lenderProfile] = await pool.execute(
      `SELECT user_id, available_balance, created_at FROM lender_profiles WHERE user_id = ?`,
      [lenderId]
    );

    console.log('📊 Current Lender Profile:');
    console.log(`   Available Balance: P${Number(lenderProfile[0].available_balance).toLocaleString()}`);
    console.log();

    // Get all investments
    const [investments] = await pool.execute(
      `SELECT id, amount, platform_commission, invested_at 
       FROM investments 
       WHERE lender_id = ?
       ORDER BY invested_at`,
      [lenderId]
    );

    console.log('💰 Investment History:');
    let totalInvested = 0;
    let totalCommission = 0;
    
    for (const inv of investments) {
      totalInvested += Number(inv.amount);
      totalCommission += Number(inv.platform_commission);
      console.log(`   Investment #${inv.id}: P${Number(inv.amount).toLocaleString()} (Commission: P${Number(inv.platform_commission).toLocaleString()})`);
    }
    console.log(`   ─────────────────────────────────────`);
    console.log(`   Total Invested: P${totalInvested.toLocaleString()}`);
    console.log(`   Total Commission: P${totalCommission.toLocaleString()}`);
    console.log();

    // Get all transactions
    const [transactions] = await pool.execute(
      `SELECT id, transaction_type, amount, created_at 
       FROM transactions 
       WHERE user_id = ?
       ORDER BY created_at`,
      [lenderId]
    );

    console.log('📋 Transaction History:');
    let balance = 0;
    
    for (const txn of transactions) {
      if (txn.transaction_type === 'deposit') {
        balance += Number(txn.amount);
        console.log(`   ${txn.transaction_type}: +P${Number(txn.amount).toLocaleString()} (Balance: P${balance.toLocaleString()})`);
      } else if (txn.transaction_type === 'investment') {
        balance -= Number(txn.amount);
        console.log(`   ${txn.transaction_type}: -P${Number(txn.amount).toLocaleString()} (Balance: P${balance.toLocaleString()})`);
      }
    }
    console.log();

    // Calculate what the balance SHOULD be
    const [deposits] = await pool.execute(
      `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND transaction_type = 'deposit'`,
      [lenderId]
    );

    const totalDeposits = Number(deposits[0].total);
    const expectedBalance = totalDeposits - totalInvested;

    console.log('🔍 Balance Analysis:');
    console.log(`   Total Deposits: P${totalDeposits.toLocaleString()}`);
    console.log(`   Total Invested: P${totalInvested.toLocaleString()}`);
    console.log(`   Expected Available Balance: P${expectedBalance.toLocaleString()}`);
    console.log(`   Actual Available Balance: P${Number(lenderProfile[0].available_balance).toLocaleString()}`);
    console.log();

    if (expectedBalance !== Number(lenderProfile[0].available_balance)) {
      console.log('❌ MISMATCH DETECTED!');
      console.log(`   Difference: P${(Number(lenderProfile[0].available_balance) - expectedBalance).toLocaleString()}`);
      console.log();
      console.log('💡 Recommended Action:');
      console.log(`   Set available_balance to P${expectedBalance.toLocaleString()}`);
    } else {
      console.log('✅ Balance is correct!');
    }

    // Show what dashboard should display
    console.log('\n📊 Dashboard Should Show:');
    console.log(`   Available Balance: P${Number(lenderProfile[0].available_balance).toLocaleString()}`);
    console.log(`   Total Invested: P${totalInvested.toLocaleString()}`);
    console.log(`   Total Deposits: P${totalDeposits.toLocaleString()}`);
    console.log(`   Commission Paid: P${totalCommission.toLocaleString()}`);
    console.log(`   ─────────────────────────────────────`);
    console.log(`   Total Portfolio Value: P${(Number(lenderProfile[0].available_balance) + totalInvested).toLocaleString()}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkLenderBalanceLogic();
