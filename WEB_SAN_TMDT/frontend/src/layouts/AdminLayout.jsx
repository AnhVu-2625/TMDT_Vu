import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import {
  FiHome, FiUsers, FiShield, FiMenu, FiX, FiLogOut,
  FiAlertTriangle, FiFileText, FiBarChart2, FiDollarSign,
  FiBell, FiBookOpen, FiCheckCircle, FiRepeat
} from 'react-icons/fi';

const sidebarLinks = [
  { to: '/admin/dashboard',    icon: FiBarChart2,       label: 'Thống kê tổng quan' },
  { to: '/admin/users',        icon: FiUsers,           label: 'Quản lý tài khoản' },
  { to: '/admin/shops',        icon: FiCheckCircle,     label: 'Duyệt đăng ký shop' },
  { to: '/admin/moderation',   icon: FiShield,          label: 'Kiểm duyệt hệ thống' },
  { to: '/admin/reports',      icon: FiAlertTriangle,   label: 'Báo cáo vi phạm' },
  { to: '/admin/disputes',     icon: FiRepeat,          label: 'Tranh chấp đổi trả' },
  { to: '/admin/finance',      icon: FiDollarSign,      label: 'Đối soát & Chia tiền' },
  { to: '/admin/policy',       icon: FiBookOpen,        label: 'Chính sách sử dụng' },
  { to: '/admin/notifications', icon: FiBell,           label: 'Thông báo hệ thống' },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 270 : 72 }}
        className="fixed top-0 left-0 h-screen bg-gray-900 border-r border-gray-800 z-30 flex flex-col"
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-800">
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2">
                <FiShield className="text-red-500 text-xl" />
                <span className="font-bold text-lg bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  Admin Panel
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
            {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto custom-scrollbar">
          {sidebarLinks.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-red-500/20 text-red-400 font-medium'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }>
              <Icon size={18} className="flex-shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }} className="whitespace-nowrap overflow-hidden text-sm">
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {user?.hoTen?.charAt(0) || 'A'}
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.hoTen || 'Admin'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={handleLogout} title="Đăng xuất"
              className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors flex-shrink-0">
              <FiLogOut size={18} />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? 270 : 72 }}>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
