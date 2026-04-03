const mysql = require('mysql2/promise');

async function testDashboardAPI() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pulalend'
  });

  try {
    const userId = 2; // Demo Borrower
    console.log(`=== Testing Dashboard API for User ${userId} ===\n`);
    
    // Simulate what the API does
    const [kycStatusRows] = await connection.execute(
      `SELECT status, submitted_at, reviewed_at, rejection_reason
       FROM kyc_requests
       WHERE user_id = ?
       ORDER BY submitted_at DESC
       LIMIT 1`,
      [userId]
    );

    console.log('KYC Status Query Result:');
    if (kycStatusRows.length === 0) {
      console.log('  No KYC found - API will return: null');
      console.log('  Dashboard will show: "Complete Your KYC Verification"');
    } else {
      const kycData = kycStatusRows[0];
      console.log('  Status:', kycData.status);
      console.log('  Submitted:', kycData.submitted_at);
      console.log('  Reviewed:', kycData.reviewed_at || 'Not yet');
      console.log('  Rejection Reason:', kycData.rejection_reason || 'N/A');
      
      console.log('\n API will return:');
      console.log(JSON.stringify({
        status: kycData.status,
        submittedAt: kycData.submitted_at,
        reviewedAt: kycData.reviewed_at,
        rejectionReason: kycData.rejection_reason,
      }, null, 2));

      console.log('\n Dashboard will show:');
      if (kycData.status === 'pending') {
        console.log('  Title: "KYC Verification Pending"');
        console.log('  Message: "Your KYC documents are being reviewed. This usually takes 1-2 business days."');
        console.log('  Button: (hidden - no action button while pending)');
      } else if (kycData.status === 'approved' || kycData.status === 'verified') {
        console.log('  (No KYC banner - approved/verified users don\'t see it)');
      } else if (kycData.status === 'rejected') {
        console.log('  Title: "KYC Verification Rejected"');
        console.log('  Message: Reason:', kycData.rejection_reason || 'Documents need to be resubmitted.');
        console.log('  Button:  "Resubmit KYC"');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

testDashboardAPI().catch(console.error);
