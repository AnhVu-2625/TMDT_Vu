import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiTrendingUp, FiClock, FiCheckCircle, FiArrowUpRight } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Finance() {
  const { token } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFinance = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/sellers/finance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchFinance(); }, [fetchFinance]);

  const stats = [
    { icon: FiDollarSign, label: 'Số dư ví', value: data?.soDuVi || 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { icon: FiTrendingUp, label: 'Doanh thu', value: data?.doanhThu || 0, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    { icon: FiClock, label: 'Đang chờ xử lý', value: data?.dangCho || 0, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { icon: FiCheckCircle, label: 'Đã rút', value: data?.daRut || 0, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FiDollarSign className="text-red-500" /> Quản lý tài chính
          </h1>
          <p className="text-slate-400 text-sm mt-1">Theo dõi doanh thu và số dư cửa hàng</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white/[0.03] rounded-2xl animate-pulse border border-white/[0.06]" />)}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="relative overflow-hidden rounded-2xl p-5 bg-[#0a0a0e] border border-white/[0.06] hover:border-white/[0.12] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}>
                    <s.icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{s.label}</p>
                    <p className={`text-xl font-extrabold mt-0.5 ${s.color}`}>
                      ₫{Number(s.value).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent Transactions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-2xl bg-[#0a0a0e] border border-white/[0.06] overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FiArrowUpRight className="text-red-400" size={16} /> Giao dịch gần đây
              </h2>
            </div>
            {!data?.transactions?.length ? (
              <div className="p-10 text-center">
                <p className="text-slate-500 text-sm">Chưa có giao dịch nào</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {data.transactions.map((t) => (
                  <div key={t.MaDonHang} className="px-6 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition">
                    <div>
                      <p className="text-sm font-medium text-white">Đơn hàng #{t.MaDonHang}</p>
                      <p className="text-xs text-slate-500">{new Date(t.NgayTao).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">+₫{Number(t.TienThanhToan).toLocaleString('vi-VN')}</p>
                      <p className="text-[10px] text-slate-600">Đã giao</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
