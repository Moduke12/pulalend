const mysql = require('mysql2/promise');

async function checkLoanSchema() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'pulalend',
  });

  try {
    console.log('=== Checking loan_requests table schema ===\n');

    const [columns] = await pool.execute(
      'SHOW COLUMNS FROM loan_requests'
    );

    console.log('Columns in loan_requests table:');
    for (const col of columns) {
      console.log(`  - ${col.Field} (${col.Type})`);
    }

    console.log('\n=== Sample loan data ===');
    const [loans] = await pool.execute(
      'SELECT * FROM loan_requests LIMIT 1'
    );

    if (loans.length > 0) {
      console.log(JSON.stringify(loans[0], null, 2));
    } else {
      console.log('No loans found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkLoanSchema();
