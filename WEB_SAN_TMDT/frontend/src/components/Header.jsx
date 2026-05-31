import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaShoppingCart, FaUser, FaBars, FaTimes, FaSearch,
  FaBell, FaHeart, FaStore, FaChevronDown, FaSignOutAlt,
  FaClipboardList, FaCog, FaCrown, FaComments, FaMapMarkerAlt, FaGem
} from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

const categories = [
  { icon: '📱', label: 'Điện tử', path: '/products?category=dien-tu' },
  { icon: '👗', label: 'Thời trang', path: '/products?category=thoi-trang' },
  { icon: '🏠', label: 'Gia dụng', path: '/products?category=gia-dung' },
  { icon: '📚', label: 'Sách', path: '/products?category=sach' },
  { icon: '💄', label: 'Mỹ phẩm', path: '/products?category=my-pham' },
  { icon: '🎮', label: 'Gaming', path: '/products?category=gaming' },
];

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const { items } = useCartStore();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const categoryRef = useRef(null);

  const cartCount = items?.reduce((acc, item) => acc + item.SoLuong, 0) || 0;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setIsUserMenuOpen(false);
      if (categoryRef.current && !categoryRef.current.contains(e.target)) setIsCategoryOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-red-900/30">
      {/* Top bar - Luxury */}
      <div className="hidden md:block bg-gradient-to-r from-red-950/40 via-black/60 to-red-950/40 text-xs py-2 border-b border-red-900/20">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FaGem className="text-gold-700 text-sm" />
            <span className="text-gold-700 font-semibold">Flash Sale hôm nay</span>
            <span className="text-gray-400">— Giảm đến 70% hàng ngàn sản phẩm</span>
          </div>
          <div className="flex gap-4 items-center">
            <Link to="/seller/register" className="text-gray-400 hover:text-gold-700 transition font-medium">
              Bán hàng cùng MartHub
            </Link>
            <span className="text-gray-700">|</span>
            <Link to="/help" className="text-gray-400 hover:text-gold-700 transition font-medium">
              Hỗ trợ
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-20 gap-4">
          {/* Logo - Luxury */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              className="relative w-12 h-12 bg-gradient-to-br from-red-900 via-red-800 to-red-950 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-red-900/50 border border-red-700/50 group-hover:shadow-xl group-hover:shadow-red-800/60 transition-all"
            >
              <span className="gradient-text-gold">M</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold-700/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden sm:block"
            >
              <span className="text-2xl font-display font-bold gradient-text-luxury">MartHub</span>
              <div className="text-[10px] text-gold-700 font-semibold tracking-widest -mt-1">LUXURY SHOPPING</div>
            </motion.div>
          </Link>

          {/* Category Dropdown - Luxury */}
          <div className="hidden lg:block relative" ref={categoryRef}>
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-red-950/30 rounded-lg text-sm font-medium transition-all border border-transparent hover:border-red-900/50"
            >
              <FaBars size={14} />
              <span>Danh mục</span>
              <FaChevronDown size={10} className={`transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isCategoryOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-64 glass-card rounded-xl shadow-2xl border border-red-900/30 overflow-hidden"
                >
                  {categories.map((cat, i) => (
                    <Link
                      key={cat.label}
                      to={cat.path}
                      onClick={() => setIsCategoryOpen(false)}
                      className="flex items-center gap-3 px-5 py-3.5 text-sm text-gray-300 hover:bg-red-950/30 hover:text-white transition-all border-b border-gray-900/50 last:border-0 group"
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                      <span className="font-medium">{cat.label}</span>
                      <FaChevronDown size={10} className="ml-auto -rotate-90 text-gray-600 group-hover:text-gold-700 transition" />
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search - Luxury */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm cao cấp, thương hiệu..."
                className="w-full bg-black/60 text-white rounded-xl pl-5 pr-14 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-900/50 border border-gray-800 focus:border-red-900/70 transition-all placeholder-gray-600 shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-red-900 to-red-800 text-white rounded-lg hover:from-red-800 hover:to-red-700 transition-all shadow-lg shadow-red-900/30"
              >
                <FaSearch size={14} />
              </button>
            </div>
          </form>

          {/* Right actions - Luxury */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Favorites */}
            {isAuthenticated && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/favorites"
                  className="hidden sm:flex p-3 hover:bg-red-950/30 rounded-lg transition items-center justify-center border border-transparent hover:border-red-900/50 group"
                  title="Yêu thích"
                >
                  <FaHeart className="text-gray-400 group-hover:text-red-500 transition" size={18} />
                </Link>
              </motion.div>
            )}

            {/* Notifications */}
            {isAuthenticated && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/notifications"
                  className="relative hidden sm:flex p-3 hover:bg-red-950/30 rounded-lg transition items-center justify-center border border-transparent hover:border-red-900/50 group"
                  title="Thông báo"
                >
                  <FaBell className="text-gray-400 group-hover:text-gold-700 transition" size={18} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-lg shadow-red-600/50" />
                </Link>
              </motion.div>
            )}

            {/* Cart - Luxury */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/cart"
                className="relative flex p-3 hover:bg-red-950/30 rounded-lg transition border border-transparent hover:border-red-900/50 group"
                title="Giỏ hàng"
              >
                <FaShoppingCart className="text-gray-300 group-hover:text-white transition" size={18} />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg shadow-red-600/50 border border-red-500"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            {/* User Menu - Luxury */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-950/30 rounded-lg transition ml-1 border border-transparent hover:border-red-900/50 group"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-900 via-red-800 to-red-950 flex items-center justify-center text-sm font-bold shadow-lg shadow-red-900/50 border border-red-700/50 group-hover:shadow-xl group-hover:shadow-red-800/60 transition-all">
                    {user?.hoTen?.[0]?.toUpperCase() || <FaUser size={14} />}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-semibold text-white max-w-[100px] truncate">
                      {user?.hoTen || 'Tài khoản'}
                    </div>
                    {user?.diemTichLuy > 0 && (
                      <div className="text-xs text-gold-700 font-medium">⭐ {user.diemTichLuy.toLocaleString()} điểm</div>
                    )}
                  </div>
                  <FaChevronDown size={10} className={`hidden md:block text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-72 glass-card rounded-xl shadow-2xl border border-red-900/30 overflow-hidden"
                    >
                      {/* User Info Header */}
                      <div className="px-5 py-4 border-b border-gray-900/50 bg-gradient-to-r from-red-950/30 to-transparent">
                        <p className="text-sm font-bold text-white truncate">{user?.hoTen}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
                        {user?.diemTichLuy > 0 && (
                          <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-gold-950/30 border border-gold-900/50 rounded-lg">
                            <FaCrown className="text-gold-700" size={12} />
                            <span className="text-xs text-gold-700 font-bold">{user.diemTichLuy.toLocaleString()} điểm tích lũy</span>
                          </div>
                        )}
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {[
                          { icon: FaUser, label: 'Tài khoản của tôi', to: '/profile', color: 'text-gray-400' },
                          { icon: FaClipboardList, label: 'Đơn hàng', to: '/orders', color: 'text-gray-400' },
                          { icon: FaHeart, label: 'Yêu thích', to: '/favorites', color: 'text-red-400' },
                          { icon: FaComments, label: 'Tin nhắn', to: '/chat', color: 'text-blue-400' },
                          { icon: FaMapMarkerAlt, label: 'Địa chỉ', to: '/addresses', color: 'text-green-400' },
                          { icon: FaCrown, label: 'VIP & Ưu đãi', to: '/vip', color: 'text-gold-700' },
                        ].map(({ icon: Icon, label, to, color }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-5 py-3 text-sm text-gray-300 hover:bg-red-950/30 hover:text-white transition-all group"
                          >
                            <Icon size={14} className={`${color} group-hover:scale-110 transition-transform`} />
                            <span className="font-medium">{label}</span>
                          </Link>
                        ))}

                        {user?.vaiTro === 'QUAN_TRI_VIEN' && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-5 py-3 text-sm text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all border-t border-gray-900/50 group"
                          >
                            <FaCog size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                            <span className="font-bold">Quản trị hệ thống</span>
                          </Link>
                        )}

                        {user?.shop && (
                          <Link
                            to="/seller/dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-5 py-3 text-sm text-orange-400 hover:bg-orange-950/30 hover:text-orange-300 transition-all border-t border-gray-900/50 group"
                          >
                            <FaStore size={14} className="group-hover:scale-110 transition-transform" />
                            <span className="font-bold">Kênh người bán</span>
                          </Link>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-900/50 py-2 bg-gradient-to-r from-transparent to-red-950/20">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-5 py-3 text-sm text-red-400 hover:bg-red-950/30 hover:text-red-300 w-full transition-all font-semibold group"
                        >
                          <FaSignOutAlt size={14} className="group-hover:translate-x-1 transition-transform" />
                          Đăng xuất
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link
                  to="/login"
                  className="hidden sm:inline px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-red-950/30 rounded-lg transition border border-transparent hover:border-red-900/50"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-white text-sm font-bold rounded-lg transition shadow-lg shadow-red-900/50 hover:shadow-xl hover:shadow-red-800/60 border border-red-700/50"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-3 hover:bg-red-950/30 rounded-lg transition ml-1 border border-transparent hover:border-red-900/50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FaTimes size={18} className="text-white" /> : <FaBars size={18} className="text-gray-300" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-gray-900/50"
            >
              <div className="py-4 space-y-1">
                {/* Mobile search */}
                <form onSubmit={handleSearch} className="px-2 pb-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm..."
                      className="w-full bg-black/60 text-white rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-900/50 border border-gray-800"
                    />
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-red-900 text-white rounded-lg">
                      <FaSearch size={14} />
                    </button>
                  </div>
                </form>

                {categories.map((cat) => (
                  <Link
                    key={cat.label}
                    to={cat.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-red-950/30 hover:text-white rounded-lg transition"
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span className="font-medium">{cat.label}</span>
                  </Link>
                ))}

                <div className="border-t border-gray-900/50 pt-2 mt-2">
                  {isAuthenticated ? (
                    <>
                      <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-red-950/30 hover:text-white rounded-lg">
                        <FaUser size={14} className="text-red-400" /> <span className="font-medium">Tài khoản</span>
                      </Link>
                      <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-red-950/30 hover:text-white rounded-lg">
                        <FaClipboardList size={14} className="text-red-400" /> <span className="font-medium">Đơn hàng</span>
                      </Link>
                      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-950/30 rounded-lg w-full font-semibold">
                        <FaSignOutAlt size={14} /> Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 text-sm text-gray-300 hover:bg-red-950/30 hover:text-white rounded-lg font-medium">Đăng nhập</Link>
                      <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 text-sm text-red-400 hover:bg-red-950/30 rounded-lg font-bold">Đăng ký</Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

export default Header;
