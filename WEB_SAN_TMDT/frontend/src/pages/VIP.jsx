import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaCrown, FaCheck, FaStar, FaGem, FaRocket, FaArrowLeft, FaShoppingCart, FaTruck, FaGift, FaHeadset, FaBolt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const benefits = [
  { icon: FaTruck, label: 'Miễn phí vận chuyển', desc: 'Không giới hạn đơn hàng' },
  { icon: FaGift, label: 'Quà tặng sinh nhật', desc: 'Giá trị lên đến 500.000₫' },
  { icon: FaStar, label: 'Tích điểm x2–x5', desc: 'Nhân đôi điểm thưởng mỗi đơn' },
  { icon: FaBolt, label: 'Flash Sale độc quyền', desc: 'Tiếp cận deal hot trước 2h' },
  { icon: FaHeadset, label: 'Hỗ trợ ưu tiên', desc: 'Hotline riêng, xử lý nhanh' },
  { icon: FaGem, label: 'Badge VIP', desc: 'Hiển thị huy hiệu VIP' },
];

export default function VIP() {
  const { isAuthenticated, token, user } = useAuthStore();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [vipStatus, setVipStatus] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [pkgRes, statusRes] = await Promise.all([
          axios.get(`${API_URL}/users/vip-packages`),
          isAuthenticated ? axios.get(`${API_URL}/users/vip-status`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null) : null,
        ]);
        setPackages(pkgRes.data.data || []);
        if (statusRes?.data?.data) setVipStatus(statusRes.data.data);
        if (pkgRes.data.data?.length) setSelected(pkgRes.data.data[1]?.MaGiaDichVu || pkgRes.data.data[0]?.MaGiaDichVu);
      } catch { toast.error('Không thể tải thông tin VIP'); }
      finally { setLoading(false); }
    };
    load();
  }, [isAuthenticated, token]);

  const handleSubscribe = async () => {
    if (!isAuthenticated) return navigate('/login');
    if (!selected) return;
    setSubscribing(true);
    try {
      await axios.post(`${API_URL}/users/vip/subscribe`, { maGiaDichVu: selected }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Đăng ký VIP thành công! 🎉');
      const statusRes = await axios.get(`${API_URL}/users/vip-status`, { headers: { Authorization: `Bearer ${token}` } });
      setVipStatus(statusRes.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally { setSubscribing(false); }
  };

  const handleUnsubscribe = async () => {
    setSubscribing(true);
    try {
      await axios.post(`${API_URL}/users/vip/unsubscribe`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Đã hủy VIP');
      setVipStatus(null);
    } catch { toast.error('Hủy thất bại'); }
    finally { setSubscribing(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full" />
    </div>
  );

  const pkg = packages.find(p => p.MaGiaDichVu === selected);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-slate-800/50">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-amber-500/2 to-transparent" />
        <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full bg-yellow-500/5 blur-[100px]" />
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-6">
            <FaArrowLeft size={14} /> Quay lại
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-xl shadow-yellow-500/30">
              <FaCrown size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-white">MartHub VIP</h1>
              <p className="text-slate-400 mt-1">Nâng tầm trải nghiệm mua sắm</p>
            </div>
          </div>
          {vipStatus && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 font-semibold text-sm">
              <FaCrown size={14} /> VIP {(vipStatus.TenGoi || '').replace('VIP ', '')} — Hết hạn: {new Date(vipStatus.NgayKetThuc).toLocaleDateString('vi-VN')}
            </div>
          )}
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-white mb-8 text-center">Quyền lợi VIP</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          {benefits.map((b, i) => (
            <motion.div key={b.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-slate-900/60 border border-slate-800/50 rounded-2xl p-5 text-center hover:border-yellow-500/30 transition-all group">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/10 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                <b.icon size={20} />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{b.label}</h3>
              <p className="text-xs text-slate-500">{b.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Packages */}
        <h2 className="text-xl font-bold text-white mb-8 text-center">Chọn gói phù hợp</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {packages.map((pkg, i) => {
            const isPopular = i === 1;
            const isSelected = selected === pkg.MaGiaDichVu;
            return (
              <motion.div key={pkg.MaGiaDichVu} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                onClick={() => setSelected(pkg.MaGiaDichVu)}
                className={`relative bg-slate-900/70 border-2 rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-1 ${isSelected ? 'border-yellow-500 shadow-xl shadow-yellow-500/10' : 'border-slate-800/50 hover:border-slate-700'}`}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-xs font-black rounded-full">
                    PHỔ BIẾN NHẤT
                  </div>
                )}
                <div className="text-center mb-6 mt-2">
                  <h3 className="text-lg font-bold text-white mb-1">{pkg.TenGoi}</h3>
                  <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400">
                    ₫{Number(pkg.GiaTien).toLocaleString('vi-VN')}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{pkg.ThoiGianDangKy} ngày</p>
                </div>
                <ul className="space-y-2 mb-6">
                  {(pkg.UuDai || '').split(',').map((u, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                      <FaCheck size={10} className="text-green-400 shrink-0" /> {u.trim()}
                    </li>
                  ))}
                </ul>
                <div className={`w-full py-2.5 rounded-xl text-center text-sm font-bold transition ${isSelected ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                  {isSelected ? '✔ Đã chọn' : 'Chọn gói'}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Action */}
        <div className="text-center">
          {vipStatus ? (
            <button onClick={handleUnsubscribe} disabled={subscribing}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition disabled:opacity-50">
              {subscribing ? 'Đang xử lý...' : 'Hủy VIP'}
            </button>
          ) : (
            <button onClick={handleSubscribe} disabled={subscribing || !selected}
              className="px-10 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black text-lg rounded-xl shadow-xl shadow-yellow-500/30 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100">
              <FaCrown size={18} className="inline mr-2" />
              {subscribing ? 'Đang đăng ký...' : `Đăng ký ${pkg?.TenGoi || ''} — ₫${(pkg?.GiaTien || 0).toLocaleString('vi-VN')}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
