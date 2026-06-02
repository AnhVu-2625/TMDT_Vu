import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FaMapMarkerAlt, FaCreditCard, FaCheckCircle, FaPlus, FaTag, FaTimes
} from 'react-icons/fa';
import { FiCheck, FiPackage } from 'react-icons/fi';
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

const PAY_METHODS = [
  { id: 'CHUYEN_KHOAN', icon: '\u{1F3E6}', label: 'Chuyển khoản ngân hàng', desc: 'VNPay, MoMo, ZaloPay' },
  { id: 'VI_DIEN_TU', icon: '\u{1F4F1}', label: 'Ví điện tử', desc: 'MoMo, ZaloPay, ViettelPay' },
  { id: 'THE_TIN_DUNG', icon: '\u{1F4B3}', label: 'Thẻ tín dụng/ghi nợ', desc: 'Visa, Mastercard, JCB' },
  { id: 'TIEN_MAT', icon: '\u{1F4B5}', label: 'Tiền mặt khi nhận hàng', desc: 'COD - Thu tiền tại nhà' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useAuthStore();
  const { items, fetchCart, clearCart } = useCartStore();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [payMethod, setPayMethod] = useState('CHUYEN_KHOAN');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [promotions, setPromotions] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loadingAddr, setLoadingAddr] = useState(true);

  useEffect(() => {
    fetchCart();
    fetchAddresses();
    fetchPromotions();
  }, []);

  // Auto-apply coupon từ URL param sau khi có cả items và promotions
  const [autoApplied, setAutoApplied] = useState(false);
  useEffect(() => {
    if (items.length > 0 && promotions.length > 0 && !autoApplied) {
      const couponId = searchParams.get('couponId');
      if (couponId) {
        const found = promotions.find(p => p.MaKhuyenMai == couponId && p.TrangThai === 'CHUA_SU_DUNG');
        if (found) {
          setAppliedCoupon(found);
          const disc = found.LoaiGiamGia === 'PHAN_TRAM'
            ? Math.min(Math.round(subtotal * Number(found.GiaTriGiam) / 100), found.GiamToiDa ? Number(found.GiamToiDa) : Infinity)
            : Number(found.GiaTriGiam);
          setDiscount(disc);
        }
      }
      setAutoApplied(true);
    }
  }, [items, promotions]);

  const fetchPromotions = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/my-promotions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPromotions(res.data.data || []);
    } catch { }
  };

  const fetchAddresses = async () => {
    setLoadingAddr(true);
    try {
      const res = await axios.get(`${API_URL}/users/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = res.data.data || [];
      setAddresses(list);
      const def = list.find(a => a.LaMacDinh) || list[0] || null;
      setSelectedAddr(def);
    } catch {
      toast.error('Không thể tải địa chỉ giao hàng');
    } finally {
      setLoadingAddr(false);
    }
  };

  const subtotal = items.reduce((s, i) => s + (i.GiaBan || 0) * (i.SoLuong || 0), 0);
  const shipping = subtotal > 500000 || subtotal === 0 ? 0 : 30000;
  const total = subtotal - discount + shipping;

  const handleOrder = async () => {
    if (!selectedAddr) {
      toast.warning('Vui lòng chọn địa chỉ giao hàng');
      setStep(1);
      return;
    }
    if (items.length === 0) {
      toast.warning('Giỏ hàng của bạn đang trống');
      return;
    }
    setProcessing(true);
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      await axios.post(`${API_URL}/orders`, {
        maDiaChi: selectedAddr.MaDiaChi,
        maKhuyenMai: appliedCoupon?.MaKhuyenMai || null,
        phuongThucThanhToan: payMethod,
      }, { headers: { Authorization: `Bearer ${token}` } });
      await clearCart();
      toast.success('\u{1F389} Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại MartHub.');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đặt hàng thất bại, vui lòng thử lại');
    } finally {
      setProcessing(false);
      setLoading(false);
    }
  };

  const steps = [
    { n: 1, label: 'Địa chỉ' },
    { n: 2, label: 'Thanh toán' },
    { n: 3, label: 'Xác nhận' },
  ];

  if (items.length === 0 && !loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">{'\u{1F6D2}'}</div>
        <h2 className="text-2xl font-bold text-white mb-2">Giỏ hàng trống</h2>
        <p className="text-slate-400 mb-6">Thêm sản phẩm vào giỏ trước khi thanh toán nhé!</p>
        <button onClick={() => navigate('/products')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition">
          Khám phá sản phẩm
        </button>
      </div>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Đặt hàng</h1>

        <div className="flex items-center justify-center mb-8">
          {steps.map((s, i) => (
            <React.Fragment key={s.n}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${step > s.n ? 'bg-red-600 border-red-600 text-white'
                  : step === s.n ? 'border-red-500 text-red-400'
                    : 'border-slate-700 text-slate-500'
                  }`}>
                  {step > s.n ? <FaCheckCircle /> : s.n}
                </div>
                <span className={`text-xs mt-1 ${step >= s.n ? 'text-red-400' : 'text-slate-500'}`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 mb-4 transition-all ${step > s.n ? 'bg-red-600' : 'bg-slate-700'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            <div className={`bg-gradient-to-br from-slate-900 to-black rounded-xl border p-5 transition-all shadow-xl ${step === 1 ? 'border-red-500/40 shadow-red-600/20' : 'border-slate-800/50'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white flex items-center gap-2"><FaMapMarkerAlt className="text-red-400" /> Địa chỉ giao hàng</h2>
                {step !== 1 && <button onClick={() => setStep(1)} className="text-xs text-red-400 hover:text-red-300 transition">Thay đổi</button>}
              </div>

              {loadingAddr ? (
                <div className="space-y-2">
                  {[1, 2].map(i => <div key={i} className="h-16 bg-slate-800/40 rounded-lg animate-pulse" />)}
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm">
                  <p className="mb-3">Bạn chưa có địa chỉ giao hàng nào.</p>
                  <button onClick={() => navigate('/profile?tab=address')} className="flex items-center gap-1.5 text-red-400 hover:text-red-300 mx-auto transition text-xs font-semibold">
                    <FaPlus size={10} /> Thêm địa chỉ mới
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {addresses.map(addr => (
                    <label key={addr.MaDiaChi} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${selectedAddr?.MaDiaChi === addr.MaDiaChi
                      ? 'border-red-500/50 bg-red-500/5'
                      : 'border-slate-700/50 hover:border-slate-600 bg-slate-800/30'
                      }`}>
                      <input type="radio" name="addr" checked={selectedAddr?.MaDiaChi === addr.MaDiaChi}
                        onChange={() => setSelectedAddr(addr)} className="accent-red-500 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-white text-sm">{addr.TenNguoiNhan}</p>
                          <span className="text-slate-500 text-xs">|</span>
                          <p className="text-slate-400 text-xs">{addr.SDTNguoiNhan}</p>
                          {addr.LaMacDinh && (
                            <span className="flex items-center gap-0.5 text-[10px] bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold uppercase">
                              <FiCheck size={8} /> Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {[addr.DiaChiCuThe, addr.PhuongXa, addr.QuanHuyen, addr.TinhThanh].join(', ')}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {step === 1 && (
                <button onClick={() => { if (!selectedAddr) { toast.warning('Vui lòng chọn địa chỉ'); return; } setStep(2); }}
                  className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-red-600/30">
                  Tiếp tục
                </button>
              )}
            </div>

            {step >= 2 && (
              <div className={`bg-gradient-to-br from-slate-900 to-black rounded-xl border p-5 transition-all shadow-xl ${step === 2 ? 'border-red-500/40 shadow-red-600/20' : 'border-slate-800/50'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-white flex items-center gap-2"><FaCreditCard className="text-red-400" /> Phương thức thanh toán</h2>
                  {step !== 2 && <button onClick={() => setStep(2)} className="text-xs text-red-400 hover:text-red-300 transition">Thay đổi</button>}
                </div>
                <div className="space-y-2">
                  {PAY_METHODS.map(m => (
                    <label key={m.id} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${payMethod === m.id ? 'border-red-500/60 bg-red-500/5' : 'border-slate-700/50 hover:border-slate-600'}`}>
                      <input type="radio" name="pay" value={m.id} checked={payMethod === m.id} onChange={() => setPayMethod(m.id)} className="accent-red-500" />
                      <span className="text-2xl">{m.icon}</span>
                      <div>
                        <p className="font-semibold text-white text-sm">{m.label}</p>
                        <p className="text-xs text-slate-400">{m.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {step === 2 && (
                  <button onClick={() => setStep(3)} className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-red-600/30">
                    Tiếp tục
                  </button>
                )}
              </div>
            )}

            {step >= 3 && (
              <div className="bg-slate-900/70 rounded-xl border border-red-500/40 p-5 shadow-xl">
                <h2 className="font-bold text-white mb-4 flex items-center gap-2"><FaCheckCircle className="text-red-400" /> Xác nhận đơn hàng</h2>
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.MaChiTietGioHang} className="flex gap-3 p-3 bg-slate-800/40 rounded-lg">
                      <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-xl flex-shrink-0">
                        {item.AnhChinh
                          ? <img src={getImageUrl(item.AnhChinh)} alt="" className="w-full h-full object-cover rounded-lg"
                              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<svg class=\"text-slate-400\" stroke=\"currentColor\" fill=\"none\" viewBox=\"0 0 24 24\" height=\"24\" width=\"24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4\"></path></svg>'; }}
                          />
                          : <FiPackage className="text-slate-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white line-clamp-1">{item.TenSanPham}</p>
                        <p className="text-xs text-slate-400">{[item.MauSac, item.KichThuoc].filter(Boolean).join(' · ')} × {item.SoLuong}</p>
                      </div>
                      <span className="text-sm font-bold text-red-400 flex-shrink-0">
                        ₫{((item.GiaBan || 0) * (item.SoLuong || 1)).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900/70 rounded-xl border border-slate-800/50 p-4">
              <h3 className="font-semibold text-white mb-3 text-sm flex items-center gap-2">
                <FaTag className="text-red-400" /> Khuyến mãi
              </h3>
              {appliedCoupon ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-400" />
                      <span className="text-sm font-semibold text-green-400">{appliedCoupon.MaCode}</span>
                      <span className="text-xs text-green-300 bg-green-500/20 px-2 py-0.5 rounded-full">-₫{discount.toLocaleString('vi-VN')}</span>
                    </div>
                    <button onClick={() => { setAppliedCoupon(null); setDiscount(0); }} className="text-slate-400 hover:text-red-400 transition">
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
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
                        <button key={p.MaKhuyenMai} onClick={() => {
                          if (!meetsMinOrder) { toast.warning(`Đơn hàng tối thiểu ₫${Number(p.DonHangToiThieu).toLocaleString('vi-VN')}`); return; }
                          setAppliedCoupon(p);
                          let disc = 0;
                          if (p.LoaiGiamGia === 'PHAN_TRAM') {
                            disc = Math.round(subtotal * p.GiaTriGiam / 100);
                            if (p.GiamToiDa && disc > p.GiamToiDa) disc = Number(p.GiamToiDa);
                          } else { disc = Number(p.GiaTriGiam); }
                          setDiscount(disc);
                          toast.success(`Áp dụng mã ${p.MaCode} thành công!`);
                        }}
                          className={`w-full text-left p-3 rounded-xl border transition-all ${!meetsMinOrder ? 'border-slate-700/30 bg-slate-800/20 opacity-50 cursor-not-allowed' : 'border-slate-700/50 bg-slate-800/30 hover:border-red-500/30 hover:bg-red-500/5 cursor-pointer'}`}
                          disabled={!meetsMinOrder}>
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
                  <span>Vận chuyển</span>
                  <span>{shipping === 0 ? <span className="text-green-400">Miễn phí</span> : `₫${shipping.toLocaleString('vi-VN')}`}</span>
                </div>
                <div className="border-t border-slate-700 pt-3 flex justify-between font-bold text-lg">
                  <span className="text-white">Tổng cộng</span>
                  <span className="text-red-400">₫{total.toLocaleString('vi-VN')}</span>
                </div>
              </div>

              {step === 3 && (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleOrder} disabled={loading}
                  className="mt-5 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-red-600/30 disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang xử lý...</>
                  ) : '🛡️ Xác nhận đặt hàng'}
                </motion.button>
              )}
              <p className="text-center text-xs text-slate-500 mt-3">{'\u{1F512}'} Thanh toán an toàn qua sàn MartHub</p>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {processing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-600/20 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Đang xử lý thanh toán</h3>
              <p className="text-sm text-slate-400 mb-4">Vui lòng không tắt trình duyệt...</p>
              <div className="bg-slate-800 rounded-xl p-4 space-y-2 text-sm text-left">
                <div className="flex justify-between text-slate-300">
                  <span>Số tiền</span>
                  <span className="text-white font-semibold">₫{total.toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Phương thức</span>
                  <span className="text-white">{PAY_METHODS.find(m => m.id === payMethod)?.label}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-400">
                    <span>Khuyến mãi</span>
                    <span>{appliedCoupon.MaCode}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}