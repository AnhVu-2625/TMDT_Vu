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

function ProductCard({ product, index = 0, compact = false }) {
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
      className={`group relative flex flex-col bg-gradient-to-b from-slate-900/60 to-slate-900/30 rounded-2xl border border-slate-800/50 hover:border-red-500/25 overflow-hidden transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_0_35px_rgba(220,38,38,0.08)] will-change-transform ${compact ? 'h-full' : ''}`}
    >
      <Link to={`/products/${product.MaSanPham}`} className={`relative block overflow-hidden bg-slate-800/60 ${compact ? 'aspect-[4/3] w-full' : 'h-36'}`}>
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-red-500/[0.04] to-transparent pointer-events-none z-[1]" />

        {!imgError && (product.AnhChinh || product.images?.[0]?.DuongDanAnh) ? (
          <img
            src={getImageUrl(product.AnhChinh || product.images[0].DuongDanAnh)}
            alt={product.TenSanPham}
            className="w-full h-full object-cover group-hover:scale-110 transition-[transform] duration-700 ease-out will-change-transform transform-gpu"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 ${compact ? 'text-4xl' : 'text-5xl'}`}>
            <span className="opacity-40">📦</span>
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-[opacity] duration-300 ease-out pointer-events-none" />

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
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 pb-3 opacity-0 group-hover:opacity-100 transition-[opacity,transform] duration-300 ease-out translate-y-2 group-hover:translate-y-0 z-10">
          <button onClick={handleFavorite}
            className="w-8 h-8 bg-slate-900/80 hover:bg-slate-800/90 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/5 transition-transform duration-200 ease-out hover:scale-110 active:scale-90"
            title="Yêu thích">
            {liked ? <FaHeart size={11} className="text-red-500" /> : <FaRegHeart size={11} className="text-red-400" />}
          </button>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/products/${product.MaSanPham}`); }}
            className="w-8 h-8 bg-slate-900/80 hover:bg-slate-800/90 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/5 transition-transform duration-200 ease-out hover:scale-110 active:scale-90"
            title="Xem chi tiết">
            <FaEye size={11} className="text-slate-300" />
          </button>
        </div>
      </Link>

      <div className={`flex flex-col flex-1 ${compact ? 'p-2' : 'p-3 gap-1.5'}`}>
        {product.TenCuaHang && (
          <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500/60 shrink-0" />
            <Link to={`/shop/${product.MaCuaHang}`} className="hover:text-blue-400 transition-colors">{product.TenCuaHang}</Link>
          </p>
        )}

        {compact ? (
          <div className="flex items-start justify-between gap-2">
            <Link to={`/products/${product.MaSanPham}`} className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-200 line-clamp-2 hover:text-white transition-colors leading-snug">
                {product.TenSanPham}
              </h3>
            </Link>
            <div className="flex-shrink-0 text-right">
              <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 leading-tight">
                {minPrice === maxPrice
                  ? `₫${minPrice.toLocaleString('vi-VN')}`
                  : `₫${minPrice.toLocaleString('vi-VN')}`}
              </span>
            </div>
          </div>
        ) : (
          <Link to={`/products/${product.MaSanPham}`}>
            <h3 className="text-sm font-semibold text-slate-200 line-clamp-2 hover:text-white transition-colors leading-snug">
              {product.TenSanPham}
            </h3>
          </Link>
        )}

        <div className={`flex items-center gap-2 ${compact ? 'mt-0.5' : ''}`}>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} size={9}
                className={i < Math.floor(product.DanhGiaTrungBinh || 0) ? 'text-yellow-400 drop-shadow-[0_0_2px_rgba(250,204,21,0.2)]' : 'text-slate-700'} />
            ))}
          </div>
          <span className="text-[10px] text-slate-500">({product.DanhGiaTrungBinh?.toFixed(1) || '0.0'})</span>
          {product.SoLuongDaBan > 0 && (
            <span className="text-[10px] text-slate-600 ml-auto">Đã bán {product.SoLuongDaBan}</span>
          )}
        </div>

        {compact ? (
          <button onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-[transform,background] duration-200 ease-out shadow-lg shadow-red-600/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <FaShoppingCart size={10} /> Giỏ hàng
          </button>
        ) : (
          <>
            <div className="mt-auto">
              <div className="flex items-baseline gap-2 flex-wrap mb-2">
                <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                  {minPrice === maxPrice
                    ? `₫${minPrice.toLocaleString('vi-VN')}`
                    : `₫${minPrice.toLocaleString('vi-VN')} – ₫${maxPrice.toLocaleString('vi-VN')}`}
                </span>
                {hasDiscount && (
                  <span className="text-[10px] text-slate-600 line-through">₫{basePrice.toLocaleString('vi-VN')}</span>
                )}
              </div>

              <button onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-[transform,background] duration-200 ease-out shadow-lg shadow-red-600/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <FaShoppingCart size={11} /> Giỏ hàng
              </button>
            </div>
          </>
        )}
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-slate-800/50 to-transparent" />
    </motion.div>
  );
}

export default ProductCard;
