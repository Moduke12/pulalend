const mysql = require('mysql2/promise');

async function testFullLenderDashboardAPI() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pulalend'
  });

  try {
    const lenderId = 3; // Demo Lender
    console.log('=== Running Full Lender Dashboard API Queries ===\n');
    console.log(`Lender ID: ${lenderId}\n`);

    // Query 1: User check
    console.log('1. Checking user...');
    const [userRows] = await connection.execute(
      "SELECT id, user_type FROM users WHERE id = ?",
      [lenderId]
    );
    console.log('   ✓ User:', userRows[0]);

    // Query 2: Available loans
    console.log('\n2. Checking available loans...');
    try {
      const [availableRows] = await connection.execute(
        `SELECT COUNT(*) AS count
         FROM (
            SELECT lr.id, (lr.amount - COALESCE(SUM(inv.amount),0)) AS remaining
            FROM loan_requests lr
            LEFT JOIN investments inv ON inv.loan_id = lr.id
            WHERE lr.status = 'approved'
            GROUP BY lr.id
            HAVING remaining > 0
         ) t`
      );
      console.log('   ✓ Available loans:', availableRows[0]);
    } catch (err) {
      console.error('   ❌ FAILED:', err.message);
    }

    // Query 3: Funded loans
    console.log('\n3. Checking funded loans...');
    try {
      const [fundedRows] = await connection.execute(
        "SELECT COUNT(DISTINCT loan_id) AS count FROM investments WHERE lender_id = ?",
        [lenderId]
      );
      console.log('   ✓ Funded loans:', fundedRows[0]);
    } catch (err) {
      console.error('   ❌ FAILED:', err.message);
    }

    // Query 4: Expected returns
    console.log('\n4. Checking expected returns...');
    try {
      const [expectedRows] = await connection.execute(
        "SELECT COALESCE(SUM(expected_return),0) AS expectedReturn FROM investments WHERE lender_id = ?",
        [lenderId]
      );
      console.log('   ✓ Expected returns:', expectedRows[0]);
    } catch (err) {
      console.error('   ❌ FAILED:', err.message);
    }

    // Query 5: Lender profile
    console.log('\n5. Checking lender profile...');
    try {
      const [profileRows] = await connection.execute(
        "SELECT available_balance, total_invested, total_earned FROM lender_profiles WHERE user_id = ?",
        [lenderId]
      );
      console.log('   ✓ Profile:', profileRows[0]);
    } catch (err) {
      console.error('   ❌ FAILED:', err.message);
    }

    // Query 6: Commission
    console.log('\n6. Checking commission...');
    try {
      const [commissionRows] = await connection.execute(
        "SELECT COALESCE(SUM(platform_commission), 0) AS totalCommission FROM investments WHERE lender_id = ?",
        [lenderId]
      );
      console.log('   ✓ Commission:', commissionRows[0]);
    } catch (err) {
      console.error('   ❌ FAILED:', err.message);
    }

    // Query 7: Active investments
    console.log('\n7. Checking active investments...');
    try {
      const [investmentsRows] = await connection.execute(
        `SELECT 
          inv.id,
          inv.amount,
          inv.expected_return,
          inv.invested_at AS investedAt,
          lr.loan_number,
          lr.amount AS loanAmount,
          lr.status AS loanStatus,
          u.first_name AS borrowerFirstName,
          u.last_name AS borrowerLastName,
          COALESCE(SUM(rs.total_amount), 0) AS totalRepayments,
          COALESCE(SUM(CASE WHEN rs.status IN ('pending','partial') AND rs.due_date < NOW() THEN 1 ELSE 0 END), 0) AS overdueCount
         FROM investments inv
         INNER JOIN loan_requests lr ON lr.id = inv.loan_id
         INNER JOIN users u ON u.id = lr.borrower_id
         LEFT JOIN repayment_schedules rs ON rs.loan_id = lr.id
         WHERE inv.lender_id = ?
         GROUP BY inv.id, inv.amount, inv.expected_return, inv.invested_at, lr.loan_number, lr.amount, lr.status, u.first_name, u.last_name
         ORDER BY inv.invested_at DESC
         LIMIT 5`,
        [lenderId]
      );
      console.log('   ✓ Active investments:', investmentsRows.length, 'rows');
    } catch (err) {
      console.error('   ❌ FAILED:', err.message);
    }

    // Query 8: Opportunities
    console.log('\n8. Checking opportunities...');
    try {
      const [opportunitiesRows] = await connection.execute(
        `SELECT 
          lr.id,
          lr.loan_number,
          lr.amount,
          lr.interest_rate,
          lr.duration_months,
          lr.purpose,
          lr.requested_at,
          u.first_name AS borrowerFirstName,
          u.last_name AS borrowerLastName,
          COALESCE(SUM(inv.amount), 0) AS fundedAmount,
          (lr.amount - COALESCE(SUM(inv.amount), 0)) AS remaining
         FROM loan_requests lr
         INNER JOIN users u ON u.id = lr.borrower_id
         LEFT JOIN investments inv ON inv.loan_id = lr.id
         WHERE lr.status = 'approved'
         GROUP BY lr.id, lr.loan_number, lr.amount, lr.interest_rate, lr.duration_months, lr.purpose, lr.requested_at, u.first_name, u.last_name
         HAVING remaining > 0
         ORDER BY lr.requested_at DESC
         LIMIT 5`
      );
      console.log('   ✓ Opportunities:', opportunitiesRows.length, 'rows');
    } catch (err) {
      console.error('   ❌ FAILED:', err.message);
    }

    // Query 9: Notifications
    console.log('\n9. Checking notifications...');
    try {
      const [notificationsRows] = await connection.execute(
        `SELECT id, title, message, type, read_status, created_at
         FROM notifications
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 5`,
        [lenderId]
      );
      console.log('   ✓ Notifications:', notificationsRows.length, 'rows');
    } catch (err) {
      console.error('   ❌ FAILED:', err.message);
    }

    // Query 10: Transactions
    console.log('\n10. Checking transactions...');
    try {
      const [txRows] = await connection.execute(
        `SELECT transaction_type AS transactionType, amount, status, created_at AS createdAt, description
         FROM transactions
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 10`,
        [lenderId]
      );
      console.log('   ✓ Transactions:', txRows.length, 'rows');
    } catch (err) {
      console.error('   ❌ FAILED:', err.message);
    }

    console.log('\n✅ All queries completed');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await connection.end();
  }
}

testFullLenderDashboardAPI().catch(console.error);
