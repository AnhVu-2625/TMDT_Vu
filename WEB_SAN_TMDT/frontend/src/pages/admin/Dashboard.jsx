import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUsers, FiShoppingBag, FiAlertTriangle, FiDollarSign,
  FiMessageSquare, FiBarChart2, FiArrowRight, FiTrendingUp
} from 'react-icons/fi';
import StatCard from '../../components/admin/StatCard';
import { getStatistics } from '../../services/adminApi';

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
    getStatistics()
      .then(r => setStats(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Tổng quan hệ thống</h1>
        <p className="text-sm text-gray-500 mt-0.5">Chào mừng trở lại, Admin</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FiUsers}         label="Tổng người dùng"   value={fmt(stats?.totalUsers)}      color="blue" />
        <StatCard icon={FiShoppingBag}   label="Tổng cửa hàng"     value={fmt(stats?.totalShops)}      color="purple" />
        <StatCard icon={FiTrendingUp}    label="Tổng đơn hàng"     value={fmt(stats?.totalOrders)}     color="green" />
        <StatCard icon={FiDollarSign}    label="Doanh thu"          value={fmtMoney(stats?.totalRevenue)} color="yellow" />
      </div>

      {/* Pending alerts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FiShoppingBag}   label="Chờ duyệt shop"    value={fmt(stats?.pendingShops)}    color="yellow" sub="Cần xử lý" />
        <StatCard icon={FiAlertTriangle} label="Báo cáo chờ xử lý" value={fmt(stats?.pendingReports)}  color="red"    sub="Cần xử lý" />
        <StatCard icon={FiMessageSquare} label="Tranh chấp"         value={fmt(stats?.pendingDisputes)} color="orange" sub="Chờ phán quyết" />
        <StatCard icon={FiDollarSign}    label="Yêu cầu rút tiền"  value={fmt(stats?.pendingWithdrawals)} color="green" sub="Chờ duyệt" />
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
