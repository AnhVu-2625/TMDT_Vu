require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { getPool } = require('../config/database');

async function main() {
  const p = await getPool();
  const r = await p.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME");
  console.log('Tables:');
  r.recordset.forEach(t => console.log(' ', t.TABLE_NAME));
  
  // Check if DanhGiaSanPham has media columns
  const r2 = await p.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'DanhGiaSanPham'");
  console.log('\nDanhGiaSanPham columns:');
  r2.recordset.forEach(c => console.log(' ', c.COLUMN_NAME, c.DATA_TYPE));
  
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
