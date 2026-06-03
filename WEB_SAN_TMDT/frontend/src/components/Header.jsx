import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaShoppingCart, FaUser, FaBars, FaTimes, FaSearch,
  FaBell, FaHeart, FaStore, FaChevronDown, FaSignOutAlt,
  FaClipboardList, FaCrown, FaComments, FaMapMarkerAlt
} from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated, user, logout } = useAuthStore();
  const { items, fetchCart } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);
  const categoryRef = useRef(null);

  const cartCount = items?.reduce((acc, item) => acc + item.SoLuong, 0) || 0;

  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    try {
      const { token } = useAuthStore.getState();
      const res = await axios.get(`${API_URL}/notifications/unread/count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(res.data.count || 0);
    } catch {}
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, location.pathname]);

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
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-red-500/10">
      {/* Top bar */}
      <div className="hidden md:block bg-gradient-to-r from-red-950/30 via-black/40 to-red-950/30 text-xs text-slate-400 py-1.5 border-b border-red-500/5">
        <div className="flex justify-between items-center px-4 sm:px-8 lg:px-16">
          <motion.span
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <motion.span animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>🔥</motion.span>
            <span className="text-red-400 font-semibold">Flash Sale hôm nay</span>
            <span className="text-slate-500">—</span>
            <span>Giảm đến 70%</span>
            <span className="hidden xl:inline text-slate-600">| Miễn phí vận chuyển đơn từ 200k</span>
          </motion.span>
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="flex gap-6"
          >
            <Link to="/seller/register" className="hover:text-red-400 transition font-medium flex items-center gap-1.5 group">
              <FaStore size={12} className="text-red-500/70 group-hover:text-red-400 transition" />
              <span className="relative">
                Bán hàng cùng MartHub
                <span className="absolute -bottom-px left-0 right-0 h-px bg-red-400/0 group-hover:bg-red-400/60 transition-all" />
              </span>
            </Link>
            <span className="text-slate-700/50 select-none">|</span>
            <Link to="/" className="hover:text-red-400 transition font-medium relative group">
              Hỗ trợ
              <span className="absolute -bottom-px left-0 right-0 h-px bg-red-400/0 group-hover:bg-red-400/60 transition-all" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Main header */}
      <div className="px-4 sm:px-8 lg:px-16">
        <div className="flex items-center h-20 gap-4 lg:gap-6 xl:gap-10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.12, rotate: -5 }}
              className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-800 rounded-xl flex items-center justify-center font-black text-2xl shadow-lg shadow-red-500/30 text-white group-hover:shadow-red-500/50 transition-shadow"
            >
              M
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden sm:inline text-2xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent group-hover:from-red-400 group-hover:to-white transition-all duration-500"
            >
              MartHub
            </motion.span>
          </Link>

          {/* Decorative divider */}
          <div className="hidden lg:block w-px h-8 bg-gradient-to-b from-transparent via-slate-700/50 to-transparent" />

          {/* Category Dropdown */}
          <div className="hidden lg:block relative" ref={categoryRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl text-sm font-medium transition-all border border-slate-800/30 hover:border-red-500/40 hover:shadow-[0_0_20px_rgba(220,38,38,0.08)]"
            >
              <FaBars size={15} className="group-hover:rotate-90 transition-transform" />
              <span>Danh mục</span>
              <FaChevronDown size={11} className={`transition-all duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </motion.button>
            <AnimatePresence>
              {isCategoryOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-64 bg-slate-950/95 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden"
                >
                  {categories.map((cat) => (
                    <Link
                      key={cat.label}
                      to={cat.path}
                      onClick={() => setIsCategoryOpen(false)}
                      className="flex items-center gap-3.5 px-4 py-3.5 text-sm text-slate-300 hover:bg-red-600/10 hover:text-white hover:pl-5 transition-all border-b border-slate-900/50 last:border-b-0"
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="font-medium">{cat.label}</span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Decorative divider */}
          <div className="hidden lg:block w-px h-8 bg-gradient-to-b from-transparent via-slate-700/50 to-transparent" />

          {/* Search — wider */}
          <form onSubmit={handleSearch} className="flex-1 max-w-4xl hidden md:flex">
            <div className="relative w-full group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                className="w-full bg-slate-900/80 text-white rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 border border-slate-800 focus:border-red-500/30 transition-all placeholder-slate-500 group-hover:border-slate-600"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.1 }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-400 transition"
              >
                <FaSearch size={16} />
              </motion.button>
            </div>
          </form>

          {/* Decorative divider */}
          <div className="hidden lg:block w-px h-8 bg-gradient-to-b from-transparent via-slate-700/50 to-transparent" />

          {/* Right actions */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Favorites */}
            {isAuthenticated && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link
                  to="/favorites"
                  className="hidden sm:flex p-3 hover:bg-white/10 rounded-xl transition items-center justify-center relative group"
                  title="Yêu thích"
                >
                  <FaHeart className="text-slate-400 group-hover:text-red-500 transition duration-300" size={18} />
                  <span className="absolute inset-0 rounded-xl bg-red-500/0 group-hover:bg-red-500/5 transition-all" />
                </Link>
              </motion.div>
            )}

            {/* Notifications */}
            {isAuthenticated && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link
                  to="/notifications"
                  className="relative hidden sm:flex p-3 hover:bg-white/10 rounded-xl transition items-center justify-center group"
                  title="Thông báo"
                >
                  <FaBell className="text-slate-400 group-hover:text-yellow-400 transition duration-300" size={18} />
                  {unreadCount > 0 && (
                    <motion.span
                      key={unreadCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                      className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg shadow-red-600/50"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.span>
                  )}
                  <span className="absolute inset-0 rounded-xl bg-yellow-500/0 group-hover:bg-yellow-500/5 transition-all" />
                </Link>
              </motion.div>
            )}

            {/* Cart */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link
                to="/cart"
                className="relative flex p-3 hover:bg-white/10 rounded-xl transition group"
                title="Giỏ hàng"
              >
                <FaShoppingCart className="text-slate-300 group-hover:text-white transition duration-300" size={18} />
                <span className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/5 transition-all" />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
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
                  className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/5 rounded-xl transition ml-1"
                >
                  {user?.anhDaiDien ? (
                    <img src={user.anhDaiDien} alt={user.hoTen} className="w-8 h-8 rounded-full object-cover border border-red-500/30" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-800 flex items-center justify-center text-sm font-bold text-white">
                      {user?.hoTen?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:inline text-sm text-slate-300 font-semibold max-w-[90px] truncate">
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
                      className="absolute right-0 top-full mt-2 w-64 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 text-white"
                    >
                      <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/90">
                        <p className="text-sm font-semibold text-white truncate">{user?.hoTen}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
                        {user?.diemTichLuy > 0 && (
                          <div className="flex items-center gap-1 text-xs text-yellow-400 mt-2 font-semibold">
                            <span>⭐</span>
                            <span>{user.diemTichLuy.toLocaleString()} tích lũy</span>
                          </div>
                        )}
                      </div>
                      <div className="py-1 bg-slate-950">
                        {[
                          { icon: FaUser, label: 'Tài khoản của tôi', to: '/profile' },
                          { icon: FaClipboardList, label: 'Đơn mua', to: '/orders' },
                          { icon: FaHeart, label: 'Sản phẩm yêu thích', to: '/favorites' },
                          { icon: FaComments, label: 'Hộp thư tin nhắn', to: '/chat' },
                          { icon: FaMapMarkerAlt, label: 'Sổ địa chỉ nhận hàng', to: '/profile?tab=address' },
                          { icon: FaCrown, label: 'Hạng VIP & Ưu đãi', to: '/profile?tab=vip' },
                        ].map(({ icon: Icon, label, to }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-red-600/10 hover:text-white transition-all font-medium border-b border-slate-900/30 last:border-0"
                          >
                            <Icon size={14} className="text-red-400 flex-shrink-0" />
                            <span>{label}</span>
                          </Link>
                        ))}

                        {['QUAN_TRI_VIEN', 'QuanTriVien', 'Admin', 'admin'].includes(user?.vaiTro) && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-600/10 hover:text-red-300 transition-all font-semibold border-t border-slate-800"
                          >
                            <span className="flex-shrink-0">⚙️</span>
                            <span>Quản trị hệ thống</span>
                          </Link>
                        )}

                        {(() => {
                          const isAdmin = ['QUAN_TRI_VIEN', 'QuanTriVien', 'Admin', 'admin'].includes(user?.vaiTro);
                          if (user?.shop && user?.shop?.TrangThai === 'HOAT_DONG') {
                            return (
                              <Link to="/seller/dashboard" onClick={() => setIsUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-orange-400 hover:bg-orange-600/10 hover:text-orange-300 transition-all">
                                <FaStore size={14} /> Kênh người bán
                              </Link>
                            );
                          }
                          if (user?.shop && user?.shop?.TrangThai === 'CHO_DUYET') {
                            return (
                              <Link to="/seller/pending" onClick={() => setIsUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-yellow-400 hover:bg-yellow-600/10 hover:text-yellow-300 transition-all">
                                <FaStore size={14} /> Shop đang chờ duyệt
                              </Link>
                            );
                          }
                          if (!isAdmin) {
                            return (
                              <Link to="/seller/register" onClick={() => setIsUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-emerald-400 hover:bg-emerald-600/10 hover:text-emerald-300 transition-all">
                                <FaStore size={14} /> Đăng ký bán hàng
                              </Link>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      <div className="border-t border-slate-800 py-1 bg-slate-950">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 w-full text-left transition-all font-semibold"
                        >
                          <FaSignOutAlt size={14} className="flex-shrink-0" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-2">
                <Link
                  to="/login"
                  className="hidden sm:inline px-5 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all font-medium relative group"
                >
                  <span className="relative z-10">Đăng nhập</span>
                  <span className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/5 transition-all" />
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:scale-105 active:scale-95"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="md:hidden p-3 hover:bg-white/10 rounded-xl transition ml-2 text-slate-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <motion.div
                key={isMenuOpen ? 'close' : 'open'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-slate-800/50 bg-slate-950/95"
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
                      className="w-full bg-slate-900 text-white rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 border border-slate-800"
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
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition font-medium"
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                  </Link>
                ))}

                <div className="border-t border-slate-850 pt-2 mt-2">
                  {isAuthenticated ? (
                    <>
                      <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 rounded-lg font-medium">
                        <FaUser size={14} className="text-red-400" /> Tài khoản của tôi
                      </Link>
                      <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 rounded-lg font-medium">
                        <FaClipboardList size={14} className="text-red-400" /> Đơn hàng của tôi
                      </Link>
                      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-white/5 rounded-lg w-full text-left font-semibold">
                        <FaSignOutAlt size={14} /> Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 rounded-lg font-medium">Đăng nhập</Link>
                      <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 rounded-lg font-bold">Đăng ký</Link>
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
