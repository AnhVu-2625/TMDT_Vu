import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiShoppingBag, FiDollarSign, FiEye, FiPlus, FiArrowRight, FiClock, FiUser, FiPhone } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useSellerStore } from '../../store/sellerStore';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const statusConfig = {
  CHO_XAC_NHAN: { label: 'Chờ xác nhận', cls: 'text-amber-400 bg-amber-500/10 border border-amber-500/20' },
  DA_XAC_NHAN: { label: 'Đã xác nhận', cls: 'text-blue-400 bg-blue-500/10 border border-blue-500/20' },
  DANG_GIAO: { label: 'Đang giao', cls: 'text-blue-400 bg-blue-500/10 border border-blue-500/20' },
  DA_GIAO: { label: 'Đã giao', cls: 'text-green-400 bg-green-500/10 border border-green-500/20' },
  DA_HUY: { label: 'Đã hủy', cls: 'text-red-400 bg-red-500/10 border border-red-500/20' },
};

export default function SellerDashboard() {
  const { user, token } = useAuthStore();
  const { products, orders, fetchMyProducts, fetchMyOrders, loading } = useSellerStore();
  const [stats, setStats] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/sellers/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data.data);
    } catch { /* backend may not have stats endpoint */ }
  }, [token]);

  useEffect(() => {
    fetchMyProducts();
    fetchMyOrders();
    fetchStats();
  }, [fetchMyProducts, fetchMyOrders, fetchStats]);

  const totalActive = products.filter(p => p.TrangThai === 'HOAT_DONG').length;
  const recentOrders = orders.slice(0, 5);

  const statCards = [
    { icon: FiPackage, label: 'Tổng sản phẩm', value: products.length, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { icon: FiEye, label: 'Đang bán', value: totalActive, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
    { icon: FiShoppingBag, label: 'Đơn hàng', value: orders.length, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { icon: FiDollarSign, label: 'Doanh thu', value: stats ? `₫${Number(stats.doanhThu || 0).toLocaleString('vi-VN')}` : '—', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  ];

  return (
    <div>
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 mb-8 bg-gradient-to-br from-[#0a0a0e] via-[#111116] to-[#0a0a0e] border border-white/[0.06]"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold text-white">
            Xin chào, <span className="bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent">{user?.hoTen || user?.shop?.TenCuaHang || 'Seller'}</span>
          </h1>
          <p className="text-slate-400 mt-1">Quản lý cửa hàng và theo dõi hiệu quả kinh doanh</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="relative overflow-hidden rounded-2xl p-5 bg-[#0a0a0e] border border-white/[0.06] hover:border-white/[0.12] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{stat.label}</p>
                <p className={`text-xl font-extrabold mt-0.5 ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-2xl bg-[#0a0a0e] border border-white/[0.06] overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FiClock className="text-red-400" size={16} /> Đơn hàng gần đây
              </h2>
              <Link to="/seller/orders" className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition">
                Xem tất cả <FiArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-14 bg-white/[0.03] rounded-xl animate-pulse" />)}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="p-10 text-center">
                <FiShoppingBag size={32} className="mx-auto text-slate-600 mb-3" />
                <p className="text-slate-500 text-sm">Chưa có đơn hàng nào</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {recentOrders.map((order, i) => {
                  const config = statusConfig[order.TrangThaiDonHang] || {};
                  return (
                    <div key={order.MaDonHang} className="px-6 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">Đơn #{order.MaDonHang}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${config.cls || 'text-slate-400 bg-slate-500/10'}`}>
                            {config.label || order.TrangThaiDonHang}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><FiUser size={10} /> {order.TenNguoiMua || '—'}</span>
                          <span>{order.TienThanhToan ? `${Number(order.TienThanhToan).toLocaleString('vi-VN')}đ` : '—'}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-600">{new Date(order.NgayTao).toLocaleDateString('vi-VN')}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="rounded-2xl bg-[#0a0a0e] border border-white/[0.06] p-6"
          >
            <h2 className="text-base font-bold text-white mb-4">Thao tác nhanh</h2>
            <div className="space-y-3">
              <Link to="/seller/products/new"
                className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-red-500/30 hover:bg-red-500/5 transition-all group">
                <div className="p-2.5 rounded-lg bg-red-500/10 text-red-400 group-hover:bg-red-500/20 transition">
                  <FiPlus size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">Thêm sản phẩm mới</p>
                  <p className="text-xs text-slate-500">Đăng bán sản phẩm lên cửa hàng</p>
                </div>
                <FiArrowRight size={14} className="text-slate-600 group-hover:text-red-400 transition" />
              </Link>

              <Link to="/seller/products"
                className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group">
                <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition">
                  <FiPackage size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">Quản lý sản phẩm</p>
                  <p className="text-xs text-slate-500">{products.length} sản phẩm đang bán</p>
                </div>
                <FiArrowRight size={14} className="text-slate-600 group-hover:text-blue-400 transition" />
              </Link>

              <Link to="/seller/orders"
                className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group">
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition">
                  <FiShoppingBag size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">Xem đơn hàng</p>
                  <p className="text-xs text-slate-500">{orders.filter(o => o.TrangThaiDonHang === 'CHO_XAC_NHAN').length} đơn chưa xác nhận</p>
                </div>
                <FiArrowRight size={14} className="text-slate-600 group-hover:text-amber-400 transition" />
              </Link>
            </div>
          </motion.div>

          {/* Shop Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="mt-4 rounded-2xl bg-[#0a0a0e] border border-white/[0.06] p-6"
          >
            <h2 className="text-base font-bold text-white mb-3">Thông tin cửa hàng</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Tên</span>
                <span className="text-white font-medium">{user?.shop?.TenCuaHang || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Trạng thái</span>
                <span className={`font-medium ${user?.shop?.TrangThai === 'HOAT_DONG' ? 'text-green-400' : 'text-amber-400'}`}>
                  {user?.shop?.TrangThai === 'HOAT_DONG' ? '🟢 Hoạt động' : user?.shop?.TrangThai === 'CHO_DUYET' ? '🟡 Chờ duyệt' : '🔴 Không hoạt động'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export { SellerDashboard as Dashboard };
