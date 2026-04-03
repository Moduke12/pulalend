const mysql = require('mysql2/promise');

async function checkLenderProfileStructure() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pulalend'
  });

  try {
    console.log('=== Lender Profile Table Structure ===\n');
    
    const [columns] = await connection.execute(
      'DESCRIBE lender_profiles'
    );

    columns.forEach(col => {
      console.log(`${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    console.log('\n=== Current Lender Data ===\n');

    const [lenders] = await connection.execute(
      'SELECT * FROM lender_profiles'
    );

    if (lenders.length === 0) {
      console.log('No lender profiles found');
    } else {
      lenders.forEach((lender, idx) => {
        console.log(`${idx + 1}. User ID: ${lender.user_id}`);
        Object.keys(lender).forEach(key => {
          if (key !== 'user_id') {
            console.log(`   ${key}: ${lender[key]}`);
          }
        });
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkLenderProfileStructure().catch(console.error);
