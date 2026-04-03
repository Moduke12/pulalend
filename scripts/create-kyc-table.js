const mysql = require('mysql2/promise');

async function createKycTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pulalend'
  });

  try {
    console.log('Creating kyc_requests table...\n');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS kyc_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        id_type VARCHAR(50) NOT NULL,
        id_number VARCHAR(100) NOT NULL,
        address1 VARCHAR(255) NOT NULL,
        address2 VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL,
        id_front_path VARCHAR(500) NOT NULL,
        id_back_path VARCHAR(500),
        selfie_path VARCHAR(500) NOT NULL,
        omang_copy_path VARCHAR(500),
        payslip_path VARCHAR(500),
        status ENUM('pending', 'approved', 'rejected', 'verified') DEFAULT 'pending',
        rejection_reason TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP NULL,
        reviewer_id INT NULL,
        notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_kyc_user_status (user_id, status),
        INDEX idx_kyc_submitted (submitted_at)
      ) ENGINE=InnoDB
    `);

    console.log('✓ kyc_requests table created successfully');

    // Verify
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'kyc_requests'"
    );

    if (tables.length > 0) {
      console.log('✓ Table verified in database');
      
      // Show structure
      const [columns] = await connection.execute("DESCRIBE kyc_requests");
      console.log('\nTable structure:');
      columns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type})`);
      });
    }

  } catch (error) {
    console.error('❌ Error creating table:', error.message);
  } finally {
    await connection.end();
  }
}

createKycTable().catch(console.error);
