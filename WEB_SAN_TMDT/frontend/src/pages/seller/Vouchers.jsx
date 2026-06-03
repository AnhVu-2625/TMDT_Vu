import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiX, FiTag, FiPercent, FiDollarSign, FiCalendar, FiCopy, FiTrash2, FiCheck } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const EMPTY_FORM = {
  maCode: '',
  loaiGiamGia: 'PHAN_TRAM',
  giaTriGiam: '',
  donHangToiThieu: '',
  giamToiDa: '',
  tuNgay: '',
  denNgay: '',
  gioiHanSuDung: '',
};

export default function Vouchers() {
  const { token } = useAuthStore();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const fetchVouchers = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/sellers/vouchers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVouchers(res.data.data || []);
    } catch { toast.error('Không thể tải danh sách khuyến mãi'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchVouchers(); }, [fetchVouchers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.maCode.trim()) return toast.warning('Nhập mã khuyến mãi');
    if (!form.giaTriGiam || Number(form.giaTriGiam) <= 0) return toast.warning('Nhập giá trị giảm hợp lệ');
    if (!form.tuNgay || !form.denNgay) return toast.warning('Chọn thời gian áp dụng');
    if (!form.gioiHanSuDung || Number(form.gioiHanSuDung) <= 0) return toast.warning('Nhập số lượng mã');

    setSaving(true);
    try {
      await axios.post(`${API_URL}/sellers/vouchers`, {
        maCode: form.maCode.trim(),
        loaiGiamGia: form.loaiGiamGia,
        giaTriGiam: Number(form.giaTriGiam),
        donHangToiThieu: form.donHangToiThieu ? Number(form.donHangToiThieu) : 0,
        giamToiDa: form.giamToiDa ? Number(form.giamToiDa) : null,
        tuNgay: form.tuNgay,
        denNgay: form.denNgay,
        gioiHanSuDung: Number(form.gioiHanSuDung),
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Tạo mã khuyến mãi thành công!');
      setShowModal(false);
      setForm({ ...EMPTY_FORM });
      fetchVouchers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally { setSaving(false); }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.info('Đã copy mã: ' + code);
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('vi-VN');
  };

  const getDiscountLabel = (v) => {
    if (v.LoaiGiamGia === 'PHAN_TRAM') return `Giảm ${Number(v.GiaTriGiam).toLocaleString()}%`;
    return `Giảm ${Number(v.GiaTriGiam).toLocaleString()}₫`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FiTag className="text-red-500" /> Quản lý khuyến mãi
          </h1>
          <p className="text-slate-400 text-sm mt-1">Tạo mã giảm giá cho cửa hàng của bạn</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition shadow-lg shadow-red-600/20">
          <FiPlus size={16} /> Tạo mã mới
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-36 bg-white/[0.03] rounded-2xl animate-pulse border border-white/[0.06]" />)}
        </div>
      ) : vouchers.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="w-20 h-20 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/[0.06]">
            <FiTag className="text-slate-600" size={32} />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Chưa có mã khuyến mãi nào</h3>
          <p className="text-slate-400 text-sm mb-5">Tạo mã giảm giá để thu hút khách hàng</p>
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition">
            <FiPlus size={14} /> Tạo mã đầu tiên
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vouchers.map((v, i) => {
            const isActive = v.DangHoatDong;
            const used = Number(v.DaSuDung || 0);
            const total = Number(v.GioiHanSuDung || 0);
            const remaining = total - used;
            return (
              <motion.div key={v.MaKhuyenMai} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="relative overflow-hidden rounded-2xl bg-[#0a0a0e] border border-white/[0.06] p-5 hover:border-white/[0.12] transition-all group"
              >
                {/* Active badge */}
                <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${isActive ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-slate-700/30 text-slate-500 border border-slate-600/30'}`}>
                  {isActive ? 'Đang chạy' : 'Hết hạn'}
                </div>

                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400">
                    <FiPercent size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-base truncate">{v.MaCode}</h3>
                    <p className="text-sm text-red-400 font-semibold">{getDiscountLabel(v)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-3">
                  <div>
                    <span className="block text-slate-600">Đơn tối thiểu</span>
                    <span className="text-white font-medium">{Number(v.DonHangToiThieu || 0).toLocaleString()}₫</span>
                  </div>
                  <div>
                    <span className="block text-slate-600">Giảm tối đa</span>
                    <span className="text-white font-medium">{v.GiamToiDa ? `${Number(v.GiamToiDa).toLocaleString()}₫` : '—'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-600">Đã dùng / SL</span>
                    <span className="text-white font-medium">{used}/{total}</span>
                  </div>
                  <div>
                    <span className="block text-slate-600">Còn lại</span>
                    <span className={`font-medium ${remaining <= 0 ? 'text-red-400' : remaining < 10 ? 'text-amber-400' : 'text-green-400'}`}>{remaining}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-600 flex items-center gap-3">
                  <FiCalendar size={10} /> {formatDate(v.TuNgay)} → {formatDate(v.DenNgay)}
                </div>

                <div className="mt-3 flex gap-2">
                  <button onClick={() => copyCode(v.MaCode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-slate-400 hover:text-white hover:border-white/[0.12] transition">
                    <FiCopy size={11} /> Copy
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0a0a0e] border border-white/[0.06] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <h2 className="font-bold text-lg text-white flex items-center gap-2">
                <FiPlus className="text-red-400" /> Tạo mã khuyến mãi
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Mã code <span className="text-red-400">*</span>
                  </label>
                  <input type="text" required value={form.maCode} onChange={e => setForm(f => ({ ...f, maCode: e.target.value.toUpperCase() }))}
                    placeholder="VD: GIAM10K" className="w-full bg-white/[0.04] border border-white/[0.1] text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500/60 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Loại giảm</label>
                  <select value={form.loaiGiamGia} onChange={e => setForm(f => ({ ...f, loaiGiamGia: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/[0.1] text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500/60 transition">
                    <option value="PHAN_TRAM">% Phần trăm</option>
                    <option value="TIEN_MAT">₫ Tiền mặt</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    {form.loaiGiamGia === 'PHAN_TRAM' ? 'Phần trăm (%)' : 'Số tiền (₫)'} <span className="text-red-400">*</span>
                  </label>
                  <input type="number" required min="1" value={form.giaTriGiam} onChange={e => setForm(f => ({ ...f, giaTriGiam: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/[0.1] text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500/60 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Đơn tối thiểu (₫)</label>
                  <input type="number" min="0" value={form.donHangToiThieu} onChange={e => setForm(f => ({ ...f, donHangToiThieu: e.target.value }))}
                    placeholder="0" className="w-full bg-white/[0.04] border border-white/[0.1] text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500/60 transition" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Giảm tối đa (₫)</label>
                  <input type="number" min="0" value={form.giamToiDa} onChange={e => setForm(f => ({ ...f, giamToiDa: e.target.value }))}
                    placeholder="Không giới hạn" className="w-full bg-white/[0.04] border border-white/[0.1] text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500/60 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Số lượng mã <span className="text-red-400">*</span>
                  </label>
                  <input type="number" required min="1" value={form.gioiHanSuDung} onChange={e => setForm(f => ({ ...f, gioiHanSuDung: e.target.value }))}
                    placeholder="100" className="w-full bg-white/[0.04] border border-white/[0.1] text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500/60 transition" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Từ ngày <span className="text-red-400">*</span>
                  </label>
                  <input type="datetime-local" required value={form.tuNgay} onChange={e => setForm(f => ({ ...f, tuNgay: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/[0.1] text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500/60 transition [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Đến ngày <span className="text-red-400">*</span>
                  </label>
                  <input type="datetime-local" required value={form.denNgay} onChange={e => setForm(f => ({ ...f, denNgay: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/[0.1] text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500/60 transition [color-scheme:dark]" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-white/[0.06]">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 rounded-xl text-slate-400 hover:text-white transition font-medium">Hủy</button>
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition disabled:opacity-50">
                  {saving ? 'Đang tạo...' : 'Tạo mã'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
