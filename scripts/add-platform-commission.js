const mysql = require('mysql2/promise');

async function addPlatformCommissionColumn() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pulalend'
  });

  try {
    console.log('Checking investments table structure...\n');
    
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM investments LIKE 'platform_commission'"
    );

    if (columns.length > 0) {
      console.log('✓ platform_commission column already exists');
      return;
    }

    console.log('Adding platform_commission column to investments table...\n');
    
    await connection.execute(
      `ALTER TABLE investments 
       ADD COLUMN platform_commission DECIMAL(15,2) DEFAULT 0.00 AFTER expected_return`
    );

    console.log('✓ platform_commission column added successfully');

    // Verify
    const [result] = await connection.execute('DESCRIBE investments');
    console.log('\nUpdated table structure:');
    result.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

addPlatformCommissionColumn().catch(console.error);
