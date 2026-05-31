import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaShoppingCart, FaHeart, FaRegHeart, FaEye } from 'react-icons/fa';
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -6 }}
      className="product-card group relative flex flex-col"
    >
      {/* Image */}
      <Link to={`/products/${product.MaSanPham}`} className="relative block h-52 overflow-hidden bg-slate-800/50">
        {product.images?.[0]?.DuongDanAnh ? (
          <img
            src={product.images[0].DuongDanAnh}
            alt={product.TenSanPham}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-5xl bg-gradient-to-br from-slate-800 to-slate-900">
            <span>📦</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discountPct > 0 && (
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{discountPct}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              MỚI
            </span>
          )}
          {product.isHot && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              🔥 HOT
            </span>
          )}
        </div>

        {/* Quick actions overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddToCart}
            className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-lg"
            title="Thêm vào giỏ"
          >
            <FaShoppingCart size={14} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 bg-slate-800/90 hover:bg-slate-700 rounded-full flex items-center justify-center shadow-lg"
            title="Yêu thích"
          >
            <FaRegHeart size={14} className="text-red-400" />
          </motion.button>
          <Link to={`/products/${product.MaSanPham}`}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 bg-slate-800/90 hover:bg-slate-700 rounded-full flex items-center justify-center shadow-lg"
              title="Xem chi tiết"
            >
              <FaEye size={14} className="text-slate-300" />
            </motion.div>
          </Link>
        </motion.div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Shop name */}
        {product.TenCuaHang && (
          <p className="text-xs text-slate-500 mb-1 truncate">🏪 {product.TenCuaHang}</p>
        )}

        {/* Product name */}
        <Link to={`/products/${product.MaSanPham}`}>
          <h3 className="text-sm font-medium text-slate-200 line-clamp-2 hover:text-white transition-colors leading-snug mb-2">
            {product.TenSanPham}
          </h3>
        </Link>

        {/* Rating & sold */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                size={12}
                className={i < Math.floor(product.DanhGiaTrungBinh || 0)
                  ? 'text-yellow-400'
                  : 'text-slate-700'}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500">
            ({product.DanhGiaTrungBinh?.toFixed(1) || '0.0'})
          </span>
          {product.SoLuongDaBan > 0 && (
            <span className="text-xs text-slate-500 ml-auto">Đã bán {product.SoLuongDaBan}</span>
          )}
        </div>

        {/* Price */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-bold text-red-400">
              {minPrice === maxPrice
                ? `₫${minPrice.toLocaleString('vi-VN')}`
                : `₫${minPrice.toLocaleString('vi-VN')} – ₫${maxPrice.toLocaleString('vi-VN')}`}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-500 line-through">
                ₫{basePrice.toLocaleString('vi-VN')}
              </span>
            )}
          </div>

          {/* Add to cart button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            className="mt-3 w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-red-500/30"
          >
            <FaShoppingCart size={13} />
            Thêm vào giỏ
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default ProductCard;
