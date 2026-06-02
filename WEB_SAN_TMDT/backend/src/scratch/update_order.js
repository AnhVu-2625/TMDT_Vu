const { getPool, sql } = require('../config/database');

async function main() {
  try {
    const pool = await getPool();
    console.log('Connected to database to create test orders...');

    // 1. Get User ID
    const userResult = await pool.request()
      .input('email', sql.NVarChar, 'user@marthub.vn')
      .query('SELECT MaNguoiDung FROM NguoiDung WHERE Email = @email');

    if (userResult.recordset.length === 0) {
      console.log('User not found!');
      return;
    }
    const userId = userResult.recordset[0].MaNguoiDung;
    console.log(`Found User ID: ${userId}`);

    // 2. Get active Shop
    const shopResult = await pool.request()
      .query("SELECT TOP 1 MaCuaHang FROM CuaHang WHERE TrangThai = N'HOAT_DONG'");
    if (shopResult.recordset.length === 0) {
      console.log('No active shops found!');
      return;
    }
    const shopId = shopResult.recordset[0].MaCuaHang;
    console.log(`Found Shop ID: ${shopId}`);

    // 3. Get Address
    let addressId;
    const addressResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT TOP 1 MaDiaChi FROM DiaChiGiaoHang WHERE MaNguoiDung = @userId');
    
    if (addressResult.recordset.length === 0) {
      console.log('Creating a mock address...');
      const addRes = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
          INSERT INTO DiaChiGiaoHang (MaNguoiDung, TenNguoiNhan, SDTNguoiNhan, DiaChiCuThe, PhuongXa, QuanHuyen, TinhThanh, LaMacDinh)
          VALUES (@userId, N'Nguyễn Văn User', '0987654321', N'123 Đường ABC', N'Phường 1', N'Quận 1', N'TP. Hồ Chí Minh', 1)
          SELECT @@IDENTITY as MaDiaChi
        `);
      addressId = addRes.recordset[0].MaDiaChi;
    } else {
      addressId = addressResult.recordset[0].MaDiaChi;
    }
    console.log(`Using Address ID: ${addressId}`);

    // 4. Get active Product Variant
    const variantResult = await pool.request()
      .input('shopId', sql.Int, shopId)
      .query(`
        SELECT TOP 1 pb.MaPhienBan, pb.GiaBan, sp.TenSanPham 
        FROM PhienBanSanPham pb
        INNER JOIN SanPham sp ON pb.MaSanPham = sp.MaSanPham
        WHERE sp.MaCuaHang = @shopId AND pb.SoLuongTonKho > 0
      `);

    if (variantResult.recordset.length === 0) {
      console.log('No active product variant found for shop!');
      return;
    }
    const variant = variantResult.recordset[0];
    console.log(`Found Product Variant: ${variant.TenSanPham} (ID: ${variant.MaPhienBan})`);

    // 5. Create a Mock Order
    const orderRes = await pool.request()
      .input('userId', sql.Int, userId)
      .input('shopId', sql.Int, shopId)
      .input('addressId', sql.Int, addressId)
      .input('total', sql.Decimal(15,2), variant.GiaBan)
      .query(`
        INSERT INTO DonHang (MaNguoiDung, MaCuaHang, MaDiaChi, TongTien, TienGiamGia, TienThanhToan, PhuongThucThanhToan, TrangThaiThanhToan, TrangThaiDonHang, PhiVanChuyen, NgayHetHanDoiTra)
        VALUES (@userId, @shopId, @addressId, @total, 0, @total, N'TIEN_MAT', N'DA_THANH_TOAN', N'DA_GIAO', 20000, DATEADD(day, 7, GETDATE()))
        SELECT @@IDENTITY as MaDonHang
      `);

    const orderId = orderRes.recordset[0].MaDonHang;
    console.log(`Created Order #${orderId}`);

    // 6. Create Order Detail
    await pool.request()
      .input('orderId', sql.Int, orderId)
      .input('variantId', sql.Int, variant.MaPhienBan)
      .input('price', sql.Decimal(15,2), variant.GiaBan)
      .query(`
        INSERT INTO ChiTietDonHang (MaDonHang, MaPhienBan, SoLuong, GiaLucMua)
        VALUES (@orderId, @variantId, 1, @price)
      `);

    console.log(`Successfully created a delivered order #${orderId} with product: ${variant.TenSanPham}`);
    process.exit(0);
  } catch (error) {
    console.error('Error in script:', error);
    process.exit(1);
  }
}

main();
