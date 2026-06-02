import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaShoppingCart, FaHeart, FaRegHeart, FaEye, FaBolt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
};

function ProductCard({ product, index = 0 }) {
  const { addItem } = useCartStore();
  const { token, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(product.daYeuThich || false);
  const [imgError, setImgError] = useState(false);

  // Tính giá từ variants hoặc fallback về GiaGoc / GiaThapNhat
  const basePrice = product.GiaGoc || product.GiaThapNhat || 0;
  const rawMin = product.variants?.length > 0
    ? product.variants.reduce((min, v) => Math.min(min, v.GiaBan || basePrice), Infinity)
    : (product.GiaThapNhat || basePrice);
  const rawMax = product.variants?.length > 0
    ? product.variants.reduce((max, v) => Math.max(max, v.GiaBan || basePrice), 0)
    : (product.GiaCaoNhat || basePrice);
  const minPrice = isFinite(rawMin) && rawMin > 0 ? rawMin : basePrice;
  const maxPrice = isFinite(rawMax) && rawMax > 0 ? rawMax : basePrice;
  const hasDiscount = basePrice > 0 && minPrice < basePrice;
  const discountPct = hasDiscount ? Math.round(((basePrice - minPrice) / basePrice) * 100) : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return navigate('/login');
    }

    // If product list does not include variants, redirect to detail so user can choose
    if (!product.variants || product.variants.length === 0) {
      return navigate(`/products/${product.MaSanPham}`);
    }

    const defaultVariant = product.variants[0];
    if (!defaultVariant) {
      toast.error('Sản phẩm chưa có phiên bản');
      return;
    }

    addItem({
      maPhienBan: defaultVariant.MaPhienBan,
      maSanPham: product.MaSanPham,
      tenSanPham: product.TenSanPham,
      giaBan: defaultVariant.GiaBan || minPrice,
      anhSanPham: product.images?.[0]?.DuongDanAnh || null,
      tenCuaHang: product.TenCuaHang,
      soLuong: 1,
    }).then(() => {
      toast.success(`Đã thêm "${product.TenSanPham}" vào giỏ hàng!`, { autoClose: 2000 });
    }).catch(err => {
      toast.error(err.message || 'Không thể thêm sản phẩm vào giỏ hàng');
    });
  };

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để yêu thích sản phẩm');
      return navigate('/login');
    }
    try {
      if (liked) {
        await axios.delete(`${API_URL}/favorites/${product.MaSanPham}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLiked(false);
        toast.success('Đã xóa khỏi yêu thích');
      } else {
        await axios.post(`${API_URL}/favorites/add`, { maSanPham: product.MaSanPham }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLiked(true);
        toast.success('Đã thêm vào yêu thích');
      }
    } catch {
      toast.error('Không thể cập nhật yêu thích');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col bg-gradient-to-b from-slate-900/60 to-slate-900/30 rounded-2xl border border-slate-800/50 hover:border-red-500/25 overflow-hidden transition-all duration-300 hover:shadow-[0_0_35px_rgba(220,38,38,0.08)]"
    >
      <Link to={`/products/${product.MaSanPham}`} className="relative block h-52 overflow-hidden bg-slate-800/60">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-red-500/[0.04] to-transparent pointer-events-none z-[1]" />

        {!imgError && (product.AnhChinh || product.images?.[0]?.DuongDanAnh) ? (
          <img
            src={getImageUrl(product.AnhChinh || product.images[0].DuongDanAnh)}
            alt={product.TenSanPham}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-5xl bg-gradient-to-br from-slate-800 to-slate-900">
            <span className="opacity-40">📦</span>
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
          {discountPct > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
              className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-lg shadow-red-600/30"
            >
              -{discountPct}%
            </motion.span>
          )}
          {product.isNew && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg shadow-emerald-600/20"
            >
              Mới
            </motion.span>
          )}
          {product.isHot && (
            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg shadow-orange-600/20 flex items-center gap-1">
              <FaBolt size={10} className="animate-pulse" /> Hot
            </span>
          )}
        </div>

        {/* Hover action buttons */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 pb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddToCart}
            className="w-9 h-9 bg-gradient-to-br from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/40"
            title="Thêm vào giỏ"
          >
            <FaShoppingCart size={13} />
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleFavorite}
            className="w-9 h-9 bg-slate-900/80 hover:bg-slate-800/90 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/5"
            title="Yêu thích"
          >
            {liked ? <FaHeart size={13} className="text-red-500" /> : <FaRegHeart size={13} className="text-red-400" />}
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/products/${product.MaSanPham}`); }}
            className="w-9 h-9 bg-slate-900/80 hover:bg-slate-800/90 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/5"
            title="Xem chi tiết"
          >
            <FaEye size={13} className="text-slate-300" />
          </motion.button>
        </div>
      </Link>

<<<<<<< HEAD
      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Shop name */}
        {product.TenCuaHang && product.MaCuaHang && (
          <Link 
            to={`/shop/${product.MaCuaHang}`}
            className="text-xs text-slate-500 hover:text-blue-400 transition-colors mb-1 truncate"
          >
            🏪 {product.TenCuaHang}
          </Link>
        )}
        {product.TenCuaHang && !product.MaCuaHang && (
          <p className="text-xs text-slate-500 mb-1 truncate">🏪 {product.TenCuaHang}</p>
=======
      <div className="p-3.5 flex flex-col flex-1">
        {product.TenCuaHang && (
          <p className="text-[11px] text-slate-600 mb-1.5 truncate flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
            {product.TenCuaHang}
          </p>
>>>>>>> 6b22ddd7f1495a754e75169ea503240ad3039d09
        )}

        <Link to={`/products/${product.MaSanPham}`}>
          <h3 className="text-sm font-semibold text-slate-200 line-clamp-2 hover:text-white transition-colors leading-snug mb-2">
            {product.TenSanPham}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-2.5">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                size={10}
                className={i < Math.floor(product.DanhGiaTrungBinh || 0) ? 'text-yellow-400 drop-shadow-[0_0_2px_rgba(250,204,21,0.2)]' : 'text-slate-700'}
              />
            ))}
          </div>
          <span className="text-[11px] text-slate-500">({product.DanhGiaTrungBinh?.toFixed(1) || '0.0'})</span>
          {product.SoLuongDaBan > 0 && (
            <span className="text-[11px] text-slate-600 ml-auto">Đã bán {product.SoLuongDaBan}</span>
          )}
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 flex-wrap mb-2.5">
            <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
              {minPrice === maxPrice
                ? `₫${minPrice.toLocaleString('vi-VN')}`
                : `₫${minPrice.toLocaleString('vi-VN')} – ₫${maxPrice.toLocaleString('vi-VN')}`}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-slate-600 line-through">₫{basePrice.toLocaleString('vi-VN')}</span>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            className="relative w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20 overflow-hidden"
          >
            <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.08)_50%,transparent_100%)] animate-shimmer-slide" />
            <span className="relative z-10 flex items-center gap-2"><FaShoppingCart size={12} /> Thêm vào giỏ</span>
          </motion.button>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-slate-800/50 to-transparent" />
    </motion.div>
  );
}

export default ProductCard;
