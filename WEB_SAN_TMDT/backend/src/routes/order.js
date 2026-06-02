const express = require('express');
const { getPool, sql } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { maDiaChi, maKhuyenMai, phuongThucThanhToan } = req.body;
    const pool = await getPool();

    // Get cart items
    const cartItems = await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .query(`
        SELECT cg.*, pbsn.GiaBan, pbsn.MaSanPham, sp.MaCuaHang
        FROM ChiTietGioHang cg
        JOIN PhienBanSanPham pbsn ON cg.MaPhienBan = pbsn.MaPhienBan
        JOIN SanPham sp ON pbsn.MaSanPham = sp.MaSanPham
        WHERE cg.MaNguoiDung = @userId
      `);

    if (cartItems.recordset.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Group by shop
    const ordersByShop = {};
    let totalAmount = 0;

    cartItems.recordset.forEach(item => {
      if (!ordersByShop[item.MaCuaHang]) {
        ordersByShop[item.MaCuaHang] = [];
      }
      const itemTotal = item.GiaBan * item.SoLuong;
      totalAmount += itemTotal;
      ordersByShop[item.MaCuaHang].push(item);
    });

    // Calculate discount if any
    let discount = 0;
    if (maKhuyenMai) {
      const coupon = await pool
        .request()
        .input('maKhuyenMai', sql.Int, maKhuyenMai)
        .query(`
          SELECT * FROM MaKhuyenMai 
          WHERE MaKhuyenMai = @maKhuyenMai 
          AND TuNgay <= GETDATE() AND DenNgay >= GETDATE()
          AND DaSuDung < GioiHanSuDung
        `);

      if (coupon.recordset.length > 0) {
        const couponData = coupon.recordset[0];
        if (totalAmount >= couponData.DonHangToiThieu) {
          if (couponData.LoaiGiamGia === 'PHAN_TRAM') {
            discount = (totalAmount * couponData.GiaTriGiam) / 100;
            if (couponData.GiamToiDa) {
              discount = Math.min(discount, couponData.GiamToiDa);
            }
          } else {
            discount = couponData.GiaTriGiam;
          }
        }
      }
    }

    const finalAmount = totalAmount - discount;
    const shippingFee = finalAmount > 500000 ? 0 : 30000;

    // Create orders for each shop
    const orderIds = [];
    for (const [shopId, items] of Object.entries(ordersByShop)) {
      const shopTotal = items.reduce((sum, item) => sum + (item.GiaBan * item.SoLuong), 0);

      const orderResult = await pool
        .request()
        .input('userId', sql.Int, req.userId)
        .input('maCuaHang', sql.Int, parseInt(shopId))
        .input('maDiaChi', sql.Int, maDiaChi)
        .input('maKhuyenMai', sql.Int, maKhuyenMai || null)
        .input('tongTien', sql.Decimal(15, 2), shopTotal)
        .input('tienGiamGia', sql.Decimal(15, 2), discount * (shopTotal / totalAmount))
        .input('tienThanhToan', sql.Decimal(15, 2), shopTotal - (discount * (shopTotal / totalAmount)) + shippingFee)
        .input('phuongThucThanhToan', sql.NVarChar, phuongThucThanhToan)
        .input('phiVanChuyen', sql.Decimal(15, 2), shippingFee)
        .query(`
          INSERT INTO DonHang (MaNguoiDung, MaCuaHang, MaDiaChi, MaKhuyenMai, 
            TongTien, TienGiamGia, TienThanhToan, PhuongThucThanhToan, PhiVanChuyen)
          OUTPUT INSERTED.MaDonHang
          VALUES (@userId, @maCuaHang, @maDiaChi, @maKhuyenMai, 
            @tongTien, @tienGiamGia, @tienThanhToan, @phuongThucThanhToan, @phiVanChuyen)
        `);

      const orderId = orderResult.recordset[0].MaDonHang;
      orderIds.push(orderId);

      // Add order details
      for (const item of items) {
        await pool
          .request()
          .input('maDonHang', sql.Int, orderId)
          .input('maPhienBan', sql.Int, item.MaPhienBan)
          .input('soLuong', sql.Int, item.SoLuong)
          .input('giaLucMua', sql.Decimal, item.GiaBan)
          .query(`
            INSERT INTO ChiTietDonHang (MaDonHang, MaPhienBan, SoLuong, GiaLucMua)
            VALUES (@maDonHang, @maPhienBan, @soLuong, @giaLucMua)
          `);

        // Update stock
        await pool
          .request()
          .input('maPhienBan', sql.Int, item.MaPhienBan)
          .input('soLuong', sql.Int, item.SoLuong)
          .query(`
            UPDATE PhienBanSanPham 
            SET SoLuongTonKho = SoLuongTonKho - @soLuong 
            WHERE MaPhienBan = @maPhienBan
          `);
      }
    }

    // Clear cart
    await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .query('DELETE FROM ChiTietGioHang WHERE MaNguoiDung = @userId');

    // Update coupon usage
    if (maKhuyenMai) {
      await pool
        .request()
        .input('maKhuyenMai', sql.Int, maKhuyenMai)
        .query('UPDATE MaKhuyenMai SET DaSuDung = DaSuDung + 1 WHERE MaKhuyenMai = @maKhuyenMai');

      await pool
        .request()
        .input('userId', sql.Int, req.userId)
        .input('maKhuyenMai', sql.Int, maKhuyenMai)
        .query("UPDATE KhuyenMaiNguoiDung SET TrangThai = N'DA_SU_DUNG' WHERE MaNguoiDung = @userId AND MaKhuyenMai = @maKhuyenMai");
    }

    res.status(201).json({
      success: true,
      message: 'Orders created successfully',
      orderIds,
      totalAmount: finalAmount + shippingFee
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const orders = await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .query(`
        SELECT dh.*, ch.TenCuaHang
        FROM DonHang dh
        JOIN CuaHang ch ON dh.MaCuaHang = ch.MaCuaHang
        WHERE dh.MaNguoiDung = @userId
        ORDER BY dh.NgayTao DESC
      `);

    res.json({ success: true, data: orders.recordset });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get order detail
router.get('/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const pool = await getPool();

    const order = await pool
      .request()
      .input('orderId', sql.Int, orderId)
      .input('userId', sql.Int, req.userId)
      .query(`
        SELECT * FROM DonHang 
        WHERE MaDonHang = @orderId AND MaNguoiDung = @userId
      `);

    if (order.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const orderDetails = await pool
      .request()
      .input('orderId', sql.Int, orderId)
      .query(`
        SELECT ctdh.*, sp.TenSanPham, pbsn.MauSac, pbsn.KichThuoc
        FROM ChiTietDonHang ctdh
        JOIN PhienBanSanPham pbsn ON ctdh.MaPhienBan = pbsn.MaPhienBan
        JOIN SanPham sp ON pbsn.MaSanPham = sp.MaSanPham
        WHERE ctdh.MaDonHang = @orderId
      `);

    const orderData = order.recordset[0];
    orderData.items = orderDetails.recordset;

    res.json({ success: true, data: orderData });
  } catch (error) {
    console.error('Get order detail error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Cancel order
router.put('/:orderId/cancel', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const pool = await getPool();

    const order = await pool
      .request()
      .input('orderId', sql.Int, orderId)
      .input('userId', sql.Int, req.userId)
      .query('SELECT * FROM DonHang WHERE MaDonHang = @orderId AND MaNguoiDung = @userId');

    if (order.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.recordset[0].TrangThaiDonHang !== 'CHO_XAC_NHAN') {
      return res.status(400).json({ success: false, message: 'Cannot cancel this order' });
    }

    await pool
      .request()
      .input('orderId', sql.Int, orderId)
      .query('UPDATE DonHang SET TrangThaiDonHang = N\'DA_HUY\' WHERE MaDonHang = @orderId');

    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
