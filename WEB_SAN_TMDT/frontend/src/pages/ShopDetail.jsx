import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiShoppingBag, FiStar, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ShopDetail() {
  const { shopId } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShopData();
  }, [shopId]);

  const fetchShopData = async () => {
    try {
      setLoading(true);
      
      // Fetch shop info
      const shopRes = await axios.get(`${API_URL}/products/shops/${shopId}`);
      setShop(shopRes.data.data);

      // Fetch shop products
      const productsRes = await axios.get(`${API_URL}/products?shop=${shopId}&limit=50`);
      setProducts(productsRes.data.data || []);
    } catch (error) {
      console.error('Error loading shop:', error);
      toast.error('Không thể tải thông tin cửa hàng');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-300 text-lg">Đang tải...</div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="text-slate-300 text-lg">Không tìm thấy cửa hàng</div>
        <Link to="/" className="text-blue-400 hover:text-blue-300">← Quay lại trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      {/* Header with back button */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 bg-slate-800/95 backdrop-blur border-b border-slate-700 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="text-slate-400 hover:text-white transition">
            <FiArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold">Chi tiết cửa hàng</h1>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Shop Info Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700"
        >
          <div className="flex gap-6 items-start">
            {/* Shop logo placeholder */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-3xl font-bold flex-shrink-0">
              {shop.TenCuaHang?.[0] || '🏪'}
            </div>

            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{shop.TenCuaHang}</h2>
              
              <div className="flex items-center gap-2 mb-4 text-yellow-400">
                <FiStar size={18} fill="currentColor" />
                <span className="font-semibold">4.8</span>
                <span className="text-slate-400 text-sm">(1,234 đánh giá)</span>
              </div>

              <p className="text-slate-300 mb-4 max-w-2xl">{shop.MoTa || 'Cửa hàng chuyên cung cấp các sản phẩm chất lượng cao'}</p>

              <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <FiShoppingBag size={16} className="text-blue-400" />
                  <span>{products.length} sản phẩm</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiMapPin size={16} className="text-green-400" />
                  <span>Hà Nội, Việt Nam</span>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition duration-200 flex items-center gap-2">
                  <FiMail size={16} />
                  Liên hệ
                </button>
                <button className="border border-slate-600 hover:border-slate-500 px-6 py-2 rounded-lg font-semibold transition duration-200">
                  Theo dõi
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Products Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-2xl font-bold mb-6">Sản phẩm của cửa hàng</h3>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, idx) => (
                <motion.div
                  key={product.MaSanPham}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiShoppingBag size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400 text-lg">Cửa hàng hiện chưa có sản phẩm nào</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
