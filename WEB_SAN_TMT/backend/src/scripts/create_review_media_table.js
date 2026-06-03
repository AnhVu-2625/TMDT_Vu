require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { getPool, sql } = require('../config/database');

async function main() {
  const pool = await getPool();
  
  // Create HinhAnhDanhGia table
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = N'HinhAnhDanhGia')
    CREATE TABLE HinhAnhDanhGia (
      MaHinhAnh INT IDENTITY(1,1) PRIMARY KEY,
      MaDanhGia INT NOT NULL FOREIGN KEY REFERENCES DanhGiaSanPham(MaDanhGia),
      DuongDan NVARCHAR(500) NOT NULL,
      Loai NVARCHAR(10) NOT NULL DEFAULT N'image',
      NgayTao DATETIME DEFAULT GETDATE()
    )
  `);
  console.log('HinhAnhDanhGia table ensured');
  
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
