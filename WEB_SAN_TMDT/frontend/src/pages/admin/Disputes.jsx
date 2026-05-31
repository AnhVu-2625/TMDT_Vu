import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiRepeat, FiCheck, FiX, FiMessageSquare } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function Disputes() {
  const [filter, setFilter] = useState('pending');

  const disputes = [
    { id: 1001, buyer: 'Nguyễn Văn A', seller: 'Shop ABC', product: 'Áo thun nam', amount: 299000, reason: 'Hàng không đúng mô tả', date: '30/05/2026', status: 'pending' },
    { id: 1002, buyer: 'Trần Thị B', seller: 'Shop XYZ', product: 'Giày thể thao', amount: 890000, reason: 'Sản phẩm bị lỗi', date: '29/05/2026', status: 'pending' },
    { id: 1003, buyer: 'Lê Văn C', seller: 'Shop DEF', product: 'Tai nghe Bluetooth', amount: 450000, reason: 'Giao sai màu', date: '28/05/2026', status: 'resolved' },
  ];

  const filtered = filter === 'all' ? disputes : disputes.filter(d => d.status === filter);

  const handleResolve = (id, decision) => {
    toast.success(decision === 'refund' ? `Đã hoàn tiền cho đơn #${id}` : `Đã giữ nguyên đơn #${id}`);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FiRepeat className="text-cyan-400" /> Tranh chấp đổi trả
        </h1>
        <p className="text-slate-400 text-sm mt-1">Giải quyết tranh chấp giữa Người mua và Người bán</p>
      </div>

      <div className="flex gap-2 mb-6">
        {[{ v: 'pending', l: 'Chờ giải quyết' }, { v: 'resolved', l: 'Đã xử lý' }, { v: 'all', l: 'Tất cả' }].map(t => (
          <button key={t.v} onClick={() => setFilter(t.v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === t.v ? 'bg-red-600 text-white' : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'}`}>
            {t.l}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((d, i) => (
          <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">Tranh chấp #{d.id}</span>
                <span className={d.status === 'pending' ? 'badge-yellow' : 'badge-green'}>
                  {d.status === 'pending' ? 'Chờ giải quyết' : 'Đã xử lý'}
                </span>
              </div>
              <span className="text-xs text-slate-500">📅 {d.date}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <div>
                <p className="text-xs text-slate-500 mb-1">Người mua</p>
                <p className="text-sm text-white font-medium">{d.buyer}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Người bán</p>
                <p className="text-sm text-white font-medium">{d.seller}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Sản phẩm</p>
                <p className="text-sm text-slate-300">{d.product}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Giá trị</p>
                <p className="text-sm text-red-400 font-bold">{d.amount.toLocaleString()}đ</p>
              </div>
            </div>

            <p className="text-sm text-slate-400 mb-4">📌 Lý do: <span className="text-slate-300">{d.reason}</span></p>

            {d.status === 'pending' && (
              <div className="flex gap-2">
                <button onClick={() => handleResolve(d.id, 'refund')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition">
                  <FiRepeat size={14} /> Hoàn tiền cho Buyer
                </button>
                <button onClick={() => handleResolve(d.id, 'keep')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-sm rounded-lg transition border border-white/[0.06]">
                  <FiCheck size={14} /> Giữ nguyên cho Seller
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
