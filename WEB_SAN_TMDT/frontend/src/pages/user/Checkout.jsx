import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCreditCard, FaCheckCircle, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';

const mockAddress = { MaDiaChi: 1, TenNguoiNhan: 'Nguyễn Văn A', SDTNguoiNhan: '0901234567', DiaChiCuThe: '123 Đường Lê Lợi', PhuongXa: 'Phường Bến Nghé', QuanHuyen: 'Quận 1', TinhThanh: 'TP. Hồ Chí Minh' };
const mockItems = [
  { MaChiTietGioHang: 1, TenSanPham: 'Samsung Galaxy S24 Ultra', MauSac: 'Đen', KichThuoc: '256GB', GiaBan: 29990000, SoLuong: 1 },
  { MaChiTietGioHang: 2, TenSanPham: 'Áo thun nam cao cấp', MauSac: 'Trắng', KichThuoc: 'L', GiaBan: 450000, SoLuong: 2 },
];
const payMethods = [
  { id: 'CHUYEN_KHOAN', icon: '🏦', label: 'Chuyển khoản ngân hàng', desc: 'VNPay, MoMo, ZaloPay' },
  { id: 'VI_DIEN_TU', icon: '📱', label: 'Ví điện tử', desc: 'MoMo, ZaloPay, ViettelPay' },
  { id: 'THE_TIN_DUNG', icon: '💳', label: 'Thẻ tín dụng/ghi nợ', desc: 'Visa, Mastercard, JCB' },
  { id: 'TIEN_MAT', icon: '💵', label: 'Tiền mặt khi nhận hàng', desc: 'COD - Thu tiền tại nhà' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const [payMethod, setPayMethod] = useState('CHUYEN_KHOAN');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [step, setStep] = useState(1); // 1=address, 2=payment, 3=confirm
  const [loading, setLoading] = useState(false);

  const subtotal = mockItems.reduce((s, i) => s + i.GiaBan * i.SoLuong, 0);
  const shipping = subtotal > 500000 ? 0 : 30000;
  const total = subtotal - discount + shipping;

  const handleOrder = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    toast.success('🎉 Đặt hàng thành công!');
    navigate('/orders');
  };

  const steps = [
    { n: 1, label: 'Địa chỉ' },
    { n: 2, label: 'Thanh toán' },
    { n: 3, label: 'Xác nhận' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Đặt hàng</h1>

      {/* Step indicator */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((s, i) => (
          <React.Fragment key={s.n}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all
                ${step >= s.n ? 'bg-red-600 border-red-600 text-white' : 'border-slate-700 text-slate-500'}`}>
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
          {/* Step 1: Address */}
          <div className={`bg-slate-900/70 rounded-xl border p-5 transition-all ${step === 1 ? 'border-red-500/40' : 'border-slate-800/50'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white flex items-center gap-2"><FaMapMarkerAlt className="text-red-400" /> Địa chỉ giao hàng</h2>
              {step !== 1 && <button onClick={() => setStep(1)} className="text-xs text-red-400 hover:text-red-300">Thay đổi</button>}
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-white">{mockAddress.TenNguoiNhan} <span className="text-slate-400">|</span> {mockAddress.SDTNguoiNhan}</p>
                  <p className="text-sm text-slate-400 mt-1">
                    {[mockAddress.DiaChiCuThe, mockAddress.PhuongXa, mockAddress.QuanHuyen, mockAddress.TinhThanh].join(', ')}
                  </p>
                </div>
                <span className="badge-red ml-2 flex-shrink-0">Mặc định</span>
              </div>
            </div>
            <button className="mt-3 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
              <FaPlus size={12} className="text-red-400" /> Thêm địa chỉ mới
            </button>
            {step === 1 && (
              <button onClick={() => setStep(2)} className="mt-4 btn-primary w-full">Tiếp tục</button>
            )}
          </div>

          {/* Step 2: Payment */}
          {step >= 2 && (
            <div className={`bg-slate-900/70 rounded-xl border p-5 transition-all ${step === 2 ? 'border-red-500/40' : 'border-slate-800/50'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white flex items-center gap-2"><FaCreditCard className="text-red-400" /> Phương thức thanh toán</h2>
                {step !== 2 && <button onClick={() => setStep(2)} className="text-xs text-red-400 hover:text-red-300">Thay đổi</button>}
              </div>
              <div className="space-y-3">
                {payMethods.map(m => (
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
                <button onClick={() => setStep(3)} className="mt-4 btn-primary w-full">Tiếp tục</button>
              )}
            </div>
          )}

          {/* Step 3: Products confirm */}
          {step >= 3 && (
            <div className="bg-slate-900/70 rounded-xl border border-red-500/40 p-5">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2"><FaCheckCircle className="text-red-400" /> Xác nhận đơn hàng</h2>
              <div className="space-y-3">
                {mockItems.map(item => (
                  <div key={item.MaChiTietGioHang} className="flex gap-3 p-3 bg-slate-800/40 rounded-lg">
                    <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-xl">📦</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white line-clamp-1">{item.TenSanPham}</p>
                      <p className="text-xs text-slate-400">{[item.MauSac, item.KichThuoc].filter(Boolean).join(' · ')} × {item.SoLuong}</p>
                    </div>
                    <span className="text-sm font-bold text-red-400">₫{(item.GiaBan * item.SoLuong).toLocaleString('vi-VN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-slate-900/70 rounded-xl border border-slate-800/50 p-5 h-fit">
          <h3 className="font-bold text-white text-lg mb-4">Tóm tắt</h3>
          <div className="space-y-2.5 text-sm mb-4">
            <div className="flex justify-between text-slate-300">
              <span>Tạm tính</span><span>₫{subtotal.toLocaleString('vi-VN')}</span>
            </div>
            {discount > 0 && <div className="flex justify-between text-green-400"><span>Giảm giá</span><span>-₫{discount.toLocaleString('vi-VN')}</span></div>}
            <div className="flex justify-between text-slate-300">
              <span>Vận chuyển</span>
              <span>{shipping === 0 ? <span className="text-green-400">Miễn phí</span> : `₫${shipping.toLocaleString('vi-VN')}`}</span>
            </div>
            <div className="border-t border-slate-700 pt-2.5 flex justify-between font-bold text-lg">
              <span className="text-white">Tổng</span>
              <span className="text-red-400">₫{total.toLocaleString('vi-VN')}</span>
            </div>
          </div>
          {step === 3 && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleOrder} disabled={loading}
              className="w-full btn-primary py-4 text-base relative">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xử lý...
                </span>
              ) : '🛡️ Xác nhận đặt hàng'}
            </motion.button>
          )}
          <p className="text-center text-xs text-slate-500 mt-3">Thanh toán an toàn qua sàn MartHub</p>
        </div>
      </div>
    </motion.div>
  );
}
