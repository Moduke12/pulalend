const mysql = require('mysql2/promise');

async function createLoanLenderSelectionsTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pulalend'
  });

  try {
    console.log('Creating loan_lender_selections table...\n');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS loan_lender_selections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        loan_id INT NOT NULL,
        lender_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (loan_id) REFERENCES loan_requests(id) ON DELETE CASCADE,
        FOREIGN KEY (lender_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY uniq_loan_lender (loan_id, lender_id),
        INDEX idx_lender (lender_id)
      ) ENGINE=InnoDB
    `);

    console.log('✓ loan_lender_selections table created');

    // Verify
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'loan_lender_selections'"
    );

    if (tables.length > 0) {
      console.log('✓ Table verified in database\n');
      
      const [columns] = await connection.execute(
        'DESCRIBE loan_lender_selections'
      );
      console.log('Table structure:');
      columns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

createLoanLenderSelectionsTable().catch(console.error);
