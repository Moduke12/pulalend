const mysql = require('mysql2/promise');

async function updateKycPaths() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'pulalend',
  });

  try {
    console.log('=== Updating KYC file paths in database ===\n');

    // Get all KYC records
    const [rows] = await pool.execute(
      'SELECT id, id_front_path, id_back_path, selfie_path, omang_copy_path, payslip_path FROM kyc_requests'
    );

    console.log(`Found ${rows.length} KYC record(s)\n`);

    for (const row of rows) {
      const updates = [];
      const params = [];

      // Check and update each path field
      if (row.id_front_path && !row.id_front_path.startsWith('/')) {
        updates.push('id_front_path = ?');
        params.push('/' + row.id_front_path);
        console.log(`  id_front_path: ${row.id_front_path} -> /${row.id_front_path}`);
      }

      if (row.id_back_path && !row.id_back_path.startsWith('/')) {
        updates.push('id_back_path = ?');
        params.push('/' + row.id_back_path);
        console.log(`  id_back_path: ${row.id_back_path} -> /${row.id_back_path}`);
      }

      if (row.selfie_path && !row.selfie_path.startsWith('/')) {
        updates.push('selfie_path = ?');
        params.push('/' + row.selfie_path);
        console.log(`  selfie_path: ${row.selfie_path} -> /${row.selfie_path}`);
      }

      if (row.omang_copy_path && !row.omang_copy_path.startsWith('/')) {
        updates.push('omang_copy_path = ?');
        params.push('/' + row.omang_copy_path);
        console.log(`  omang_copy_path: ${row.omang_copy_path} -> /${row.omang_copy_path}`);
      }

      if (row.payslip_path && !row.payslip_path.startsWith('/')) {
        updates.push('payslip_path = ?');
        params.push('/' + row.payslip_path);
        console.log(`  payslip_path: ${row.payslip_path} -> /${row.payslip_path}`);
      }

      if (updates.length > 0) {
        params.push(row.id);
        const query = `UPDATE kyc_requests SET ${updates.join(', ')} WHERE id = ?`;
        await pool.execute(query, params);
        console.log(`✅ Updated KYC record #${row.id}\n`);
      } else {
        console.log(`⏭️  KYC record #${row.id} already has correct paths\n`);
      }
    }

    // Verify the changes
    console.log('=== Verifying updated paths ===');
    const [updated] = await pool.execute(
      'SELECT id, id_front_path, selfie_path FROM kyc_requests'
    );

    for (const row of updated) {
      console.log(`KYC #${row.id}: id_front_path = ${row.id_front_path}`);
    }

    console.log('\n✅ All paths updated successfully');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

updateKycPaths();
