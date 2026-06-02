import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { FaStore, FaPlusCircle, FaShoppingBag, FaHome } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuthStore } from '../store/authStore';

const MainLayout = () => {
  const { user, isAuthenticated } = useAuthStore();
  const hasShop = isAuthenticated && user?.shop?.MaCuaHang && user?.shop?.TrangThai === 'HOAT_DONG';

  return (
    <div className="flex flex-col min-h-screen bg-[#050507]">
      <Header />

      {/* Seller Quick Menu - show when user has active shop */}
      {hasShop && (
        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border-b border-orange-500/30"
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FaStore className="text-orange-400" size={16} />
                <span className="text-sm font-semibold text-white">
                  Kênh bán hàng: <span className="text-orange-400">{user?.shop?.TenCuaHang}</span>
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition text-sm font-medium"
                title="Về trang chủ để mua hàng"
              >
                <FaHome size={14} />
                <span className="hidden sm:inline">Mua hàng</span>
              </Link>

              <Link
                to="/seller/products/new"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-600/30 hover:bg-orange-600/50 text-orange-300 hover:text-orange-200 transition text-sm font-medium"
              >
                <FaPlusCircle size={14} />
                <span className="hidden sm:inline">Thêm SP</span>
              </Link>

              <Link
                to="/seller/orders"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition text-sm font-medium"
              >
                <FaShoppingBag size={14} />
                <span className="hidden sm:inline">Đơn hàng</span>
              </Link>

              <Link
                to="/seller/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition text-sm font-medium"
              >
                <span className="text-lg">📊</span>
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
