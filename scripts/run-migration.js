const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: 'srv1039.hstgr.io',
    user: 'u400281421_pulalend',
    password: 'Lendingpula@2025',
    database: 'u400281421_pulalend',
    port: 3306
  });

  try {
    console.log('Connected to database');
    
    // Read migration file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '..', 'database', 'migration-lender-preferences.sql'),
      'utf8'
    );
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...');
      await connection.execute(statement);
      console.log('✓ Success');
    }
    
    console.log('\n✓ Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
