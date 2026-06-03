const { getPool, sql } = require('./src/config/database');

(async () => {
  const pool = await getPool();
  
  // Check tables
  const tables = await pool.request().query(`
    SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'
  `);
  console.log('Tables:', tables.recordset.map(t => t.TABLE_NAME).join(', '));
  
  // Check YeuCauRutTien structure
  const ycrt = await pool.request().query(`
    SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = N'YeuCauRutTien'
  `);
  console.log('\nYeuCauRutTien columns:', JSON.stringify(ycrt.recordset, null, 2));
  
  // Check MaKhuyenMai structure
  const mkm = await pool.request().query(`
    SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = N'MaKhuyenMai'
  `);
  console.log('\nMaKhuyenMai columns:', JSON.stringify(mkm.recordset, null, 2));

  // Check CuaHang columns for finance
  const ch = await pool.request().query(`
    SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = N'CuaHang'
  `);
  console.log('\nCuaHang columns:', JSON.stringify(ch.recordset, null, 2));
  
  // Check DonHang for finance queries
  const dh = await pool.request().query(`
    SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = N'DonHang'
  `);
  console.log('\nDonHang columns:', JSON.stringify(dh.recordset, null, 2));
  
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
