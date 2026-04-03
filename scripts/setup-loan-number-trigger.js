const mysql = require('mysql2/promise');

async function setupLoanNumberTrigger() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pulalend'
  });

  try {
    console.log('Setting up loan_number auto-generation...\n');
    
    // Drop trigger if it exists
    await connection.execute('DROP TRIGGER IF EXISTS before_loan_insert');
    
    // Create trigger to auto-generate loan_number
    await connection.execute(`
      CREATE TRIGGER before_loan_insert
      BEFORE INSERT ON loan_requests
      FOR EACH ROW
      BEGIN
        IF NEW.loan_number IS NULL THEN
          SET NEW.loan_number = CONCAT('LOAN', LPAD((SELECT IFNULL(MAX(id), 0) + 1 FROM loan_requests), 6, '0'));
        END IF;
      END
    `);

    console.log('✓ Trigger created: before_loan_insert');
    console.log('  → Automatically generates loan_number for new loans\n');

    // Test it
    console.log('Testing trigger with a sample insert...');
    await connection.execute(
      `INSERT INTO loan_requests (borrower_id, amount, interest_rate, duration_months, purpose, status, risk_grade)
       VALUES (2, 1000, 12.0, 3, 'Test trigger', 'pending', 'C')`
    );

    const [testLoan] = await connection.execute(
      'SELECT id, loan_number FROM loan_requests ORDER BY id DESC LIMIT 1'
    );

    console.log('  Test loan created:', testLoan[0]);
    
    if (testLoan[0].loan_number) {
      console.log('  ✅ loan_number auto-generated successfully!');
    } else {
      console.log('  ❌ loan_number is still NULL');
    }

    // Clean up test loan
    await connection.execute('DELETE FROM loan_requests WHERE id = ?', [testLoan[0].id]);
    console.log('  Test loan deleted');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nNote: If the trigger creation failed, loan_number will need to be');
    console.error('generated manually in the API code.');
  } finally {
    await connection.end();
  }
}

setupLoanNumberTrigger().catch(console.error);
