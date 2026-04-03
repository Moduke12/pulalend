const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('Testing database connection...');
  
  const config = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'pulalend',
    connectTimeout: 10000
  };
  
  console.log('Host:', config.host);
  console.log('Database:', config.database);
  console.log('User:', config.user);
  
  try {
    const connection = await mysql.createConnection(config);

    console.log('✓ Database connection successful!');
    
    // Test query
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log('✓ Users table accessible, count:', rows[0].count);
    
    await connection.end();
    console.log('✓ Connection closed');
  } catch (error) {
    console.error('✗ Database connection failed:');
    console.error('Error:', error.message);
    if (error.code) console.error('Code:', error.code);
  }
}

testConnection();
