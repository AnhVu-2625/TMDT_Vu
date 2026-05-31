const sql = require('mssql');

/**
 * Xây dựng cấu hình kết nối database.
 * Hỗ trợ cả Windows Authentication (khi DB_USER rỗng)
 * và SQL Server Authentication.
 */
const buildConfig = () => {
  const useWindowsAuth = !process.env.DB_USER;

  if (useWindowsAuth) {
    // Windows Authentication – dùng cho môi trường local (LAPTOP-ANHVU)
    return {
      server: process.env.DB_SERVER || 'localhost',
      database: process.env.DB_DATABASE || 'ThuongMaiDienTu',
      options: {
        encrypt: process.env.DB_ENCRYPT === 'true' || false,
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
        enableArithAbort: true,
        trustedConnection: true
      },
      connectionTimeout: 30000,
      requestTimeout: 30000
    };
  }

  // SQL Server Authentication
  return {
    server: process.env.DB_SERVER || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'ThuongMaiDienTu',
    port: parseInt(process.env.DB_PORT || '1433'),
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true' || false,
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
      enableArithAbort: true
    },
    connectionTimeout: 30000,
    requestTimeout: 30000
  };
};

let pool = null;

async function getPool() {
  if (!pool) {
    const config = buildConfig();
    pool = new sql.ConnectionPool(config);
    pool.on('error', (err) => {
      console.error('Database pool error:', err);
      pool = null;
    });
    await pool.connect();
    console.log('✅ Database connected successfully');
    console.log(`   Server: ${config.server} | DB: ${config.database}`);
  }
  return pool;
}

async function closePool() {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('Database connection closed');
  }
}

module.exports = {
  getPool,
  closePool,
  sql
};
