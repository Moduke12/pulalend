const mysql = require('mysql2/promise');

async function runRiskAssessmentMigration() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pulalend'
  });

  try {
    console.log('=== Running Risk Assessment Migration ===\n');
    
    // Check and add borrower_profiles columns
    console.log('Adding columns to borrower_profiles...\n');
    
    const borrowerColumns = [
      { name: 'monthly_income', type: 'DECIMAL(15, 2) DEFAULT 0.00' },
      { name: 'monthly_debt', type: 'DECIMAL(15, 2) DEFAULT 0.00' },
      { name: 'total_loans', type: 'INT DEFAULT 0' },
      { name: 'completed_loans', type: 'INT DEFAULT 0' },
      { name: 'defaulted_loans', type: 'INT DEFAULT 0' },
      { name: 'on_time_payments', type: 'INT DEFAULT 0' },
      { name: 'late_payments', type: 'INT DEFAULT 0' },
      { name: 'default_probability', type: 'DECIMAL(5, 2) DEFAULT 5.00' }
    ];

    for (const col of borrowerColumns) {
      const [exists] = await connection.execute(
        `SHOW COLUMNS FROM borrower_profiles LIKE '${col.name}'`
      );
      
      if (exists.length === 0) {
        await connection.execute(
          `ALTER TABLE borrower_profiles ADD COLUMN ${col.name} ${col.type}`
        );
        console.log(`  ✓ Added ${col.name}`);
      } else {
        console.log(`  - ${col.name} already exists`);
      }
    }

    // Check and add loan_requests columns
    console.log('\nAdding columns to loan_requests...\n');
    
    const loanColumns = [
      { name: 'debt_to_income_ratio', type: 'DECIMAL(5, 2) DEFAULT 0.00' },
      { name: 'loan_to_income_ratio', type: 'DECIMAL(5, 2) DEFAULT 0.00' }
    ];

    for (const col of loanColumns) {
      const [exists] = await connection.execute(
        `SHOW COLUMNS FROM loan_requests LIKE '${col.name}'`
      );
      
      if (exists.length === 0) {
        await connection.execute(
          `ALTER TABLE loan_requests ADD COLUMN ${col.name} ${col.type}`
        );
        console.log(`  ✓ Added ${col.name}`);
      } else {
        console.log(`  - ${col.name} already exists`);
      }
    }

    // Update default probabilities for existing borrowers
    console.log('\nUpdating default probabilities...\n');
    await connection.execute(
      `UPDATE borrower_profiles bp
       SET default_probability = CASE
           WHEN bp.credit_score >= 750 THEN 2.0
           WHEN bp.credit_score >= 700 THEN 5.0
           WHEN bp.credit_score >= 650 THEN 10.0
           WHEN bp.credit_score >= 600 THEN 20.0
           ELSE 35.0
       END
       WHERE bp.credit_score IS NOT NULL`
    );
    console.log('  ✓ Default probabilities updated');

    // Update risk grades for existing loans
    console.log('\nUpdating loan risk grades...\n');
    await connection.execute(
      `UPDATE loan_requests lr
       INNER JOIN borrower_profiles bp ON bp.user_id = lr.borrower_id
       SET lr.risk_grade = CASE
           WHEN bp.credit_score >= 750 THEN 'A'
           WHEN bp.credit_score >= 700 THEN 'B'
           WHEN bp.credit_score >= 650 THEN 'C'
           WHEN bp.credit_score >= 600 THEN 'D'
           ELSE 'E'
       END
       WHERE bp.credit_score IS NOT NULL`
    );
    console.log('  ✓ Risk grades updated');

    console.log('\n✅ Risk assessment migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await connection.end();
  }
}

runRiskAssessmentMigration().catch(console.error);
