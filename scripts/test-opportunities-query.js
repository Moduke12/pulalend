const mysql = require('mysql2/promise');

async function testOpportunitiesQuery() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pulalend'
  });

  try {
    console.log('=== Testing Opportunities API Query ===\n');
    
    // Test the full query
    try {
      const [rows] = await connection.execute(
        `SELECT
            lr.id,
            lr.loan_number AS loanNumber,
            lr.amount,
            lr.interest_rate AS interestRate,
            lr.duration_months AS durationMonths,
            lr.purpose,
            lr.risk_grade AS riskGrade,
            lr.debt_to_income_ratio AS debtToIncomeRatio,
            lr.loan_to_income_ratio AS loanToIncomeRatio,
            lr.status,
            lr.requested_at AS requestedAt,
            u.first_name AS borrowerFirstName,
            u.last_name AS borrowerLastName,
            bp.credit_score AS creditScore,
            bp.default_probability AS defaultProbability,
            bp.total_loans AS totalLoans,
            bp.completed_loans AS completedLoans,
            bp.defaulted_loans AS defaultedLoans,
            bp.on_time_payments AS onTimePayments,
            bp.late_payments AS latePayments,
            COALESCE(SUM(inv.amount), 0) AS fundedAmount
          FROM loan_requests lr
          INNER JOIN users u ON u.id = lr.borrower_id
          INNER JOIN borrower_profiles bp ON bp.user_id = lr.borrower_id
          LEFT JOIN investments inv ON inv.loan_id = lr.id
          WHERE lr.status = 'approved'
          GROUP BY lr.id, lr.loan_number, lr.amount, lr.interest_rate, lr.duration_months, lr.purpose, lr.risk_grade,
                   lr.debt_to_income_ratio, lr.loan_to_income_ratio, lr.status, lr.requested_at,
                   u.first_name, u.last_name, bp.credit_score, bp.default_probability,
                   bp.total_loans, bp.completed_loans, bp.defaulted_loans, bp.on_time_payments, bp.late_payments
          HAVING (lr.amount - COALESCE(SUM(inv.amount), 0)) > 0
          ORDER BY lr.approved_at DESC, lr.requested_at DESC`
      );

      console.log(`✓ Query successful - ${rows.length} approved loans found\n`);
      
      if (rows.length > 0) {
        console.log('Sample loan:');
        console.log(rows[0]);
      }

    } catch (err) {
      console.error('❌ QUERY FAILED:', err.message);
      console.error('\nThis is the error causing "Failed to load opportunities"\n');
      
      // Check which columns exist
      console.log('Checking table structures...\n');
      
      console.log('loan_requests columns:');
      const [lrCols] = await connection.execute('DESCRIBE loan_requests');
      lrCols.forEach(col => console.log(`  - ${col.Field}`));
      
      console.log('\nborrower_profiles columns:');
      const [bpCols] = await connection.execute('DESCRIBE borrower_profiles');
      bpCols.forEach(col => console.log(`  - ${col.Field}`));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

testOpportunitiesQuery().catch(console.error);
