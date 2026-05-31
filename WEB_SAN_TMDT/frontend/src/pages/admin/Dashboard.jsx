import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiShoppingBag, FiDollarSign, FiPackage, FiShoppingCart, FiAlertCircle, FiTrendingUp, FiBarChart2 } from 'react-icons/fi';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getToken = () => JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = getToken();
        const res = await axios.get(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data.data);
      } catch (err) {
        console.error('Stats error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statCards = [
    { label: 'Người dùng', value: stats?.tongNguoiDung || 0, icon: FiUsers, color: 'from-blue-500 to-blue-700', bg: 'blue' },
    { label: 'Cửa hàng', value: stats?.tongShop || 0, icon: FiShoppingCart, color: 'from-emerald-500 to-emerald-700', bg: 'emerald' },
    { label: 'Shop chờ duyệt', value: stats?.shopChoDuyet || 0, icon: FiAlertCircle, color: 'from-amber-500 to-amber-700', bg: 'amber' },
    { label: 'Sản phẩm', value: stats?.tongSanPham || 0, icon: FiPackage, color: 'from-purple-500 to-purple-700', bg: 'purple' },
    { label: 'Đơn hàng', value: stats?.tongDonHang || 0, icon: FiShoppingBag, color: 'from-cyan-500 to-cyan-700', bg: 'cyan' },
    { label: 'Doanh thu', value: `${(stats?.tongDoanhThu || 0).toLocaleString()}đ`, icon: FiDollarSign, color: 'from-red-500 to-red-700', bg: 'red' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FiBarChart2 className="text-red-400" /> Thống kê tổng quan
        </h1>
        <p className="text-slate-400 text-sm mt-1">Tổng quan hệ thống MartHub</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="stat-card group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                <card.icon size={20} className="text-white" />
              </div>
              <FiTrendingUp size={14} className="text-slate-600 group-hover:text-emerald-400 transition" />
            </div>
            <p className="text-2xl font-bold text-white">{loading ? '...' : card.value}</p>
            <p className="text-sm text-slate-400 mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick overview */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Hoạt động gần đây</h2>
        <div className="text-center py-8 text-slate-500">
          <FiBarChart2 size={40} className="mx-auto mb-3" />
          <p>Dữ liệu hoạt động sẽ hiển thị ở đây</p>
        </div>
      </div>
    </div>
  );
}
