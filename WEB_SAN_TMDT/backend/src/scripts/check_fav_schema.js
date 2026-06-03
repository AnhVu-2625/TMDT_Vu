require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { getPool, sql } = require('../config/database');

async function check() {
  const pool = await getPool();
  const cols = await pool.request().query(`
    SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_DEFAULT, DATA_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = N'DanhSachYeuThich'
  `);
  console.log('DanhSachYeuThich columns:');
  cols.recordset.forEach(c => console.log(' ', c.COLUMN_NAME, '|', c.DATA_TYPE, '| Nullable:', c.IS_NULLABLE, '| Default:', c.COLUMN_DEFAULT));
  const products = await pool.request().query('SELECT TOP 3 MaSanPham, TenSanPham, TrangThai FROM SanPham ORDER BY MaSanPham DESC');
  console.log('\nLatest products:');
  products.recordset.forEach(p => console.log(' ', p.MaSanPham, '-', p.TenSanPham, '-', p.TrangThai));
  if (products.recordset.length > 0) {
    const maxP = products.recordset[0];
    try {
      console.log('\nTest insert MaSanPham =', maxP.MaSanPham, '...');
      const r = await pool.request()
        .input('userId', sql.Int, 7)
        .input('maSanPham', sql.Int, maxP.MaSanPham)
        .query('INSERT INTO DanhSachYeuThich (MaNguoiDung, MaSanPham) OUTPUT INSERTED.MaYeuThich VALUES (@userId, @maSanPham)');
      console.log(' OK, inserted MaYeuThich =', r.recordset[0].MaYeuThich);
      await pool.request()
        .input('userId', sql.Int, 7)
        .input('maSanPham', sql.Int, maxP.MaSanPham)
        .query('DELETE FROM DanhSachYeuThich WHERE MaNguoiDung=@userId AND MaSanPham=@maSanPham');
      console.log(' Cleaned up');
    } catch (e) { console.log(' FAILED:', e.message); }
  }
  process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });
