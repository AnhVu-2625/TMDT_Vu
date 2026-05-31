import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiCheck, FiX, FiExternalLink } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getToken = () => JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;

export default function ShopApproval() {
  const [shops, setShops] = useState([]);
  const [filter, setFilter] = useState('CHO_DUYET');
  const [loading, setLoading] = useState(true);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const url = filter === 'ALL' ? `${API_URL}/admin/shops` : `${API_URL}/admin/shops?trangThai=${filter}`;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${getToken()}` } });
      setShops(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchShops(); }, [filter]);

  const handleAction = async (shopId, action) => {
    try {
      await axios.put(`${API_URL}/admin/shops/${shopId}/approve`, { action }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      toast.success(action === 'approve' ? '✅ Đã duyệt shop!' : '❌ Đã từ chối shop');
      fetchShops();
    } catch (err) { toast.error('Lỗi xử lý'); }
  };

  const tabs = [
    { value: 'CHO_DUYET', label: 'Chờ duyệt' },
    { value: 'HOAT_DONG', label: 'Đang hoạt động' },
    { value: 'BI_KHOA', label: 'Bị khóa' },
    { value: 'ALL', label: 'Tất cả' },
  ];

  const statusBadge = (s) => {
    const map = { CHO_DUYET: 'badge-yellow', HOAT_DONG: 'badge-green', BI_KHOA: 'badge-red', NHAP: 'badge-gray' };
    const labels = { CHO_DUYET: 'Chờ duyệt', HOAT_DONG: 'Hoạt động', BI_KHOA: 'Bị khóa', NHAP: 'Nháp' };
    return <span className={map[s] || 'badge-gray'}>{labels[s] || s}</span>;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FiCheckCircle className="text-amber-400" /> Duyệt đăng ký Shop
        </h1>
        <p className="text-slate-400 text-sm mt-1">Xét duyệt hồ sơ đăng ký cửa hàng</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.value} onClick={() => setFilter(t.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === t.value ? 'bg-red-600 text-white' : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 shimmer" />)}</div>
      ) : shops.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl">
          <FiCheckCircle size={48} className="mx-auto text-emerald-500 mb-3" />
          <p className="text-lg font-semibold text-white">Không có shop nào</p>
          <p className="text-slate-400 text-sm">Chưa có hồ sơ nào trong mục "{tabs.find(t => t.value === filter)?.label}"</p>
        </div>
      ) : (
        <div className="space-y-4">
          {shops.map((shop, i) => (
            <motion.div key={shop.MaCuaHang} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl p-5 hover:border-amber-500/20 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-white">{shop.TenCuaHang}</h3>
                    {statusBadge(shop.TrangThai)}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-400">
                    <p>👤 <span className="text-slate-300">{shop.HoTen}</span></p>
                    <p>📧 {shop.Email}</p>
                    <p>📞 {shop.SoDienThoai || '—'}</p>
                    {shop.SDTCuaHang && <p>☎️ SĐT Shop: {shop.SDTCuaHang}</p>}
                    {shop.DiaChiKho && <p className="sm:col-span-2">📍 {shop.DiaChiKho}</p>}
                    {shop.MoTa && <p className="sm:col-span-2 text-slate-500">📝 {shop.MoTa}</p>}
                  </div>
                  {shop.AnhGiayTo && (
                    <a href={`http://localhost:5000${shop.AnhGiayTo}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-xs text-blue-400 hover:text-blue-300">
                      <FiExternalLink size={12} /> Xem giấy tờ đính kèm
                    </a>
                  )}
                </div>
                {shop.TrangThai === 'CHO_DUYET' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleAction(shop.MaCuaHang, 'approve')}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition shadow-lg shadow-emerald-500/20">
                      <FiCheck size={16} /> Duyệt
                    </button>
                    <button onClick={() => handleAction(shop.MaCuaHang, 'reject')}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-semibold rounded-lg transition border border-red-500/20">
                      <FiX size={16} /> Từ chối
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
