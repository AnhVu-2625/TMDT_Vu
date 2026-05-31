import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiCheck, FiX, FiMessageSquare } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function Reports() {
  const [filter, setFilter] = useState('pending');

  const reports = [
    { id: 1, type: 'Sản phẩm', target: 'Áo giả Nike', reporter: 'Trần Văn B', reason: 'Hàng giả, hàng nhái', date: '30/05/2026', status: 'pending' },
    { id: 2, type: 'Shop', target: 'Shop FakeGoods', reporter: 'Nguyễn C', reason: 'Lừa đảo khách hàng', date: '29/05/2026', status: 'pending' },
    { id: 3, type: 'Đánh giá', target: 'Review #123', reporter: 'Lê D', reason: 'Ngôn ngữ không phù hợp', date: '28/05/2026', status: 'resolved' },
  ];

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter);

  const handleAction = (id, action) => {
    toast.success(action === 'resolve' ? 'Đã xử lý báo cáo #' + id : 'Đã bỏ qua báo cáo #' + id);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FiAlertTriangle className="text-orange-400" /> Báo cáo vi phạm
        </h1>
        <p className="text-slate-400 text-sm mt-1">Xem và xử lý các báo cáo từ người dùng</p>
      </div>

      <div className="flex gap-2 mb-6">
        {[{ v: 'pending', l: 'Chờ xử lý' }, { v: 'resolved', l: 'Đã xử lý' }, { v: 'all', l: 'Tất cả' }].map(t => (
          <button key={t.v} onClick={() => setFilter(t.v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === t.v ? 'bg-red-600 text-white' : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'}`}>
            {t.l}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="badge-yellow text-xs">{r.type}</span>
                  <h3 className="text-white font-semibold">{r.target}</h3>
                  <span className={r.status === 'pending' ? 'badge-red' : 'badge-green'}>
                    {r.status === 'pending' ? 'Chờ xử lý' : 'Đã xử lý'}
                  </span>
                </div>
                <p className="text-sm text-slate-400">📌 Lý do: <span className="text-slate-300">{r.reason}</span></p>
                <p className="text-sm text-slate-500 mt-1">👤 Người báo cáo: {r.reporter} • 📅 {r.date}</p>
              </div>
              {r.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleAction(r.id, 'resolve')}
                    className="flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition">
                    <FiCheck size={14} /> Xử lý
                  </button>
                  <button onClick={() => handleAction(r.id, 'dismiss')}
                    className="flex items-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-400 text-sm rounded-lg transition border border-white/[0.06]">
                    <FiX size={14} /> Bỏ qua
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
