const mysql = require('mysql2/promise');

async function checkTransactionsTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pulalend'
  });

  try {
    console.log('=== Checking transactions table ===\n');
    
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'transactions'"
    );

    if (tables.length === 0) {
      console.log('❌ transactions table does NOT exist');
      console.log('This is causing the lender dashboard API to fail!\n');
      return false;
    }

    console.log('✓ transactions table exists\n');
    
    const [columns] = await connection.execute('DESCRIBE transactions');
    console.log('Table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    return true;

  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  } finally {
    await connection.end();
  }
}

checkTransactionsTable().catch(console.error);
