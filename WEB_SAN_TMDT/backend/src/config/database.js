const sql = require('mssql');

/**
 * Xây dựng cấu hình kết nối database.
 * Hỗ trợ cả Windows Authentication (khi DB_USER rỗng)
 * và SQL Server Authentication.
 */
const buildConfig = () => {
  const useWindowsAuth = !process.env.DB_USER;

  if (useWindowsAuth) {
    // Windows Authentication – dùng cho môi trường local
    return {
      server: process.env.DB_SERVER + ',1433' || 'localhost,1433',
      database: process.env.DB_DATABASE || 'ThuongMaiDienTu',
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        trustedConnection: true,
        authentication: {
          type: 'default'
        }
      },
      connectionTimeout: 15000,
      requestTimeout: 15000
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
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
      useUTC: false,
      charset: 'UTF-8',
    },
    connectionTimeout: 15000,
    requestTimeout: 15000
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
