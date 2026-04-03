const mysql = require('mysql2/promise');

async function testLoanSubmission() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pulalend'
  });

  try {
    console.log('=== Testing Loan Submission Process ===\n');
    
    const borrowerId = 2;
    const loanAmount = 5000;
    const duration = 6;
    const purpose = 'Test loan application';
    const interestRate = 12.0;
    const riskGrade = 'C';
    const lenderIds = [3]; // Demo Lender

    console.log('1. Checking lender availability...');
    const placeholders = lenderIds.map(() => '?').join(',');
    const [lenderRows] = await connection.execute(
      `SELECT u.id, lp.available_balance
       FROM users u
       INNER JOIN lender_profiles lp ON lp.user_id = u.id
       WHERE u.user_type = 'lender'
         AND lp.verified = TRUE
         AND lp.available_balance > 0
         AND u.id IN (${placeholders})`,
      lenderIds
    );

    if (lenderRows.length === 0) {
      console.log('   ❌ No lenders available');
      return;
    }
    console.log('   ✓ Lender available:', lenderRows[0]);

    console.log('\n2. Inserting loan request...');
    try {
      const [result] = await connection.execute(
        `INSERT INTO loan_requests (borrower_id, amount, interest_rate, duration_months, purpose, status, risk_grade)
         VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
        [borrowerId, loanAmount, interestRate, duration, purpose, riskGrade]
      );

      const loanId = result.insertId;
      console.log('   ✓ Loan inserted with ID:', loanId);

      console.log('\n3. Checking loan_number...');
      const [loanCheck] = await connection.execute(
        'SELECT id, loan_number FROM loan_requests WHERE id = ?',
        [loanId]
      );
      console.log('   Loan number:', loanCheck[0].loan_number);

      if (!loanCheck[0].loan_number) {
        console.log('   ⚠️  loan_number is NULL - generating one...');
        const loanNumber = `LOAN${String(loanId).padStart(6, '0')}`;
        await connection.execute(
          'UPDATE loan_requests SET loan_number = ? WHERE id = ?',
          [loanNumber, loanId]
        );
        console.log('   ✓ Generated loan number:', loanNumber);
      }

      console.log('\n4. Inserting lender selections...');
      const lenderValues = lenderIds.map(lenderId => [loanId, lenderId]);
      await connection.query(
        'INSERT INTO loan_lender_selections (loan_id, lender_id) VALUES ?',
        [lenderValues]
      );
      console.log('   ✓ Lender selections inserted');

      console.log('\n5. Verifying loan...');
      const [finalCheck] = await connection.execute(
        `SELECT lr.*, 
                GROUP_CONCAT(lls.lender_id) as selected_lenders
         FROM loan_requests lr
         LEFT JOIN loan_lender_selections lls ON lls.loan_id = lr.id
         WHERE lr.id = ?
         GROUP BY lr.id`,
        [loanId]
      );
      console.log('   ✓ Final loan:', finalCheck[0]);

      console.log('\n✅ Loan submission test SUCCESSFUL');

      // Clean up test loan
      console.log('\nCleaning up test loan...');
      await connection.execute('DELETE FROM loan_requests WHERE id = ?', [loanId]);
      console.log('✓ Test loan deleted');

    } catch (err) {
      console.error('   ❌ INSERT FAILED:', err.message);
      console.error('\nFull error:', err);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

testLoanSubmission().catch(console.error);
