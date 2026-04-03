const mysql = require('mysql2/promise');

async function testAdminKycQuery() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pulalend'
  });

  try {
    console.log('=== Testing Admin KYC API Query ===\n');
    
    const status = 'pending';
    
    try {
      const [rows] = await connection.execute(
        `SELECT
            kr.id,
            kr.user_id,
            kr.id_type,
            kr.id_number,
            kr.address1,
            kr.address2,
            kr.city,
            kr.country,
            kr.id_front_path,
            kr.id_back_path,
            kr.selfie_path,
            kr.omang_copy_path,
            kr.payslip_path,
            kr.status,
            kr.rejection_reason,
            kr.submitted_at,
            kr.reviewed_at,
            kr.notes,
            u.first_name,
            u.last_name,
            u.email,
            u.user_type,
            u.phone,
            u.permanent_address,
            u.current_address
          FROM kyc_requests kr
          INNER JOIN users u ON u.id = kr.user_id
          WHERE kr.status = ?
          ORDER BY kr.submitted_at DESC`,
        [status]
      );

      console.log(`✓ Query successful - ${rows.length} KYC requests found\n`);
      
      if (rows.length > 0) {
        console.log('Sample KYC request:');
        console.log(rows[0]);
      }

    } catch (err) {
      console.error('❌ QUERY FAILED:', err.message);
      console.error('\nThis is causing "Failed to load KYC requests"\n');
      
      // Check which columns exist
      console.log('Checking users table structure...\n');
      const [userCols] = await connection.execute('DESCRIBE users');
      console.log('users table columns:');
      userCols.forEach(col => console.log(`  - ${col.Field}`));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

testAdminKycQuery().catch(console.error);
