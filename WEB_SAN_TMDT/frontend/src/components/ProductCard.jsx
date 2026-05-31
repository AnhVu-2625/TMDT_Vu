import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaShoppingCart, FaHeart, FaRegHeart, FaEye, FaGem, FaFire } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

function ProductCard({ product, index = 0 }) {
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

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
      return;
    }
    const defaultVariant = product.variants?.[0];
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
    });
    toast.success(`Đã thêm "${product.TenSanPham}" vào giỏ hàng!`, { autoClose: 2000 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="card-luxury group relative flex flex-col rounded-2xl overflow-hidden"
    >
      {/* Luxury border glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-900/20 via-transparent to-gold-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Image Container */}
      <Link to={`/products/${product.MaSanPham}`} className="relative block h-56 overflow-hidden bg-gradient-to-br from-gray-900 to-black">
        {product.images?.[0]?.DuongDanAnh ? (
          <img
            src={product.images[0].DuongDanAnh}
            alt={product.TenSanPham}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-6xl bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <span className="opacity-30">📦</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Badges - Luxury Style */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discountPct > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-r from-red-900 to-red-800 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg shadow-red-900/50 border border-red-700/50 flex items-center gap-1"
            >
              <FaFire size={10} />
              -{discountPct}%
            </motion.span>
          )}
          {product.isNew && (
            <span className="bg-gradient-to-r from-blue-900 to-blue-800 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg shadow-blue-900/50 border border-blue-700/50">
              MỚI
            </span>
          )}
          {product.isHot && (
            <span className="bg-gradient-to-r from-orange-900 to-orange-800 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg shadow-orange-900/50 border border-orange-700/50 flex items-center gap-1">
              <FaFire size={10} className="animate-pulse" />
              HOT
            </span>
          )}
        </div>

        {/* Quick actions overlay - Luxury */}
        <motion.div
          initial={{ opacity: 0 }}
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <motion.button
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddToCart}
            className="w-12 h-12 bg-gradient-to-br from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 rounded-full flex items-center justify-center shadow-xl shadow-red-900/50 border border-red-700/50 backdrop-blur-sm"
            title="Thêm vào giỏ"
          >
            <FaShoppingCart size={16} className="text-white" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.15, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 bg-gradient-to-br from-gray-900 to-black hover:from-red-950 hover:to-red-900 rounded-full flex items-center justify-center shadow-xl shadow-black/50 border border-gray-800 hover:border-red-800 backdrop-blur-sm transition-all"
            title="Yêu thích"
          >
            <FaRegHeart size={16} className="text-red-400" />
          </motion.button>
          <Link to={`/products/${product.MaSanPham}`}>
            <motion.div
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 bg-gradient-to-br from-gray-900 to-black hover:from-gold-950 hover:to-gold-900 rounded-full flex items-center justify-center shadow-xl shadow-black/50 border border-gray-800 hover:border-gold-800 backdrop-blur-sm transition-all"
              title="Xem chi tiết"
            >
              <FaEye size={16} className="text-gray-300" />
            </motion.div>
          </Link>
        </motion.div>
      </Link>

      {/* Content - Luxury */}
      <div className="p-5 flex flex-col flex-1 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm">
        {/* Shop name with icon */}
        {product.TenCuaHang && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-900 to-red-950 flex items-center justify-center border border-red-800/50">
              <span className="text-[10px]">🏪</span>
            </div>
            <p className="text-xs text-gray-400 truncate font-medium">{product.TenCuaHang}</p>
          </div>
        )}

        {/* Product name - Luxury Typography */}
        <Link to={`/products/${product.MaSanPham}`}>
          <h3 className="text-sm font-semibold text-white line-clamp-2 hover:text-gold-700 transition-colors leading-snug mb-3 font-heading">
            {product.TenSanPham}
          </h3>
        </Link>

        {/* Rating & sold - Luxury */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                size={12}
                className={i < Math.floor(product.DanhGiaTrungBinh || 0)
                  ? 'text-gold-700'
                  : 'text-gray-800'}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 font-semibold">
            {product.DanhGiaTrungBinh?.toFixed(1) || '0.0'}
          </span>
          {product.SoLuongDaBan > 0 && (
            <>
              <span className="text-gray-800">|</span>
              <span className="text-xs text-gray-500">Đã bán {product.SoLuongDaBan}</span>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="divider-luxury mb-3" />

        {/* Price - Luxury */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 flex-wrap mb-4">
            <span className="text-xl font-black gradient-text-luxury font-display">
              {minPrice === maxPrice
                ? `₫${minPrice.toLocaleString('vi-VN')}`
                : `₫${minPrice.toLocaleString('vi-VN')}`}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-600 line-through font-medium">
                ₫{basePrice.toLocaleString('vi-VN')}
              </span>
            )}
          </div>

          {/* Add to cart button - Luxury */}
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(139,0,0,0.4)" }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-red-900 via-red-800 to-red-900 hover:from-red-800 hover:via-red-700 hover:to-red-800 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/30 border border-red-800/50 group/btn"
          >
            <FaShoppingCart size={14} className="group-hover/btn:scale-110 transition-transform" />
            Thêm vào giỏ
          </motion.button>
        </div>
      </div>

      {/* Premium indicator */}
      {product.isPremium && (
        <div className="absolute top-3 right-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-8 h-8 bg-gradient-to-br from-gold-700 to-gold-600 rounded-full flex items-center justify-center shadow-lg shadow-gold-700/50 border border-gold-600"
          >
            <FaGem size={12} className="text-black" />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default ProductCard;
