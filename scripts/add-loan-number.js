const mysql = require('mysql2/promise');

async function addLoanNumber() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pulalend'
  });

  try {
    console.log('Checking if loan_number column exists...\n');
    
    // Check current structure
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM loan_requests LIKE 'loan_number'"
    );

    if (columns.length > 0) {
      console.log('✓ loan_number column already exists');
      return;
    }

    console.log('Adding loan_number column to loan_requests table...\n');
    
    await connection.execute(
      `ALTER TABLE loan_requests 
       ADD COLUMN loan_number VARCHAR(50) UNIQUE AFTER id`
    );

    console.log('✓ loan_number column added successfully');

    // Generate loan numbers for existing loans
    console.log('\nGenerating loan numbers for existing loans...');
    
    const [loans] = await connection.execute(
      'SELECT id FROM loan_requests WHERE loan_number IS NULL'
    );

    if (loans.length > 0) {
      for (const loan of loans) {
        const loanNumber = `LOAN${String(loan.id).padStart(6, '0')}`;
        await connection.execute(
          'UPDATE loan_requests SET loan_number = ? WHERE id = ?',
          [loanNumber, loan.id]
        );
        console.log(`  - Generated loan number ${loanNumber} for loan ID ${loan.id}`);
      }
      console.log(`\n✓ Generated ${loans.length} loan numbers`);
    } else {
      console.log('  No loans need loan numbers');
    }

    // Verify
    const [result] = await connection.execute(
      'SELECT id, loan_number FROM loan_requests'
    );
    console.log('\nCurrent loans:');
    result.forEach(r => {
      console.log(`  Loan #${r.id}: ${r.loan_number}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

addLoanNumber().catch(console.error);
