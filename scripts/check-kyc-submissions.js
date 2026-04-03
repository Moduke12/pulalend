const mysql = require('mysql2/promise');

async function checkKycSubmissions() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pulalend'
  });

  try {
    console.log('=== Checking KYC Submissions ===\n');
    
    // Get all KYC requests
    const [kyc] = await connection.execute(
      `SELECT kr.*, u.email, u.first_name, u.last_name 
       FROM kyc_requests kr
       JOIN users u ON kr.user_id = u.id
       ORDER BY kr.submitted_at DESC`
    );

    if (kyc.length === 0) {
      console.log('❌ No KYC submissions found in database\n');
      console.log('This means the KYC form submission failed or didn\'t reach the database.');
      return;
    }

    console.log(`Found ${kyc.length} KYC submission(s):\n`);
    kyc.forEach((k, idx) => {
      console.log(`${idx + 1}. ${k.first_name} ${k.last_name} (${k.email})`);
      console.log(`   User ID: ${k.user_id}`);
      console.log(`   Status: ${k.status}`);
      console.log(`   ID Type: ${k.id_type} - ${k.id_number}`);
      console.log(`   Address: ${k.address1}, ${k.city}, ${k.country}`);
      console.log(`   Files:`);
      console.log(`     - ID Front: ${k.id_front_path}`);
      console.log(`     - ID Back: ${k.id_back_path || 'N/A'}`);
      console.log(`     - Selfie: ${k.selfie_path}`);
      console.log(`     - Omang Copy: ${k.omang_copy_path || 'N/A'}`);
      console.log(`     - Payslip: ${k.payslip_path || 'N/A'}`);
      console.log(`   Submitted: ${k.submitted_at}`);
      console.log(`   Reviewed: ${k.reviewed_at || 'Not yet'}`);
      console.log('');
    });

    // Check user's borrower profile
    console.log('=== Checking Borrower Profiles ===\n');
    const [profiles] = await connection.execute(
      `SELECT bp.*, u.email, u.first_name, u.last_name
       FROM borrower_profiles bp
       JOIN users u ON bp.user_id = u.id`
    );

    if (profiles.length === 0) {
      console.log('⚠️  No borrower profiles found');
    } else {
      profiles.forEach((p) => {
        console.log(`${p.first_name} ${p.last_name} (${p.email})`);
        console.log(`  KYC Verified: ${p.kyc_verified ? '✓ YES' : '✗ NO'}`);
        console.log(`  Credit Limit: P${p.credit_limit}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkKycSubmissions().catch(console.error);
