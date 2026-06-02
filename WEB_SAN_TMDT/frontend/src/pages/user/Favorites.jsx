import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaHeart, FaTrash, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
};

export default function Favorites() {
  const { token } = useAuthStore();
  const { addItem } = useCartStore();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(res.data.data || []);
    } catch {
      toast.error('Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFavorites(); }, []);

  const handleRemove = async (productId) => {
    try {
      await axios.delete(`${API_URL}/favorites/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(prev => prev.filter(p => p.MaSanPham !== productId));
      toast.success('Đã xóa khỏi danh sách yêu thích');
    } catch {
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const res = await axios.get(`${API_URL}/products/${product.MaSanPham}`);
      const detail = res.data.data;
      const variant = detail.phienBan?.[0];
      if (!variant) {
        toast.warning('Sản phẩm chưa có phiên bản');
        return;
      }
      await addItem(variant.MaPhienBan, 1);
      toast.success(`Đã thêm "${product.TenSanPham}" vào giỏ hàng`);
    } catch {
      toast.error('Không thể thêm vào giỏ hàng');
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-20 space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-800/60 rounded-xl animate-pulse" />)}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FaHeart className="text-red-500" /> Sản phẩm yêu thích
        </h1>
        <span className="text-sm text-slate-400">{favorites.length} sản phẩm</span>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">💔</div>
          <h2 className="text-xl font-bold text-white mb-2">Chưa có sản phẩm yêu thích</h2>
          <p className="text-slate-400 mb-6">Hãy thả tim sản phẩm bạn quan tâm nhé!</p>
          <Link to="/products" className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl transition shadow-lg shadow-red-600/20">
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((product, i) => (
            <motion.div
              key={product.MaSanPham}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex items-center gap-4 hover:border-slate-700 transition-all group"
            >
              <Link to={`/products/${product.MaSanPham}`} className="w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
                {product.AnhChinh
                  ? <img src={getImageUrl(product.AnhChinh)} alt="" className="w-full h-full object-cover" />
                  : '📦'}
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 mb-0.5">🏪 {product.TenCuaHang}</p>
                <Link to={`/products/${product.MaSanPham}`} className="text-sm font-medium text-white hover:text-red-400 transition line-clamp-1">
                  {product.TenSanPham}
                </Link>
                <p className="text-sm font-bold text-red-400 mt-1">
                  ₫{Number(product.GiaThapNhat || product.GiaGoc).toLocaleString('vi-VN')}
                </p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleAddToCart(product)}
                  className="p-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-white transition" title="Thêm vào giỏ">
                  <FaShoppingCart size={14} />
                </button>
                <button onClick={() => handleRemove(product.MaSanPham)}
                  className="p-2.5 bg-slate-800 hover:bg-red-600/20 rounded-lg text-slate-400 hover:text-red-400 transition" title="Xóa">
                  <FaTrash size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
