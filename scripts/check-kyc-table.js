const mysql = require('mysql2/promise');

async function checkKycTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pulalend'
  });

  try {
    console.log('=== Checking KYC table ===\n');
    
    // Check if table exists
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'kyc_requests'"
    );

    if (tables.length === 0) {
      console.log('❌ kyc_requests table does NOT exist');
      console.log('\nYou need to run the database schema:');
      console.log('mysql -u root -p pulalend < database/schema.sql\n');
      return;
    }

    console.log('✓ kyc_requests table exists\n');

    // Check table structure
    const [columns] = await connection.execute(
      "DESCRIBE kyc_requests"
    );

    console.log('Table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    // Check if there are any records
    const [rows] = await connection.execute(
      "SELECT COUNT(*) as count FROM kyc_requests"
    );

    console.log(`\nTotal KYC requests: ${rows[0].count}`);

    // Test the query that's failing
    const userId = 2;
    console.log(`\nTesting query for user ID ${userId}...`);
    
    const [userKyc] = await connection.execute(
      "SELECT id, status, submitted_at, reviewed_at, notes FROM kyc_requests WHERE user_id = ? ORDER BY submitted_at DESC LIMIT 1",
      [userId]
    );

    if (userKyc.length === 0) {
      console.log('  No KYC request found for user 2 (expected for new users)');
    } else {
      console.log('  KYC request found:', userKyc[0]);
    }

    console.log('\n✓ API query works correctly');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await connection.end();
  }
}

checkKycTable().catch(console.error);
