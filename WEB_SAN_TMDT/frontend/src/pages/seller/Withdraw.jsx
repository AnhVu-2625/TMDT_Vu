import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiPlus, FiX, FiBank, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const statusConfig = {
  CHO_DUYET: { label: 'Chờ duyệt', cls: 'text-amber-400 bg-amber-500/10 border border-amber-500/20', icon: FiClock },
  DA_DUYET: { label: 'Đã duyệt', cls: 'text-green-400 bg-green-500/10 border border-green-500/20', icon: FiCheckCircle },
  TU_CHOI: { label: 'Từ chối', cls: 'text-red-400 bg-red-500/10 border border-red-500/20', icon: FiXCircle },
};

export default function Withdraw() {
  const { token } = useAuthStore();
  const [withdrawals, setWithdrawals] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ soTien: '', tenTaiKhoan: '', soTaiKhoan: '', tenNganHang: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [wRes, fRes] = await Promise.all([
        axios.get(`${API_URL}/sellers/withdrawals`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/sellers/finance`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setWithdrawals(wRes.data.data || []);
      setBalance(fRes.data.data?.soDuVi || 0);
    } catch { toast.error('Không thể tải dữ liệu'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.soTien || Number(form.soTien) <= 0) return toast.warning('Nhập số tiền hợp lệ');
    if (Number(form.soTien) > balance) return toast.warning('Số dư không đủ');
    if (!form.tenTaiKhoan || !form.soTaiKhoan || !form.tenNganHang) return toast.warning('Điền đầy đủ thông tin ngân hàng');

    setSaving(true);
    try {
      await axios.post(`${API_URL}/sellers/withdraw`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Yêu cầu rút tiền đã gửi!');
      setShowModal(false);
      setForm({ soTien: '', tenTaiKhoan: '', soTaiKhoan: '', tenNganHang: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally { setSaving(false); }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FiBank className="text-red-500" /> Rút tiền bán hàng
          </h1>
          <p className="text-slate-400 text-sm mt-1">Rút số dư từ ví bán hàng về tài khoản ngân hàng</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition shadow-lg shadow-red-600/20">
          <FiPlus size={16} /> Rút tiền
        </button>
      </div>

      {/* Balance Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="mb-8 rounded-2xl bg-gradient-to-br from-[#0a0a0e] via-[#111116] to-[#0a0a0e] border border-white/[0.06] p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <p className="text-sm text-slate-400 font-medium mb-1">Số dư khả dụng</p>
          <p className="text-3xl font-extrabold text-emerald-400">₫{balance.toLocaleString('vi-VN')}</p>
        </div>
      </motion.div>

      {/* Withdrawal History */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl bg-[#0a0a0e] border border-white/[0.06] overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-base font-bold text-white">Lịch sử rút tiền</h2>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-white/[0.03] rounded-xl animate-pulse" />)}
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="p-10 text-center">
            <FiDollarSign size={32} className="mx-auto text-slate-600 mb-3" />
            <p className="text-slate-500 text-sm">Chưa có yêu cầu rút tiền nào</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {withdrawals.map((w) => {
              const config = statusConfig[w.TrangThai] || { label: w.TrangThai, cls: 'text-slate-400 bg-slate-500/10', icon: FiClock };
              return (
                <div key={w.MaYeuCau} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400">
                      <FiDollarSign size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">₫{Number(w.SoTien).toLocaleString('vi-VN')}</p>
                      <p className="text-xs text-slate-500">{w.TenNganHang} - {w.SoTaiKhoan}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium ${config.cls}`}>
                      <config.icon size={10} /> {config.label}
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1">{w.NgayTao ? new Date(w.NgayTao).toLocaleDateString('vi-VN') : '—'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Withdraw Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0a0a0e] border border-white/[0.06] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <h2 className="font-bold text-lg text-white flex items-center gap-2">
                <FiBank className="text-red-400" /> Yêu cầu rút tiền
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Số dư hiện tại: <span className="text-emerald-400 font-bold">₫{balance.toLocaleString('vi-VN')}</span>
                </label>
                <input type="number" required min="1000" max={balance} value={form.soTien}
                  onChange={e => setForm(f => ({ ...f, soTien: e.target.value }))}
                  placeholder="Nhập số tiền muốn rút..." 
                  className="w-full bg-white/[0.04] border border-white/[0.1] text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500/60 transition" />
              </div>

              <div className="border-t border-white/[0.06] pt-4 space-y-4">
                <p className="text-sm font-semibold text-white">Thông tin tài khoản nhận</p>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Tên chủ tài khoản</label>
                  <input type="text" required value={form.tenTaiKhoan} onChange={e => setForm(f => ({ ...f, tenTaiKhoan: e.target.value }))}
                    placeholder="VD: NGUYEN VAN A" className="w-full bg-white/[0.04] border border-white/[0.1] text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500/60 transition" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Số tài khoản</label>
                    <input type="text" required value={form.soTaiKhoan} onChange={e => setForm(f => ({ ...f, soTaiKhoan: e.target.value }))}
                      placeholder="123456789" className="w-full bg-white/[0.04] border border-white/[0.1] text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500/60 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Ngân hàng</label>
                    <input type="text" required value={form.tenNganHang} onChange={e => setForm(f => ({ ...f, tenNganHang: e.target.value }))}
                      placeholder="Vietcombank" className="w-full bg-white/[0.04] border border-white/[0.1] text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500/60 transition" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-white/[0.06]">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 rounded-xl text-slate-400 hover:text-white transition font-medium">Hủy</button>
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition disabled:opacity-50">
                  {saving ? 'Đang xử lý...' : 'Gửi yêu cầu'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
