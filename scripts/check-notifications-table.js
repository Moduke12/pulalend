const mysql = require('mysql2/promise');

async function checkNotificationsTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pulalend'
  });

  try {
    console.log('=== Checking notifications table ===\n');
    
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'notifications'"
    );

    if (tables.length === 0) {
      console.log('❌ notifications table does NOT exist');
      console.log('This is likely causing the lender dashboard API to fail\n');
      return false;
    }

    console.log('✓ notifications table exists\n');
    
    const [columns] = await connection.execute('DESCRIBE notifications');
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

checkNotificationsTable().catch(console.error);
