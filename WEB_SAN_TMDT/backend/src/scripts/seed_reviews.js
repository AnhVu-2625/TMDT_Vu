require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { getPool, sql } = require('../config/database');

const binhluan = [
  'S\u1EA3n ph\u1EA9m t\u1ED1t, \u0111\xF3ng g\xF3i c\u1EA9n th\u1EADn, giao h\xE0ng nhanh',
  'Ch\u1EA5t l\u01B0\u1EE3ng tuy\u1EC7t v\u1EDDi, r\u1EA5t \u0111\xE1ng mua',
  'H\xE0ng ch\xEDnh h\xE3ng, shop ph\u1EE5c v\u1EE5 nhi\u1EC7t t\xECnh',
  'Gi\xE1 h\u1EE3p l\xFD, s\u1EBD mua l\u1EA7n sau',
  'S\u1EA3n ph\u1EA9m \u0111\u1EB9p nh\u01B0 m\xF4 t\u1EA3, r\u1EA5t h\xE0i l\xF2ng',
  'Giao h\xE0ng nhanh, s\u1EA3n ph\u1EA9m ch\u1EA5t l\u01B0\u1EE3ng t\u1ED1t',
  'Mua l\u1EA7n th\u1EE9 hai r\u1ED3i, v\u1EABn tuy\u1EC7t v\u1EDDi',
  'Shop t\u01B0 v\u1EA5n nhi\u1EC7t t\xECnh, h\xE0ng \u0111\xFAng m\xF4 t\u1EA3',
  'R\u1EA5t h\xE0i l\xF2ng v\u1EC1 s\u1EA3n ph\u1EA9m v\xE0 d\u1ECBch v\u1EE5',
  'S\u1EA3n ph\u1EA9m t\u1ED1t, gi\xE1 r\u1EBB h\u01A1n c\xE1c shop kh\xE1c'
];

async function run() {
  const pool = await getPool();

  const prods = (await pool.request()
    .query("SELECT MaSanPham, MaCuaHang, GiaGoc FROM SanPham WHERE TrangThai = N'HOAT_DONG'")).recordset;
  console.log('Products:', prods.length);

  let users = (await pool.request()
    .query("SELECT MaNguoiDung FROM NguoiDung ORDER BY MaNguoiDung")).recordset;
  console.log('Users:', users.length);

  if (users.length < 3) {
    for (let i = 1; i <= 5; i++) {
      await pool.request()
        .input('ten', sql.NVarChar, 'Ng\u01B0\u1EDDi D\xF9ng ' + i)
        .input('email', sql.NVarChar, 'user' + i + '@test.com')
        .input('mk', sql.NVarChar, '$2b$10$dummy')
        .query("INSERT INTO NguoiDung (HoTen, Email, MatKhau, VaiTro, TrangThai) VALUES (@ten, @email, @mk, N'KHACH_HANG', N'HOAT_DONG')");
    }
    users = (await pool.request()
      .query("SELECT MaNguoiDung FROM NguoiDung ORDER BY MaNguoiDung")).recordset;
  }

  // Ensure each product has a PhienBanSanPham
  const existingPB = new Set();
  const pbCheck = (await pool.request()
    .query("SELECT DISTINCT MaSanPham FROM PhienBanSanPham")).recordset;
  pbCheck.forEach(r => existingPB.add(r.MaSanPham));

  for (const p of prods) {
    if (!existingPB.has(p.MaSanPham)) {
      await pool.request()
        .input('maSp', sql.Int, p.MaSanPham)
        .input('gia', sql.Decimal(15, 2), p.GiaGoc)
        .query("INSERT INTO PhienBanSanPham (MaSanPham, GiaBan, SoLuongTonKho) VALUES (@maSp, @gia, 10)");
    }
  }
  console.log('Ensured PhienBanSanPham for all products');

  // Clean old data in FK-safe order
  await pool.request().query('DELETE FROM DanhGiaSanPham');
  await pool.request().query('DELETE FROM YeuCauDoiTra');
  await pool.request().query('DELETE FROM ChiTietDonHang');
  await pool.request().query('DELETE FROM DonHang');
  console.log('Cleaned old orders and reviews');

  const userCount = users.length;
  let totalReviews = 0;

  for (const prod of prods) {
    const pb = (await pool.request()
      .input('maSp', sql.Int, prod.MaSanPham)
      .query("SELECT TOP 1 MaPhienBan, GiaBan FROM PhienBanSanPham WHERE MaSanPham = @maSp")).recordset[0];
    if (!pb) continue;

    const reviewCount = 2 + Math.floor(Math.random() * 4);
    const usedUsers = new Set();

    for (let i = 0; i < reviewCount; i++) {
      let uIdx = Math.floor(Math.random() * userCount);
      let attempts = 0;
      while (usedUsers.has(uIdx) && attempts < 20) {
        uIdx = Math.floor(Math.random() * userCount);
        attempts++;
      }
      if (usedUsers.has(uIdx)) continue;
      usedUsers.add(uIdx);
      const userId = users[uIdx].MaNguoiDung;

      const ngayTao = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);
      const gia = Number(pb.GiaBan) || Number(prod.GiaGoc);
      const tongTien = gia;

      // Create order
      const dh = await pool.request()
        .input('maNd', sql.Int, userId)
        .input('maCh', sql.Int, prod.MaCuaHang)
        .input('tongTien', sql.Decimal(15, 2), tongTien)
        .input('tienTT', sql.Decimal(15, 2), tongTien)
        .input('pttt', sql.NVarChar, 'TIEN_MAT')
        .input('tttt', sql.NVarChar, 'DA_THANH_TOAN')
        .input('ngayTao', sql.DateTime, ngayTao)
        .query(`INSERT INTO DonHang (MaNguoiDung, MaCuaHang, TongTien, TienThanhToan, PhuongThucThanhToan, TrangThaiThanhToan, TrangThaiDonHang, NgayTao)
                OUTPUT INSERTED.MaDonHang
                VALUES (@maNd, @maCh, @tongTien, @tienTT, @pttt, @tttt, N'DA_GIAO', @ngayTao)`);
      const maDH = dh.recordset[0].MaDonHang;

      await pool.request()
        .input('maDh', sql.Int, maDH)
        .input('maPb', sql.Int, pb.MaPhienBan)
        .input('sl', sql.Int, 1)
        .input('gia', sql.Decimal(15, 2), gia)
        .query("INSERT INTO ChiTietDonHang (MaDonHang, MaPhienBan, SoLuong, GiaLucMua) VALUES (@maDh, @maPb, @sl, @gia)");

      const diem = 3 + Math.floor(Math.random() * 3);
      const bl = binhluan[Math.floor(Math.random() * binhluan.length)];
      await pool.request()
        .input('maSp', sql.Int, prod.MaSanPham)
        .input('maNd', sql.Int, userId)
        .input('maDh', sql.Int, maDH)
        .input('diem', sql.Int, diem)
        .input('bl', sql.NVarChar, bl)
        .input('ngayTao', sql.DateTime, ngayTao)
        .query("INSERT INTO DanhGiaSanPham (MaSanPham, MaNguoiDung, MaDonHang, DiemDanhGia, BinhLuan, NgayTao) VALUES (@maSp, @maNd, @maDh, @diem, @bl, @ngayTao)");
      totalReviews++;
    }
  }

  await pool.request().query(`
    UPDATE SanPham SET DanhGiaTrungBinh = (
      SELECT ISNULL(CAST(AVG(CAST(DiemDanhGia AS FLOAT)) AS DECIMAL(3,1)), 0)
      FROM DanhGiaSanPham WHERE MaSanPham = SanPham.MaSanPham
    )
  `);

  console.log('Total reviews added:', totalReviews);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
