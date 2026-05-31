import React from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiTrendingUp, FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';

export default function Finance() {
  const summary = [
    { label: 'Tổng doanh thu sàn', value: '125.600.000đ', change: '+12%', up: true },
    { label: 'Phí hoa hồng (5%)', value: '6.280.000đ', change: '+8%', up: true },
    { label: 'Đã chia cho Seller', value: '119.320.000đ', change: '+11%', up: true },
    { label: 'Chờ đối soát', value: '15.200.000đ', change: '-5%', up: false },
  ];

  const transactions = [
    { id: 'TX001', shop: 'Shop ABC', orders: 45, revenue: 12500000, commission: 625000, status: 'done' },
    { id: 'TX002', shop: 'Shop XYZ', orders: 32, revenue: 8900000, commission: 445000, status: 'done' },
    { id: 'TX003', shop: 'Shop DEF', orders: 18, revenue: 5200000, commission: 260000, status: 'pending' },
    { id: 'TX004', shop: 'Shop GHI', orders: 67, revenue: 22000000, commission: 1100000, status: 'pending' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FiDollarSign className="text-emerald-400" /> Đối soát & Chia tiền
        </h1>
        <p className="text-slate-400 text-sm mt-1">Quản lý doanh thu, hoa hồng và thanh toán cho Seller</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summary.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="stat-card">
            <p className="text-sm text-slate-400 mb-2">{s.label}</p>
            <p className="text-xl font-bold text-white">{s.value}</p>
            <div className={`flex items-center gap-1 mt-2 text-xs ${s.up ? 'text-emerald-400' : 'text-red-400'}`}>
              {s.up ? <FiArrowUpRight size={12} /> : <FiArrowDownRight size={12} />}
              {s.change} so với tháng trước
            </div>
          </motion.div>
        ))}
      </div>

      {/* Transactions table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-lg font-bold text-white">Bảng đối soát theo Shop</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06] text-left text-xs text-slate-400 uppercase">
              <th className="px-5 py-3">Mã</th>
              <th className="px-5 py-3">Cửa hàng</th>
              <th className="px-5 py-3">Đơn hàng</th>
              <th className="px-5 py-3">Doanh thu</th>
              <th className="px-5 py-3">Hoa hồng (5%)</th>
              <th className="px-5 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, i) => (
              <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="border-b border-white/[0.04] hover:bg-white/[0.02] transition">
                <td className="px-5 py-3 text-sm text-slate-300 font-mono">{t.id}</td>
                <td className="px-5 py-3 text-sm text-white font-medium">{t.shop}</td>
                <td className="px-5 py-3 text-sm text-slate-300">{t.orders}</td>
                <td className="px-5 py-3 text-sm text-emerald-400 font-semibold">{t.revenue.toLocaleString()}đ</td>
                <td className="px-5 py-3 text-sm text-amber-400">{t.commission.toLocaleString()}đ</td>
                <td className="px-5 py-3">
                  <span className={t.status === 'done' ? 'badge-green' : 'badge-yellow'}>
                    {t.status === 'done' ? 'Đã thanh toán' : 'Chờ đối soát'}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
