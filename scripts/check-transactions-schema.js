const mysql = require('mysql2/promise');

async function checkTransactionsSchema() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'pulalend',
  });

  try {
    console.log('=== Checking transactions table schema ===\n');

    const [columns] = await pool.execute(
      'SHOW COLUMNS FROM transactions'
    );

    console.log('Columns in transactions table:');
    for (const col of columns) {
      console.log(`  - ${col.Field} (${col.Type})`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTransactionsSchema();
