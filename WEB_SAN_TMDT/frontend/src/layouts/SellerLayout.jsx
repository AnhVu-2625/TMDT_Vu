import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import BackButton from '../components/BackButton';
import {
  FiHome, FiPackage, FiShoppingBag, FiTag, FiDollarSign, FiMenu, FiX, FiLogOut, FiShoppingCart, FiCheckCircle, FiAlertCircle, FiArrowLeft
} from 'react-icons/fi';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const sidebarLinks = [
  { to: '/', icon: FiArrowLeft, label: 'Về trang chủ' },
  { to: '/seller/dashboard', icon: FiHome, label: 'Tổng quan' },
  { to: '/seller/products', icon: FiPackage, label: 'Sản phẩm' },
  { to: '/seller/orders', icon: FiShoppingBag, label: 'Đơn hàng' },
];

const SellerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const { user, logout, token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${API_URL}/users/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data?.data) {
          setNotifications(response.data.data.filter(n => !n.DaDoc));
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const shopApprovalNotif = notifications.find(n => n.TieuDe?.includes('duyệt') || n.TieuDe?.includes('Duyệt'));
  const isPending = user?.shop?.TrangThai === 'CHO_DUYET';
  const isApproved = user?.shop?.TrangThai === 'HOAT_DONG';

  return (
    <div className="flex min-h-screen bg-[#050507] text-white">
      {/* Top Banner - Shop Status */}
      <AnimatePresence>
        {isPending && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 bg-amber-900/30 border-b border-amber-700 px-4 py-3 z-50 flex items-center gap-3"
          >
            <FiAlertCircle className="text-amber-400 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-amber-100 font-medium">Cửa hàng của bạn đang chờ duyệt</p>
              <p className="text-amber-200 text-sm">Admin sẽ kiểm tra và duyệt trong vòng 24-48 giờ</p>
            </div>
          </motion.div>
        )}
        {!isPending && shopApprovalNotif && isApproved && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 bg-emerald-900/30 border-b border-emerald-700 px-4 py-3 z-50 flex items-center gap-3"
          >
            <FiCheckCircle className="text-emerald-400 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-emerald-100 font-medium">{shopApprovalNotif.TieuDe}</p>
              <p className="text-emerald-200 text-sm">{shopApprovalNotif.NoiDung}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 256 : 72 }}
        className="fixed top-0 left-0 h-screen bg-[#0a0a0e] border-r border-white/[0.06] z-30 flex flex-col"
        style={{ marginTop: isPending || shopApprovalNotif ? 80 : 0 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/[0.06]">
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center">
                  <FiShoppingCart className="text-white" size={16} />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent">
                  Seller Center
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-500 hover:text-white"
          >
            {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {sidebarLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-red-600/20 text-red-400 font-medium shadow-sm shadow-red-600/5'
                    : 'text-slate-500 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={20} className="flex-shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* User & Shop section */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-lg shadow-red-600/20">
              {user?.hoTen?.charAt(0) || 'S'}
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium truncate text-white">{user?.shop?.TenCuaHang || user?.hoTen || 'Seller'}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-2 rounded-lg hover:bg-red-600/20 text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
            >
              <FiLogOut size={18} />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main
        className="flex-1 transition-all duration-300"
        style={{ 
          marginLeft: sidebarOpen ? 256 : 72,
          marginTop: isPending || shopApprovalNotif ? 80 : 0 
        }}
      >
        <div className="p-6">
          <BackButton />
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SellerLayout;
