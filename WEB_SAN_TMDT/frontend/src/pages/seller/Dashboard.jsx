import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiPackage,
  FiShoppingBag,
  FiDollarSign,
  FiAlertCircle,
  FiPlus,
  FiTrendingUp,
} from 'react-icons/fi';
import { useSellerStore } from '../../store/sellerStore';

export function Dashboard() {
  const { stats, fetchStats } = useSellerStore();

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Tổng sản phẩm',
      value: stats?.tongSanPham || 0,
      icon: FiPackage,
      color: 'from-blue-500 to-blue-700',
      link: '/seller/products',
    },
    {
      label: 'Tổng đơn hàng',
      value: stats?.tongDonHang || 0,
      icon: FiShoppingBag,
      color: 'from-emerald-500 to-emerald-700',
      link: '/seller/orders',
    },
    {
      label: 'Chờ xác nhận',
      value: stats?.donChoXacNhan || 0,
      icon: FiAlertCircle,
      color: 'from-amber-500 to-amber-700',
      link: '/seller/orders',
    },
    {
      label: 'Doanh thu',
      value: `${(stats?.doanhThu || 0).toLocaleString()}đ`,
      icon: FiDollarSign,
      color: 'from-red-500 to-red-700',
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Tổng quan cửa hàng của bạn</p>
        </div>
        <Link
          to="/seller/products/new"
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <FiPlus size={16} /> Thêm sản phẩm
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={card.link || '#'} className="stat-card block group">
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}
                >
                  <card.icon size={18} className="text-white" />
                </div>
                <FiTrendingUp
                  size={14}
                  className="text-slate-600 group-hover:text-emerald-400 transition"
                />
              </div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="text-sm text-slate-400 mt-1">{card.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              label: 'Thêm sản phẩm mới',
              to: '/seller/products/new',
              icon: '📦',
              desc: 'Đăng sản phẩm lên sàn',
            },
            {
              label: 'Quản lý đơn hàng',
              to: '/seller/orders',
              icon: '📋',
              desc: 'Xem và xử lý đơn',
            },
            {
              label: 'Quản lý sản phẩm',
              to: '/seller/products',
              icon: '🏪',
              desc: 'Sửa, xóa sản phẩm',
            },
          ].map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-red-500/20 hover:bg-white/[0.04] transition-all group"
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <p className="font-semibold text-white group-hover:text-red-400 transition">
                {action.label}
              </p>
              <p className="text-xs text-slate-500 mt-1">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

