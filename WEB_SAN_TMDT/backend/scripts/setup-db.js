/**
 * Script tự động chạy schema.sql + seed.sql lên SQL Server
 * Chạy: node scripts/setup-db.js
 */
require('dotenv').config();
const sql = require('mssql');
const fs = require('fs');
const path = require('path');

const useWindowsAuth = !process.env.DB_USER;

const config = useWindowsAuth
  ? {
      server: process.env.DB_SERVER || 'LAPTOP-ANHVU',
      database: 'master',
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        trustedConnection: true,
      },
      connectionTimeout: 30000,
    }
  : {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      server: process.env.DB_SERVER || 'LAPTOP-ANHVU',
      database: 'master',
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
      connectionTimeout: 30000,
    };


async function runSqlFile(pool, filePath, label) {
  console.log(`\n📄 Running ${label}...`);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Tách theo GO statement
  const batches = content.split(/^\s*GO\s*$/im).filter(b => b.trim());
  
  let success = 0;
  for (const batch of batches) {
    if (!batch.trim()) continue;
    try {
      await pool.request().query(batch);
      success++;
    } catch (err) {
      // Bỏ qua lỗi "đã tồn tại" (duplicate) khi seed
      if (err.message.includes('already exists') || 
          err.message.includes('duplicate key') ||
          err.message.includes('Cannot drop')) {
        // Skip
      } else {
        console.warn(`  ⚠️  Warning in batch: ${err.message.substring(0, 100)}`);
      }
    }
  }
  console.log(`  ✅ Done (${success}/${batches.length} batches)`);
}

async function main() {
  console.log('===========================================');
  console.log('   MartHub Database Setup Script');
  console.log('===========================================');
  console.log(`Server : ${config.server}`);
  console.log(`User   : ${config.user}`);

  let pool;
  try {
    pool = await sql.connect(config);
    console.log('\n✅ Connected to SQL Server');

    const dbDir = path.join(__dirname, '../../database');

    // 1. Chạy schema (tạo DB + tables)
    await runSqlFile(pool, path.join(dbDir, 'schema.sql'), 'schema.sql');

    // 2. Switch sang ThuongMaiDienTu database
    await pool.close();
    const dbConfig = { ...config, database: 'ThuongMaiDienTu' };
    pool = await sql.connect(dbConfig);

    // 3. Chạy seed data
    await runSqlFile(pool, path.join(dbDir, 'seed.sql'), 'seed.sql');

    console.log('\n===========================================');
    console.log('✅ DATABASE SETUP COMPLETE!');
    console.log('===========================================');
    console.log('');
    console.log('📋 TÀI KHOẢN TEST:');
    console.log('  ADMIN  : admin@marthub.vn  / Admin@123');
    console.log('  SELLER : seller@marthub.vn / Seller@123');
    console.log('  USER   : user@marthub.vn   / User@123');
    console.log('');
    console.log('🛒 Cửa hàng: "Tech Store Official" (seller)');
    console.log('📦 Sản phẩm: 4 sản phẩm mẫu');
    console.log('🎫 Khuyến mãi: WELCOME10, SALE50K, VIP20');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  } finally {
    if (pool) await pool.close();
  }
}

main();
