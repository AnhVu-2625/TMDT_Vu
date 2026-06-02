/**
 * Kiểm tra xem msnodesqlv8 đã được cài chưa
 */
function isMsnodesqlv8Available() {
  try {
    require('msnodesqlv8');
    return true;
  } catch {
    return false;
  }
}

// ── Chọn driver đúng ──────────────────────────────────────────
// Khi dùng Windows Auth cần require('mssql/msnodesqlv8')
// Khi dùng SQL Auth dùng require('mssql') mặc định (tedious)
const useWindowsAuth = !process.env.DB_USER && isMsnodesqlv8Available();
const sql = useWindowsAuth
  ? require('mssql/msnodesqlv8')
  : require('mssql');

/**
 * Xây dựng cấu hình kết nối database.
 */
const buildConfig = () => {
  const server = process.env.DB_SERVER || 'localhost';
  const database = process.env.DB_DATABASE || 'ThuongMaiDienTu';

  // ── Option 1: SQL Server Authentication ──────────────────────
  if (process.env.DB_USER) {
    console.log('🔑 Sử dụng SQL Server Authentication');
    console.log(`   Server: ${server} | DB: ${database} | User: ${process.env.DB_USER}`);
    return {
      server,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database,
      port: parseInt(process.env.DB_PORT || '1433'),
      options: {
        encrypt: process.env.DB_ENCRYPT === 'true' || false,
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
        enableArithAbort: true
      },
      connectionTimeout: 15000,
      requestTimeout: 15000
    };
  }

  // ── Option 2: Windows Authentication (msnodesqlv8) ──────────
  if (useWindowsAuth) {
    // Detect ODBC driver version
    const driver = process.env.DB_ODBC_DRIVER || 'ODBC Driver 18 for SQL Server';
    console.log('🪟 Sử dụng Windows Authentication (msnodesqlv8)');
    console.log(`   ODBC Driver: ${driver}`);
    console.log(`   Server: ${server} | DB: ${database}`);

    return {
      connectionString: `Driver={${driver}};Server=${server};Database=${database};Trusted_Connection=Yes;TrustServerCertificate=Yes;`
    };
  }

  // ── Option 3: Không có cách nào ─────────────────────────────
  console.error('');
  console.error('╔══════════════════════════════════════════════════════════════╗');
  console.error('║  ❌ KHÔNG THỂ KẾT NỐI DATABASE                             ║');
  console.error('║                                                              ║');
  console.error('║  Chọn 1 trong 2 cách:                                        ║');
  console.error('║                                                              ║');
  console.error('║  📌 Cách 1: SQL Server Authentication                        ║');
  console.error('║     Thêm vào file backend/.env:                              ║');
  console.error('║       DB_USER=sa                                             ║');
  console.error('║       DB_PASSWORD=YourPassword123                            ║');
  console.error('║                                                              ║');
  console.error('║  📌 Cách 2: Windows Authentication                           ║');
  console.error('║     Chạy: npm install msnodesqlv8                            ║');
  console.error('║     (Cần ODBC Driver 17/18 for SQL Server đã cài)            ║');
  console.error('╚══════════════════════════════════════════════════════════════╝');
  console.error('');

  return {
    server,
    database,
    options: { encrypt: false, trustServerCertificate: true, enableArithAbort: true },
    connectionTimeout: 5000,
    requestTimeout: 5000
  };
};

let pool = null;

async function getPool() {
  if (!pool) {
    const config = buildConfig();
    try {
      pool = new sql.ConnectionPool(config);
      pool.on('error', (err) => {
        console.error('Database pool error:', err);
        pool = null;
      });
      await pool.connect();
      console.log('✅ Database connected successfully');
    } catch (err) {
      pool = null;
      console.error('❌ Database connection error:', err.message);

      // Auto-retry: nếu ODBC 18 fail, thử ODBC 17
      if (config.connectionString && config.connectionString.includes('ODBC Driver 18')) {
        console.log('🔄 Thử lại với ODBC Driver 17...');
        const retryConfig = {
          connectionString: config.connectionString.replace(
            'ODBC Driver 18 for SQL Server',
            'ODBC Driver 17 for SQL Server'
          )
        };
        try {
          pool = new sql.ConnectionPool(retryConfig);
          pool.on('error', (e) => { console.error('Database pool error:', e); pool = null; });
          await pool.connect();
          console.log('✅ Database connected successfully (ODBC Driver 17)');
          return pool;
        } catch (err2) {
          pool = null;
          console.error('❌ ODBC Driver 17 cũng thất bại:', err2.message);
        }
      }

      throw err;
    }
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
