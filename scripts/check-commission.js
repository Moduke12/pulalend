const mysql = require('mysql2/promise');

async function checkCommission() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'pulalend',
  });

  try {
    console.log('=== Checking Commission Implementation ===\n');

    // Check if platform_commission column exists
    const [columns] = await pool.execute(
      "SHOW COLUMNS FROM investments WHERE Field = 'platform_commission'"
    );

    if (columns.length === 0) {
      console.log('❌ platform_commission column does NOT exist in investments table');
      console.log('   Need to run migration to add it\n');
    } else {
      console.log('✅ platform_commission column exists\n');
    }

    // Check lender commission (Demo Lender = user_id 3)
    const [lenderRows] = await pool.execute(
      `SELECT 
        lender_id,
        COUNT(*) as investment_count,
        SUM(amount) as total_invested,
        SUM(platform_commission) as total_commission
      FROM investments 
      WHERE lender_id = 3
      GROUP BY lender_id`
    );

    console.log('=== Demo Lender (ID: 3) Commission ===');
    if (lenderRows.length > 0) {
      const row = lenderRows[0];
      console.log(`  Investments: ${row.investment_count}`);
      console.log(`  Total Invested: P${Number(row.total_invested).toLocaleString()}`);
      console.log(`  Commission Paid: P${Number(row.total_commission).toLocaleString()}`);
      console.log(`  Commission Rate: ${((row.total_commission / row.total_invested) * 100).toFixed(2)}%`);
    } else {
      console.log('  No investments yet');
    }
    console.log();

    // Check platform-wide commission
    const [platformRows] = await pool.execute(
      `SELECT 
        COUNT(*) as total_investments,
        SUM(amount) as total_invested,
        SUM(platform_commission) as total_commission_earned
      FROM investments`
    );

    console.log('=== Platform Total Commission ===');
    if (platformRows.length > 0) {
      const row = platformRows[0];
      console.log(`  Total Investments: ${row.total_investments}`);
      console.log(`  Total Amount: P${Number(row.total_invested).toLocaleString()}`);
      console.log(`  Commission Earned: P${Number(row.total_commission_earned).toLocaleString()}`);
      if (row.total_invested > 0) {
        console.log(`  Average Rate: ${((row.total_commission_earned / row.total_invested) * 100).toFixed(2)}%`);
      }
    } else {
      console.log('  No investments yet');
    }
    console.log();

    // Show all investments with commission details
    const [allInvestments] = await pool.execute(
      `SELECT 
        i.id,
        i.lender_id,
        i.loan_id,
        i.amount,
        i.platform_commission,
        i.expected_return,
        i.status,
        i.invested_at
      FROM investments i
      ORDER BY i.invested_at DESC
      LIMIT 10`
    );

    console.log('=== Recent Investments ===');
    if (allInvestments.length > 0) {
      console.log('ID | Lender | Loan | Amount | Commission | Return | Status');
      console.log('---|--------|------|--------|------------|--------|--------');
      for (const inv of allInvestments) {
        console.log(
          `${inv.id} | ${inv.lender_id} | ${inv.loan_id} | P${Number(inv.amount).toFixed(2)} | P${Number(inv.platform_commission).toFixed(2)} | P${Number(inv.expected_return).toFixed(2)} | ${inv.status}`
        );
      }
    } else {
      console.log('  No investments found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkCommission();
