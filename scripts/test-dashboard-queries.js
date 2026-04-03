const mysql = require('mysql2/promise');

async function testDashboardAPIQueries() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pulalend'
  });

  try {
    const userId = 2;
    console.log('=== Testing Dashboard API Queries ===\n');
    
    // Test 1: User check
    console.log('1. Checking user...');
    const [userRows] = await connection.execute(
      "SELECT id, user_type FROM users WHERE id = ?",
      [userId]
    );
    console.log('   ✓ User found:', userRows[0]);

    // Test 2: Active loans
    console.log('\n2. Checking active loans...');
    const [activeLoanRows] = await connection.execute(
      "SELECT COUNT(*) AS count FROM loan_requests WHERE borrower_id = ? AND status IN ('pending','approved','funded','active')",
      [userId]
    );
    console.log('   ✓ Active loans:', activeLoanRows[0]);

    // Test 3: Total borrowed
    console.log('\n3. Checking total borrowed...');
    const [totalBorrowedRows] = await connection.execute(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM loan_requests WHERE borrower_id = ? AND status IN ('funded','active','completed')",
      [userId]
    );
    console.log('   ✓ Total borrowed:', totalBorrowedRows[0]);

    // Test 4: Next payment
    console.log('\n4. Checking next payment...');
    const [nextPaymentRows] = await connection.execute(
      `SELECT rs.total_amount AS next_payment
       FROM repayment_schedules rs
       INNER JOIN loan_requests lr ON lr.id = rs.loan_id
       WHERE lr.borrower_id = ? AND rs.status IN ('pending','partial')
       ORDER BY rs.due_date ASC
       LIMIT 1`,
      [userId]
    );
    console.log('   ✓ Next payment:', nextPaymentRows.length > 0 ? nextPaymentRows[0] : 'No upcoming payments');

    // Test 5: Recent loans
    console.log('\n5. Checking recent loans...');
    const [recentLoanRows] = await connection.execute(
      `SELECT id, amount, status, requested_at AS requestedAt
       FROM loan_requests
       WHERE borrower_id = ?
       ORDER BY requested_at DESC
       LIMIT 5`,
      [userId]
    );
    console.log('   ✓ Recent loans:', recentLoanRows.length);

    // Test 6: Upcoming repayments
    console.log('\n6. Checking upcoming repayments...');
    const [upcomingRepaymentsRows] = await connection.execute(
      `SELECT rs.id, rs.loan_id, rs.due_date, rs.total_amount, rs.status, lr.loan_number
       FROM repayment_schedules rs
       INNER JOIN loan_requests lr ON lr.id = rs.loan_id
       WHERE lr.borrower_id = ? AND rs.status IN ('pending','partial')
       ORDER BY rs.due_date ASC
       LIMIT 5`,
      [userId]
    );
    console.log('   ✓ Upcoming repayments:', upcomingRepaymentsRows.length);

    // Test 7: KYC status
    console.log('\n7. Checking KYC status...');
    const [kycStatusRows] = await connection.execute(
      `SELECT status, submitted_at, reviewed_at, rejection_reason
       FROM kyc_requests
       WHERE user_id = ?
       ORDER BY submitted_at DESC
       LIMIT 1`,
      [userId]
    );
    console.log('   ✓ KYC status:', kycStatusRows.length > 0 ? kycStatusRows[0] : 'No KYC submission');

    // Test 8: Notifications (THIS MIGHT BE THE PROBLEM)
    console.log('\n8. Checking notifications...');
    try {
      const [notificationsRows] = await connection.execute(
        `SELECT id, title, message, type, read_status, created_at
         FROM notifications
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 5`,
        [userId]
      );
      console.log('   ✓ Notifications:', notificationsRows.length);
    } catch (err) {
      console.error('   ❌ NOTIFICATIONS QUERY FAILED:', err.message);
      console.error('   This is likely the cause of the 500 error!');
    }

    console.log('\n=== All queries completed ===');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await connection.end();
  }
}

testDashboardAPIQueries().catch(console.error);
