const express = require('express');
const { getPool, sql } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { createInvoice, createNotification } = require('./invoice');

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

    // Look up user's tier and VIP benefits
    let memberDiscount = 0;
    let freeShip = false;
    let pointMultiplier = 1;
    let vipLevel = null;

    const userData = await pool.request()
      .input('userId', sql.Int, req.userId)
      .query(`SELECT MaHang, DiemTichLuy FROM NguoiDung WHERE MaNguoiDung = @userId`);

    if (userData.recordset.length > 0) {
      const maHang = userData.recordset[0].MaHang || 1;

      // Get tier discount
      const rankData = await pool.request()
        .input('maHang', sql.Int, maHang)
        .query(`SELECT PhanTramGiam, MienPhiVanChuyen, HeSoTichDiem FROM HangThanhVien WHERE MaHang = @maHang`);
      if (rankData.recordset.length > 0) {
        memberDiscount = rankData.recordset[0].PhanTramGiam || 0;
        freeShip = rankData.recordset[0].MienPhiVanChuyen === 1;
        pointMultiplier = parseFloat(rankData.recordset[0].HeSoTichDiem) || 1;
      }

      // Check VIP (override if better)
      const vipData = await pool.request()
        .input('userId', sql.Int, req.userId)
        .query(`
          SELECT dv.MaGiaDichVu, dv.NgayKetThuc FROM DichVuVIPNguoiDung dv
          WHERE dv.MaNguoiDung = @userId AND dv.TrangThai = N'DANG_HOAT_DONG'
        `);
      if (vipData.recordset.length > 0) {
        const vip = vipData.recordset[0];
        if (new Date(vip.NgayKetThuc) > new Date()) {
          const vipDiscounts = { 1: 5, 2: 8, 3: 12 };
          const vipMultipliers = { 1: 2, 2: 3, 3: 5 };
          memberDiscount = Math.max(memberDiscount, vipDiscounts[vip.MaGiaDichVu] || 0);
          vipLevel = vip.MaGiaDichVu;
          freeShip = true;
          pointMultiplier = Math.max(pointMultiplier, vipMultipliers[vip.MaGiaDichVu] || 1);
        }
      }
    }

    // Calculate coupon discount
    let couponDiscount = 0;
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
            couponDiscount = (totalAmount * couponData.GiaTriGiam) / 100;
            if (couponData.GiamToiDa) {
              couponDiscount = Math.min(couponDiscount, couponData.GiamToiDa);
            }
          } else {
            couponDiscount = couponData.GiaTriGiam;
          }
        }
      }
    }

    // Apply the better discount between member/VIP and coupon (not stacked)
    const memberDiscountAmount = memberDiscount > 0 ? (totalAmount * memberDiscount) / 100 : 0;
    // Caps: Hạng TV tối đa 100K, VIP Tháng 200K, VIP Quý 500K, VIP Năm 1M
    const capMaps = { default: 100000, 1: 200000, 2: 500000, 3: 1000000 };
    const cap = capMaps[vipLevel] || capMaps.default;
    const cappedMemberDiscount = Math.min(memberDiscountAmount, cap);
    let discount = Math.max(cappedMemberDiscount, couponDiscount);
    const finalAmount = totalAmount - discount;
    const shippingFee = freeShip ? 0 : (finalAmount > 500000 ? 0 : 30000);

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

      // Notify shop owner about new order
      const shopOwner = await pool
        .request()
        .input('maCuaHang', sql.Int, parseInt(shopId))
        .query('SELECT MaNguoiDung FROM CuaHang WHERE MaCuaHang = @maCuaHang');

      if (shopOwner.recordset.length > 0) {
        const sellerId = shopOwner.recordset[0].MaNguoiDung;

        // Get buyer name
        const buyer = await pool
          .request()
          .input('userId', sql.Int, req.userId)
          .query('SELECT HoTen FROM NguoiDung WHERE MaNguoiDung = @userId');

        const buyerName = buyer.recordset[0]?.HoTen || 'Khach hang';

        await pool
          .request()
          .input('maNguoiDung', sql.Int, sellerId)
          .input('tieuDe', sql.NVarChar, 'Don hang moi')
          .input('noiDung', sql.NVarChar, 'Ban co don hang moi #' + orderId + ' tu khach hang ' + buyerName)
          .input('loaiThongBao', sql.NVarChar, 'DON_HANG')
          .input('maThamChieu', sql.Int, orderId)
          .query(`
            INSERT INTO ThongBao (MaNguoiDung, TieuDe, NoiDung, LoaiThongBao, MaThamChieu)
            VALUES (@maNguoiDung, @tieuDe, @noiDung, @loaiThongBao, @maThamChieu)
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

    // Accumulate points (1 point per 10,000₩ spent × multiplier)
    const pointsEarned = Math.floor((finalAmount / 10000) * pointMultiplier);
    if (pointsEarned > 0) {
      await pool.request()
        .input('userId', sql.Int, req.userId)
        .input('diem', sql.Int, pointsEarned)
        .query('UPDATE NguoiDung SET DiemTichLuy = ISNULL(DiemTichLuy, 0) + @diem WHERE MaNguoiDung = @userId');

      // Log point history
      await pool.request()
        .input('userId', sql.Int, req.userId)
        .input('diem', sql.Decimal(15, 2), pointsEarned)
        .input('lyDo', sql.NVarChar, 'Tích điểm từ đơn hàng #' + orderIds.join(', '))
        .query(`INSERT INTO LichSuThayDoiDiem (MaNguoiDung, DiemThanh, LoaiThay, LyDo, LoaiMaThamChieu)
                VALUES (@userId, @diem, 1, @lyDo, 'DON_HANG')`);

      // Auto-upgrade member tier
      const newPoints = await pool.request()
        .input('userId', sql.Int, req.userId)
        .query('SELECT DiemTichLuy FROM NguoiDung WHERE MaNguoiDung = @userId');
      const totalPoints = newPoints.recordset[0]?.DiemTichLuy || 0;

      const newTier = await pool.request()
        .input('diem', sql.Int, totalPoints)
        .query('SELECT TOP 1 MaHang, TenHang FROM HangThanhVien WHERE DiemToiThieu <= @diem ORDER BY DiemToiThieu DESC');
      if (newTier.recordset.length > 0) {
        const oldTier = await pool.request()
          .input('userId', sql.Int, req.userId)
          .query(`
            SELECT ht.TenHang FROM NguoiDung nd
            JOIN HangThanhVien ht ON nd.MaHang = ht.MaHang
            WHERE nd.MaNguoiDung = @userId
          `);
        const oldTierName = oldTier.recordset[0]?.TenHang || '';
        const newTierName = newTier.recordset[0].TenHang;

        await pool.request()
          .input('userId', sql.Int, req.userId)
          .input('maHang', sql.Int, newTier.recordset[0].MaHang)
          .query('UPDATE NguoiDung SET MaHang = @maHang WHERE MaNguoiDung = @userId');

        // Notify if tier upgraded
        if (oldTierName !== newTierName) {
          await createNotification(pool, req.userId,
            'Chúc mừng lên hạng!',
            `Bạn đã được nâng từ "${oldTierName}" lên "${newTierName}"! Cảm ơn bạn đã mua sắm tại MartHub.`,
            'HE_THONG', null
          );
        }
      }
    }

    // Create invoices for each order
    for (const orderId of orderIds) {
      await createInvoice(pool, req.userId, 'DON_HANG', orderId, totalAmount * (orderIds.length > 1 ? 0 : 1),
        discount, shippingFee, finalAmount + shippingFee, phuongThucThanhToan,
        'Thanh toán đơn hàng #' + orderId);
    }

    // Notify buyer
    await createNotification(pool, req.userId,
      'Đặt hàng thành công!',
      'Đơn hàng #' + orderIds.join(', #') + ' đã được tạo thành công với tổng tiền ' + (finalAmount + shippingFee).toLocaleString('vi-VN') + '₫.',
      'DON_HANG', orderIds[0]
    );

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
      .input('userId', sql.Int, req.userId)
      .query(`
        SELECT ctdh.*, sp.TenSanPham, sp.MaSanPham, pbsn.MauSac, pbsn.KichThuoc,
          (SELECT TOP 1 ha.DuongDanAnh FROM HinhAnhSanPham ha WHERE ha.MaSanPham = sp.MaSanPham AND ha.LaAnhChinh = 1) as AnhSanPham,
          CASE WHEN EXISTS (
            SELECT 1 FROM DanhGiaSanPham dg 
            WHERE dg.MaSanPham = sp.MaSanPham AND dg.MaDonHang = @orderId AND dg.MaNguoiDung = @userId
          ) THEN 1 ELSE 0 END as DaDanhGia
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

      // Notify buyer about cancellation
      await createNotification(pool, req.userId,
        'Đơn hàng đã hủy',
        'Đơn hàng #' + orderId + ' đã được hủy thành công.',
        'DON_HANG', orderId
      );

      // Notify shop owner about cancellation
    const orderInfo = await pool
      .request()
      .input('orderId', sql.Int, orderId)
      .query(`
        SELECT dh.MaCuaHang, ch.MaNguoiDung AS SellerId
        FROM DonHang dh
        JOIN CuaHang ch ON dh.MaCuaHang = ch.MaCuaHang
        WHERE dh.MaDonHang = @orderId
      `);

    if (orderInfo.recordset.length > 0) {
      const buyer = await pool
        .request()
        .input('userId', sql.Int, req.userId)
        .query('SELECT HoTen FROM NguoiDung WHERE MaNguoiDung = @userId');

      const buyerName = buyer.recordset[0]?.HoTen || 'Khach hang';

      await pool
        .request()
        .input('maNguoiDung', sql.Int, orderInfo.recordset[0].SellerId)
        .input('tieuDe', sql.NVarChar, 'Don hang bi huy')
        .input('noiDung', sql.NVarChar, 'Don hang #' + orderId + ' da bi huy boi ' + buyerName)
        .input('loaiThongBao', sql.NVarChar, 'DON_HANG')
        .input('maThamChieu', sql.Int, orderId)
        .query(`
          INSERT INTO ThongBao (MaNguoiDung, TieuDe, NoiDung, LoaiThongBao, MaThamChieu)
          VALUES (@maNguoiDung, @tieuDe, @noiDung, @loaiThongBao, @maThamChieu)
        `);
    }

    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
