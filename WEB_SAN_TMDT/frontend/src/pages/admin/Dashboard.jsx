import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUsers, FiShoppingBag, FiAlertTriangle, FiDollarSign,
  FiMessageSquare, FiBarChart2, FiArrowRight, FiTrendingUp
} from 'react-icons/fi';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getToken = () => JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;

const fmt = (n) => n == null ? '—' : Number(n).toLocaleString('vi-VN');
const fmtMoney = (n) => n == null ? '—' : Number(n).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const quickLinks = [
  { to: '/admin/shops',        icon: FiShoppingBag,   label: 'Duyệt cửa hàng',      color: 'yellow' },
  { to: '/admin/reports',      icon: FiAlertTriangle, label: 'Xử lý báo cáo',        color: 'red' },
  { to: '/admin/disputes',     icon: FiMessageSquare, label: 'Tranh chấp',            color: 'orange' },
  { to: '/admin/settlement',   icon: FiDollarSign,    label: 'Đối soát & Chia tiền', color: 'green' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = getToken();
        const res = await axios.get(`${API_URL}/admin/statistics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data.data);
      } catch (err) {
        console.error('Stats error:', err);
        // Fallback to /stats endpoint
        try {
          const token = getToken();
          const res = await axios.get(`${API_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setStats(res.data.data);
        } catch {}
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Tổng quan hệ thống</h1>
        <p className="text-sm text-gray-500 mt-0.5">Chào mừng trở lại, Admin</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: FiUsers,       label: 'Tổng người dùng',  value: fmt(stats?.totalUsers || stats?.tongNguoiDung),  color: 'blue' },
          { icon: FiShoppingBag, label: 'Tổng cửa hàng',    value: fmt(stats?.totalShops || stats?.tongShop),       color: 'purple' },
          { icon: FiTrendingUp,  label: 'Tổng đơn hàng',    value: fmt(stats?.totalOrders || stats?.tongDonHang),   color: 'green' },
          { icon: FiDollarSign,  label: 'Doanh thu',         value: fmtMoney(stats?.totalRevenue || stats?.tongDoanhThu), color: 'yellow' },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="stat-card group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br from-${card.color}-500 to-${card.color}-700 flex items-center justify-center shadow-lg`}>
                <card.icon size={20} className="text-white" />
              </div>
              <FiTrendingUp size={14} className="text-slate-600 group-hover:text-emerald-400 transition" />
            </div>
            <p className="text-2xl font-bold text-white">{loading ? '...' : card.value}</p>
            <p className="text-sm text-slate-400 mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Pending alerts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: FiShoppingBag,   label: 'Chờ duyệt shop',    value: fmt(stats?.pendingShops || stats?.shopChoDuyet),    color: 'amber', sub: 'Cần xử lý' },
          { icon: FiAlertTriangle, label: 'Báo cáo chờ xử lý', value: fmt(stats?.pendingReports),  color: 'red',    sub: 'Cần xử lý' },
          { icon: FiMessageSquare, label: 'Tranh chấp',         value: fmt(stats?.pendingDisputes), color: 'orange', sub: 'Chờ phán quyết' },
          { icon: FiDollarSign,    label: 'Yêu cầu rút tiền',  value: fmt(stats?.pendingWithdrawals), color: 'green', sub: 'Chờ duyệt' },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
            className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <card.icon size={16} className="text-slate-400" />
              <span className="text-xs text-slate-400">{card.label}</span>
            </div>
            <p className="text-xl font-bold text-white">{loading ? '...' : card.value}</p>
            {card.sub && <p className="text-xs text-slate-500 mt-1">{card.sub}</p>}
          </motion.div>
        ))}
      </div>

      {/* Quick links */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Truy cập nhanh</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickLinks.map(({ to, icon: Icon, label, color }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center justify-between bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Icon size={16} className="text-gray-400 group-hover:text-white transition-colors" />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{label}</span>
              </div>
              <FiArrowRight size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Locked users */}
      {stats?.lockedUsers > 0 && (
        <div className="bg-red-600/10 border border-red-600/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiUsers size={16} className="text-red-400" />
            <span className="text-sm text-red-300">
              Có <strong>{stats.lockedUsers}</strong> tài khoản đang bị khóa
            </span>
          </div>
          <Link to="/admin/users?status=BI_KHOA" className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
            Xem <FiArrowRight size={12} />
          </Link>
        </div>
      )}
    </div>
  );
}
