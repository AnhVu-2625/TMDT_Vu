import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiUsers, FiShield, FiAlertTriangle, FiBarChart2,
  FiMessageSquare, FiDollarSign, FiFileText, FiBell,
  FiLogOut, FiMenu, FiX, FiChevronRight, FiShoppingBag
} from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';

const navItems = [
  { to: '/admin/dashboard',    icon: FiHome,          label: 'Tổng quan' },
  { to: '/admin/users',        icon: FiUsers,         label: 'Quản lý người dùng' },
  { to: '/admin/shops',        icon: FiShoppingBag,   label: 'Duyệt mở cửa hàng' },
  { to: '/admin/moderation',   icon: FiShield,        label: 'Kiểm duyệt hệ thống' },
  { to: '/admin/reports',      icon: FiAlertTriangle, label: 'Báo cáo vi phạm' },
  { to: '/admin/disputes',     icon: FiMessageSquare, label: 'Giải quyết tranh chấp' },
  { to: '/admin/settlement',   icon: FiDollarSign,    label: 'Đối soát & Chia tiền' },
  { to: '/admin/statistics',   icon: FiBarChart2,     label: 'Thống kê tổng quan' },
  { to: '/admin/policies',     icon: FiFileText,      label: 'Chính sách sử dụng' },
  { to: '/admin/notifications',icon: FiBell,          label: 'Gửi thông báo' },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col bg-gray-900 border-r border-gray-800 shrink-0 overflow-hidden"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="font-bold text-white text-lg whitespace-nowrap"
              >
                MartHub Admin
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg mb-0.5 transition-all group
                ${isActive
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className="shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-sm whitespace-nowrap"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!collapsed && isActive && <FiChevronRight size={14} className="ml-auto" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-gray-800 p-3">
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 py-2 mb-2">
              <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                {user?.hoTen?.[0] || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-medium text-white truncate">{user?.hoTen || 'Admin'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-2 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-all"
          >
            <FiLogOut size={16} className="shrink-0" />
            {!collapsed && <span className="text-sm">Đăng xuất</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-6 py-4 bg-gray-900 border-b border-gray-800 shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {collapsed ? <FiMenu size={20} /> : <FiX size={20} />}
          </button>
          <h1 className="text-sm font-medium text-gray-300">
            Bảng điều khiển quản trị
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded-full">
              Quản trị viên
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-950 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
