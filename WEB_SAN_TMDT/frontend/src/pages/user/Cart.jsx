import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaTrash, FaMinus, FaPlus, FaArrowRight, FaTag } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useCartStore } from '../../store/cartStore';

export default function Cart() {
  const { items, updateItem, removeItem, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);

  const subtotal = items.reduce((s, i) => s + (i.GiaBan || 0) * i.SoLuong, 0);
  const shipping = subtotal > 500000 ? 0 : 30000;
  const total = subtotal - couponDiscount + shipping;

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'MARTHUB10') {
      const disc = Math.round(subtotal * 0.1);
      setCouponDiscount(disc);
      toast.success(`Áp dụng mã thành công! Giảm ₫${disc.toLocaleString('vi-VN')}`);
    } else {
      toast.error('Mã khuyến mãi không hợp lệ');
    }
  };

  const mockItems = [
    { MaChiTietGioHang: 1, MaPhienBan: 1, TenSanPham: 'Samsung Galaxy S24 Ultra', MauSac: 'Đen', KichThuoc: '256GB', GiaBan: 29990000, SoLuong: 1, TenCuaHang: 'Samsung Store', image: null },
    { MaChiTietGioHang: 2, MaPhienBan: 2, TenSanPham: 'Áo thun nam cao cấp', MauSac: 'Trắng', KichThuoc: 'L', GiaBan: 450000, SoLuong: 2, TenCuaHang: 'Fashion Hub', image: null },
  ];
  const displayItems = items.length > 0 ? items : mockItems;
  const displaySubtotal = displayItems.reduce((s, i) => s + (i.GiaBan || 0) * i.SoLuong, 0);
  const displayShipping = displaySubtotal > 500000 ? 0 : 30000;
  const displayTotal = displaySubtotal - couponDiscount + displayShipping;

  if (displayItems.length === 0) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <div className="text-7xl mb-6">🛒</div>
      <h2 className="text-2xl font-bold text-white mb-3">Giỏ hàng trống</h2>
      <p className="text-slate-400 mb-8">Thêm sản phẩm vào giỏ để bắt đầu mua sắm</p>
      <Link to="/products"><button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-lg">Khám phá sản phẩm</button></Link>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <FaShoppingCart className="text-red-400" /> Giỏ hàng ({displayItems.length} sản phẩm)
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {displayItems.map((item, i) => (
            <motion.div key={item.MaChiTietGioHang} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-slate-900/70 rounded-xl border border-slate-800/50 p-4 flex gap-4">
              <div className="w-20 h-20 rounded-lg bg-slate-800 flex items-center justify-center text-3xl flex-shrink-0">
                {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover rounded-lg" /> : '📦'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 mb-1">🏪 {item.TenCuaHang}</p>
                <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2">{item.TenSanPham}</h3>
                {(item.MauSac || item.KichThuoc) && (
                  <p className="text-xs text-slate-400 mb-2">
                    {[item.MauSac, item.KichThuoc].filter(Boolean).join(' • ')}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-red-400 font-bold">₫{(item.GiaBan || 0).toLocaleString('vi-VN')}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden">
                      <button onClick={() => item.SoLuong > 1 ? updateItem(item.MaChiTietGioHang, item.SoLuong - 1) : removeItem(item.MaChiTietGioHang)}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition">
                        <FaMinus size={10} />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold text-white">{item.SoLuong}</span>
                      <button onClick={() => updateItem(item.MaChiTietGioHang, item.SoLuong + 1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition">
                        <FaPlus size={10} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.MaChiTietGioHang)}
                      className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition">
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Tổng: <span className="text-white font-semibold">₫{((item.GiaBan || 0) * item.SoLuong).toLocaleString('vi-VN')}</span>
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="bg-slate-900/70 rounded-xl border border-slate-800/50 p-4">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><FaTag className="text-red-400" /> Mã khuyến mãi</h3>
            <div className="flex gap-2">
              <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Nhập mã..." className="input-field flex-1 py-2 text-sm" />
              <button onClick={handleApplyCoupon} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition">Áp dụng</button>
            </div>
            <p className="text-xs text-slate-500 mt-2">Thử: MARTHUB10 (giảm 10%)</p>
          </div>

          {/* Summary */}
          <div className="bg-slate-900/70 rounded-xl border border-slate-800/50 p-5">
            <h3 className="font-bold text-white text-lg mb-4">Tóm tắt đơn hàng</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Tạm tính ({displayItems.length} sản phẩm)</span>
                <span>₫{displaySubtotal.toLocaleString('vi-VN')}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Giảm giá</span>
                  <span>-₫{couponDiscount.toLocaleString('vi-VN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>Phí vận chuyển</span>
                <span>{displayShipping === 0 ? <span className="text-green-400">Miễn phí</span> : `₫${displayShipping.toLocaleString('vi-VN')}`}</span>
              </div>
              <div className="border-t border-slate-700 pt-3 flex justify-between font-bold text-lg">
                <span className="text-white">Tổng cộng</span>
                <span className="text-red-400">₫{displayTotal.toLocaleString('vi-VN')}</span>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/checkout')}
              className="mt-5 w-full btn-primary py-3.5 flex items-center justify-center gap-2 text-base">
              Đặt hàng <FaArrowRight />
            </motion.button>
            <p className="text-center text-xs text-slate-500 mt-3 flex items-center justify-center gap-1">
              🔒 Thanh toán an toàn qua sàn MartHub
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
