const mysql = require('mysql2/promise');

async function createTestInvestment() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'pulalend',
  });

  try {
    console.log('=== Creating Test Investment with Commission ===\n');

    // First, check if we have an approved loan
    const [loans] = await pool.execute(
      `SELECT id, loan_number, amount, interest_rate, duration_months 
       FROM loan_requests 
       WHERE status = 'approved' 
       LIMIT 1`
    );

    let loanId;
    if (loans.length === 0) {
      console.log('No approved loans found. Creating and approving a test loan...\n');
      
      // Check if we have any pending loans
      const [pendingLoans] = await pool.execute(
        `SELECT id, loan_number, amount, interest_rate, duration_months 
         FROM loan_requests 
         WHERE status = 'pending' 
         LIMIT 1`
      );

      if (pendingLoans.length > 0) {
        loanId = pendingLoans[0].id;
        // Approve it
        await pool.execute(
          `UPDATE loan_requests SET status = 'approved' WHERE id = ?`,
          [loanId]
        );
        console.log(`✅ Approved existing loan #${loanId} (${pendingLoans[0].loan_number})`);
      } else {
        // Create a new loan request
        const [maxIdRow] = await pool.execute(
          'SELECT COALESCE(MAX(id), 0) + 1 as nextId FROM loan_requests'
        );
        const loanNumber = `LOAN${String(maxIdRow[0].nextId).padStart(6, '0')}`;

        const [result] = await pool.execute(
          `INSERT INTO loan_requests 
           (borrower_id, loan_number, amount, purpose, interest_rate, duration_months, status, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, 'approved', NOW())`,
          [2, loanNumber, 50000, 'Business expansion', 12, 12]
        );
        loanId = result.insertId;
        console.log(`✅ Created and approved new loan #${loanId} (${loanNumber})`);
      }
    } else {
      loanId = loans[0].id;
      console.log(`✅ Found approved loan #${loanId} (${loans[0].loan_number})`);
    }

    // Get loan details
    const [loanDetails] = await pool.execute(
      `SELECT amount, interest_rate, duration_months FROM loan_requests WHERE id = ?`,
      [loanId]
    );
    const loan = loanDetails[0];

    // Investment parameters
    const lenderId = 3; // Demo Lender
    const investAmount = 25000; // P25,000 investment
    const commissionRate = 0.02; // 2%
    const platformCommission = investAmount * commissionRate; // P500
    const netInvestAmount = investAmount - platformCommission; // P24,500

    // Calculate expected return
    const monthlyRate = loan.interest_rate / 100 / 12;
    const totalReturn = netInvestAmount * Math.pow(1 + monthlyRate, loan.duration_months);
    const expectedReturn = totalReturn - netInvestAmount;

    console.log('\n=== Investment Details ===');
    console.log(`Lender ID: ${lenderId} (Demo Lender)`);
    console.log(`Loan ID: ${loanId}`);
    console.log(`Investment Amount: P${investAmount.toLocaleString()}`);
    console.log(`Platform Commission (2%): P${platformCommission.toLocaleString()}`);
    console.log(`Net Investment: P${netInvestAmount.toLocaleString()}`);
    console.log(`Expected Return: P${expectedReturn.toFixed(2)}`);
    console.log(`Interest Rate: ${loan.interest_rate}%`);
    console.log(`Term: ${loan.duration_months} months\n`);

    // Create the investment
    const [investResult] = await pool.execute(
      `INSERT INTO investments 
       (lender_id, loan_id, amount, expected_return, platform_commission, status, invested_at) 
       VALUES (?, ?, ?, ?, ?, 'active', NOW())`,
      [lenderId, loanId, investAmount, expectedReturn, platformCommission]
    );

    console.log(`✅ Created investment #${investResult.insertId}\n`);

    // Update lender balance
    await pool.execute(
      `UPDATE lender_profiles 
       SET available_balance = available_balance - ? 
       WHERE user_id = ?`,
      [investAmount, lenderId]
    );
    console.log(`✅ Deducted P${investAmount.toLocaleString()} from lender balance\n`);

    // Create transaction record
    await pool.execute(
      `INSERT INTO transactions 
       (user_id, transaction_type, amount, description, reference_id, reference_type, status, created_at) 
       VALUES (?, 'investment', ?, ?, ?, 'investment', 'completed', NOW())`,
      [
        lenderId,
        investAmount,
        `Investment in loan #${loanId} (2% platform fee: P${platformCommission.toFixed(2)})`,
        investResult.insertId
      ]
    );
    console.log(`✅ Created transaction record\n`);

    // Check updated balances and commission
    const [lenderProfile] = await pool.execute(
      `SELECT available_balance FROM lender_profiles WHERE user_id = ?`,
      [lenderId]
    );

    const [commissionTotal] = await pool.execute(
      `SELECT SUM(platform_commission) as total FROM investments WHERE lender_id = ?`,
      [lenderId]
    );

    const [platformCommissionTotal] = await pool.execute(
      `SELECT SUM(platform_commission) as total FROM investments`
    );

    console.log('=== Updated Balances ===');
    console.log(`Lender Available Balance: P${Number(lenderProfile[0].available_balance).toLocaleString()}`);
    console.log(`Lender Total Commission Paid: P${Number(commissionTotal[0].total).toLocaleString()}`);
    console.log(`Platform Total Commission Earned: P${Number(platformCommissionTotal[0].total).toLocaleString()}`);
    
    console.log('\n✅ Test investment created successfully!');
    console.log('\nRefresh the lender dashboard and admin dashboard to see the commission.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createTestInvestment();
