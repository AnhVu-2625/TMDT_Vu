import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaTrash, FaMinus, FaPlus, FaArrowRight, FaTag, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
};

export default function Cart() {
  const { items, fetchCart, updateItem, removeItem, loading } = useCartStore();
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    fetchCart();
    fetchPromotions();
  }, [fetchCart]);

  const fetchPromotions = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/my-promotions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPromotions(res.data.data || []);
    } catch {}
  };

  const subtotal = items.reduce((s, i) => s + (i.GiaBan || 0) * (i.SoLuong || 0), 0);
  const shipping = subtotal > 500000 || subtotal === 0 ? 0 : 30000;
  const total = Math.max(0, subtotal - discount + shipping);

  if (loading && items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-400">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
        <p>Đang tải giỏ hàng...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-white mb-3">Giỏ hàng trống</h2>
        <p className="text-slate-400 mb-8">Thêm sản phẩm vào giỏ để bắt đầu mua sắm</p>
        <Link to="/products">
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-lg">
            Khám phá sản phẩm
          </button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <FaShoppingCart className="text-red-400" /> Giỏ hàng ({items.length} sản phẩm)
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, i) => (
            <motion.div
              key={item.MaChiTietGioHang}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-slate-900/70 rounded-xl border border-slate-800/50 p-4 flex gap-4"
            >
              <div className="w-20 h-20 rounded-lg bg-slate-800 flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
                {item.AnhChinh || item.DuongDan || item.image ? (
                  <img
                    src={getImageUrl(item.AnhChinh || item.DuongDan || item.image)}
                    alt={item.TenSanPham}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '📦'; }}
                  />
                ) : (
                  '📦'
                )}
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
                      <button
                        onClick={() => updateItem(item.MaChiTietGioHang, (item.SoLuong || 1) - 1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition"
                      >
                        <FaMinus size={10} />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold text-white">{item.SoLuong}</span>
                      <button
                        onClick={() => updateItem(item.MaChiTietGioHang, (item.SoLuong || 1) + 1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition"
                      >
                        <FaPlus size={10} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.MaChiTietGioHang)}
                      className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Tổng: <span className="text-white font-semibold">₫{((item.GiaBan || 0) * (item.SoLuong || 1)).toLocaleString('vi-VN')}</span>
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          {/* Free shipping progress */}
          {subtotal > 0 && subtotal < 500000 && (
            <div className="bg-slate-900/70 rounded-xl border border-slate-800/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">🚚 Miễn phí vận chuyển cho đơn từ ₫500,000</span>
                <span className="text-xs text-yellow-400 font-semibold">còn ₫{(500000 - subtotal).toLocaleString('vi-VN')}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-500 to-red-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, (subtotal / 500000) * 100)}%` }} />
              </div>
            </div>
          )}
          {/* Coupon */}
          <div className="bg-slate-900/70 rounded-xl border border-slate-800/50 p-4">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <FaTag className="text-red-400" /> Khuyến mãi
            </h3>
            {appliedCoupon ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-400" />
                    <span className="text-sm font-semibold text-green-400">{appliedCoupon.MaCode}</span>
                    <span className="text-xs text-green-300 bg-green-500/20 px-2 py-0.5 rounded-full">
                      -₫{discount.toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <button onClick={() => { setAppliedCoupon(null); setDiscount(0); }} className="text-slate-400 hover:text-red-400 transition">
                    <FaTimes />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {promotions.filter(p => p.TrangThai === 'CHUA_SU_DUNG').length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-2">Bạn chưa có voucher nào. Khám phá thêm khuyến mãi để nhận ưu đãi!</p>
                ) : (
                  promotions.filter(p => p.TrangThai === 'CHUA_SU_DUNG').map(p => {
                    const meetsMinOrder = subtotal >= (p.DonHangToiThieu || 0);
                    let desc = '';
                    if (p.LoaiGiamGia === 'PHAN_TRAM') {
                      desc = `Giảm ${p.GiaTriGiam}%`;
                      if (p.GiamToiDa) desc += ` (tối đa ₫${Number(p.GiamToiDa).toLocaleString('vi-VN')})`;
                    } else if (p.LoaiGiamGia === 'TIEN_MAT') {
                      desc = `Giảm ₫${Number(p.GiaTriGiam).toLocaleString('vi-VN')}`;
                    } else {
                      desc = 'Miễn phí vận chuyển';
                    }
                    if (p.DonHangToiThieu > 0) desc += ` · Đơn từ ₫${Number(p.DonHangToiThieu).toLocaleString('vi-VN')}`;
                    return (
                      <button
                        key={p.MaKhuyenMai}
                        onClick={() => {
                          if (!meetsMinOrder) {
                            toast.warning(`Đơn hàng tối thiểu ₫${Number(p.DonHangToiThieu).toLocaleString('vi-VN')}`);
                            return;
                          }
                          setAppliedCoupon(p);
                          let disc = 0;
                          if (p.LoaiGiamGia === 'PHAN_TRAM') {
                            disc = Math.round(subtotal * p.GiaTriGiam / 100);
                            if (p.GiamToiDa && disc > p.GiamToiDa) disc = Number(p.GiamToiDa);
                          } else {
                            disc = Number(p.GiaTriGiam);
                          }
                          setDiscount(disc);
                          toast.success(`Áp dụng mã ${p.MaCode} thành công!`);
                        }}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          !meetsMinOrder
                            ? 'border-slate-700/30 bg-slate-800/20 opacity-50 cursor-not-allowed'
                            : 'border-slate-700/50 bg-slate-800/30 hover:border-red-500/30 hover:bg-red-500/5 cursor-pointer'
                        }`}
                        disabled={!meetsMinOrder}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <FaTag className="text-red-400 text-xs flex-shrink-0" />
                          <span className="text-sm font-bold text-white">{p.MaCode}</span>
                        </div>
                        <p className="text-xs text-slate-400">{desc}</p>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-slate-900/70 rounded-xl border border-slate-800/50 p-5">
            <h3 className="font-bold text-white text-lg mb-4">Tóm tắt đơn hàng</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Tạm tính ({items.length} sản phẩm)</span>
                <span>₫{subtotal.toLocaleString('vi-VN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Giảm giá</span>
                  <span>-₫{discount.toLocaleString('vi-VN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>Phí vận chuyển</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-400">Miễn phí</span>
                  ) : (
                    `₫${shipping.toLocaleString('vi-VN')}`
                  )}
                </span>
              </div>
              <div className="border-t border-slate-700 pt-3 flex justify-between font-bold text-lg">
                <span className="text-white">Tổng cộng</span>
                <span className="text-red-400">₫{total.toLocaleString('vi-VN')}</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                const params = new URLSearchParams();
                if (appliedCoupon) params.set('couponId', appliedCoupon.MaKhuyenMai);
                navigate(`/checkout${params.toString() ? '?' + params.toString() : ''}`);
              }}
              className="mt-5 w-full btn-primary py-3.5 flex items-center justify-center gap-2 text-base"
            >
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
