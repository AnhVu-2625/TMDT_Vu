const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER || 'localhost',
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'YourPassword123'
    }
  },
  options: {
    database: process.env.DB_NAME || 'ThuongMaiDienTu',
    port: parseInt(process.env.DB_PORT || '1433'),
    encrypt: true,
    trustServerCertificate: true,
    connectionTimeout: 30000,
    requestTimeout: 30000
  }
};

let pool = null;

async function getPool() {
  if (!pool) {
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('Database connected successfully');
  }
  return pool;
}

async function closePool() {
  if (pool) {
    await pool.close();
    pool = null;
  }
}

module.exports = {
  getPool,
  closePool,
  sql
};
