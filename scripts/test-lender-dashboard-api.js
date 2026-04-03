const mysql = require('mysql2/promise');

async function testLenderDashboardAPI() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pulalend'
  });

  try {
    const lenderId = 3; // Demo Lender
    console.log('=== Testing Lender Dashboard API Response ===\n');
    console.log(`Lender ID: ${lenderId}\n`);

    // Get lender profile balance info (exact query from API)
    const [profileRows] = await connection.execute(
      "SELECT available_balance, total_invested, total_earned FROM lender_profiles WHERE user_id = ?",
      [lenderId]
    );

    console.log('Profile Query Result:');
    console.log(profileRows);
    console.log('');

    if (profileRows.length === 0) {
      console.log('❌ No lender profile found!');
      return;
    }

    const profile = profileRows[0];
    console.log('Profile Data:');
    console.log(`  available_balance: ${profile.available_balance} (type: ${typeof profile.available_balance})`);
    console.log(`  total_invested: ${profile.total_invested} (type: ${typeof profile.total_invested})`);
    console.log(`  total_earned: ${profile.total_earned} (type: ${typeof profile.total_earned})`);
    console.log('');

    // Simulate what API returns
    const portfolioResponse = {
      availableBalance: Number(profile.available_balance),
      totalInvested: Number(profile.total_invested),
      totalEarned: Number(profile.total_earned),
      totalCommission: 0,
    };

    console.log('API Would Return (portfolio):');
    console.log(JSON.stringify(portfolioResponse, null, 2));
    console.log('');

    console.log('Verification:');
    console.log(`  availableBalance === 0? ${portfolioResponse.availableBalance === 0}`);
    console.log(`  availableBalance value: ${portfolioResponse.availableBalance}`);
    console.log(`  Formatted: P${portfolioResponse.availableBalance.toLocaleString()}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

testLenderDashboardAPI().catch(console.error);
