const mysql = require('mysql2/promise');

async function createTransactionRecord() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'pulalend',
  });

  try {
    console.log('=== Creating Transaction Record ===\n');

    const lenderId = 3;
    const investAmount = 25000;
    const platformCommission = 500;
    const loanId = 4;
    const investmentId = 1;

    await pool.execute(
      `INSERT INTO transactions 
       (user_id, transaction_type, amount, description, reference_id, reference_type, status, created_at) 
       VALUES (?, 'investment', ?, ?, ?, 'investment', 'completed', NOW())`,
      [
        lenderId,
        investAmount,
        `Investment in loan #${loanId} (2% platform fee: P${platformCommission.toFixed(2)})`,
        investmentId
      ]
    );

    console.log(`✅ Transaction record created`);

    // Verify
    const [transactions] = await pool.execute(
      `SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [lenderId]
    );

    if (transactions.length > 0) {
      console.log('\n=== Transaction Details ===');
      console.log(`ID: ${transactions[0].id}`);
      console.log(`Type: ${transactions[0].transaction_type}`);
      console.log(`Amount: P${Number(transactions[0].amount).toLocaleString()}`);
      console.log(`Description: ${transactions[0].description}`);
      console.log(`Status: ${transactions[0].status}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createTransactionRecord();
