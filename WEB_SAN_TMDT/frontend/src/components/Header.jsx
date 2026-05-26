import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaShoppingCart, FaUser, FaBars, FaTimes, FaSearch,
  FaBell, FaHeart, FaStore, FaChevronDown, FaSignOutAlt,
  FaClipboardList, FaCog, FaCrown, FaComments, FaMapMarkerAlt
} from 'react-icons/fa';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';

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
    <header className="sticky top-0 z-50 glass border-b border-red-900/20">
      {/* Top bar */}
      <div className="hidden md:block bg-black/30 text-xs text-slate-400 py-1">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>🔥 Flash Sale hôm nay - Giảm đến 70%</span>
          <div className="flex gap-4">
            <Link to="/seller/register" className="hover:text-red-400 transition">Bán hàng cùng MartHub</Link>
            <span className="text-slate-600">|</span>
            <Link to="/help" className="hover:text-red-400 transition">Hỗ trợ</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-800 rounded-xl flex items-center justify-center font-black text-lg shadow-lg shadow-red-500/30"
            >
              M
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden sm:inline text-xl font-black gradient-text"
            >
              MartHub
            </motion.span>
          </Link>

          {/* Category Dropdown */}
          <div className="hidden lg:block relative" ref={categoryRef}>
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg text-sm transition-all"
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
                  className="absolute top-full left-0 mt-1 w-56 glass-card rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden"
                >
                  {categories.map((cat) => (
                    <Link
                      key={cat.label}
                      to={cat.path}
                      onClick={() => setIsCategoryOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-red-600/10 hover:text-white transition-all"
                    >
                      <span className="text-lg">{cat.icon}</span>
                      {cat.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                className="w-full bg-slate-800/80 text-white rounded-xl pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 border border-slate-700/50 focus:border-red-500/50 transition-all placeholder-slate-500"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-400 transition"
              >
                <FaSearch size={16} />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Favorites */}
            {isAuthenticated && (
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  to="/favorites"
                  className="hidden sm:flex p-2.5 hover:bg-white/5 rounded-lg transition items-center justify-center"
                  title="Yêu thích"
                >
                  <FaHeart className="text-slate-400 hover:text-red-500 transition" size={18} />
                </Link>
              </motion.div>
            )}

            {/* Notifications */}
            {isAuthenticated && (
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  to="/notifications"
                  className="relative hidden sm:flex p-2.5 hover:bg-white/5 rounded-lg transition items-center justify-center"
                  title="Thông báo"
                >
                  <FaBell className="text-slate-400 hover:text-yellow-400 transition" size={18} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </Link>
              </motion.div>
            )}

            {/* Cart */}
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link
                to="/cart"
                className="relative flex p-2.5 hover:bg-white/5 rounded-lg transition"
                title="Giỏ hàng"
              >
                <FaShoppingCart className="text-slate-300 hover:text-white transition" size={18} />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition ml-1"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-800 flex items-center justify-center text-sm font-bold">
                    {user?.hoTen?.[0]?.toUpperCase() || <FaUser size={14} />}
                  </div>
                  <span className="hidden md:inline text-sm text-slate-300 max-w-[80px] truncate">
                    {user?.hoTen || 'Tài khoản'}
                  </span>
                  <FaChevronDown size={10} className={`hidden md:block text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 glass-card rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-slate-700/50">
                        <p className="text-sm font-semibold text-white truncate">{user?.hoTen}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        {user?.diemTichLuy > 0 && (
                          <p className="text-xs text-yellow-400 mt-1">⭐ {user.diemTichLuy.toLocaleString()} điểm</p>
                        )}
                      </div>
                      <div className="py-1">
                        {[
                          { icon: FaUser, label: 'Tài khoản của tôi', to: '/profile' },
                          { icon: FaClipboardList, label: 'Đơn hàng', to: '/orders' },
                          { icon: FaHeart, label: 'Yêu thích', to: '/favorites' },
                          { icon: FaComments, label: 'Tin nhắn', to: '/chat' },
                          { icon: FaMapMarkerAlt, label: 'Địa chỉ', to: '/addresses' },
                          { icon: FaCrown, label: 'VIP & Ưu đãi', to: '/vip' },
                        ].map(({ icon: Icon, label, to }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-red-600/10 hover:text-white transition-all"
                          >
                            <Icon size={14} className="text-red-400" />
                            {label}
                          </Link>
                        ))}

                        {user?.vaiTro === 'QUAN_TRI_VIEN' && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-600/10 hover:text-red-300 transition-all"
                          >
                            <FaCog size={14} />
                            Quản trị hệ thống
                          </Link>
                        )}

                        {user?.shop && (
                          <Link
                            to="/seller/dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-orange-400 hover:bg-orange-600/10 hover:text-orange-300 transition-all"
                          >
                            <FaStore size={14} />
                            Kênh người bán
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-slate-700/50 py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-600/10 w-full transition-all"
                        >
                          <FaSignOutAlt size={14} />
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
                  className="hidden sm:inline px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition shadow-lg shadow-red-500/20"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2.5 hover:bg-white/5 rounded-lg transition ml-1"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
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
              className="md:hidden overflow-hidden border-t border-slate-800/50"
            >
              <div className="py-3 space-y-1">
                {/* Mobile search */}
                <form onSubmit={handleSearch} className="px-2 pb-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm..."
                      className="w-full bg-slate-800 text-white rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 border border-slate-700/50"
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                      <FaSearch size={14} />
                    </button>
                  </div>
                </form>

                {categories.map((cat) => (
                  <Link
                    key={cat.label}
                    to={cat.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition"
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                  </Link>
                ))}

                <div className="border-t border-slate-800/50 pt-2 mt-2">
                  {isAuthenticated ? (
                    <>
                      <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 rounded-lg">
                        <FaUser size={14} className="text-red-400" /> Tài khoản
                      </Link>
                      <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 rounded-lg">
                        <FaClipboardList size={14} className="text-red-400" /> Đơn hàng
                      </Link>
                      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 rounded-lg w-full">
                        <FaSignOutAlt size={14} /> Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 rounded-lg">Đăng nhập</Link>
                      <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 rounded-lg">Đăng ký</Link>
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
