import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaStore, FaStar, FaBox, FaEye, FaPhone, FaClock, FaArrowLeft, FaSpinner, FaShoppingCart, FaComments } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import ProductCard from '../components/ProductCard';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
}

export default function ShopPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShop = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/shops/${id}`);
        if (res.data.success) setShopData(res.data.data);
        else toast.error('Khong tim thay cua hang');
      } catch (err) {
        toast.error('Loi tai thong tin shop');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <FaSpinner size={32} className="text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!shopData) return null;

  const { shop, thongKe, sanPhams } = shopData;

  return (
    <div className="min-h-screen bg-[#050816]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white mb-4 flex items-center gap-1 text-sm">
            <FaArrowLeft size={12} /> Quay lai
          </button>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-600/20 flex-shrink-0">
              {shop.Logo ? (
                <img src={getImageUrl(shop.Logo)} alt={shop.TenCuaHang} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                shop.TenCuaHang?.[0] || 'S'
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-white">{shop.TenCuaHang}</h1>
              <p className="text-sm text-slate-400 mt-1 line-clamp-2">{shop.MoTa || 'Chua co mo ta'}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                <span><FaBox size={10} className="inline mr-1" />{thongKe.tongSP} san pham</span>
                <span><FaStar size={10} className="inline mr-1 text-yellow-500" />{thongKe.danhGiaTB || 'Moi'}</span>
                <span><FaClock size={10} className="inline mr-1" />Tham gia {shop.NgayTao ? new Date(shop.NgayTao).toLocaleDateString('vi-VN') : ''}</span>
              </div>
              <div className="flex gap-2 mt-3">
                {isAuthenticated && (
                  <Link to={`/chat?room=&shopId=${shop.MaCuaHang}`}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1">
                    <FaComments size={10} /> Chat
                  </Link>
                )}
                <a href={`tel:${shop.SoDienThoai}`}
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1">
                  <FaPhone size={10} /> {shop.SoDienThoai || 'Lien he'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab thong tin shop */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'San pham', value: thongKe.tongSP, icon: FaBox },
            { label: 'Danh gia', value: thongKe.tongFollow > 0 ? `${thongKe.tongFollow}` : '0', icon: FaStar },
            { label: 'Theo doi', value: thongKe.tongFollow || 0, icon: FaEye },
            { label: 'Phan hoi', value: 'Chat truc tiep', icon: FaComments },
          ].map(({ label, value, icon: Icon }, i) => (
            <div key={i} className="bg-slate-800/30 rounded-xl p-4 border border-white/[0.06] text-center">
              <Icon size={18} className="text-blue-400 mx-auto mb-2" />
              <p className="text-white text-lg font-bold">{value}</p>
              <p className="text-slate-500 text-xs">{label}</p>
            </div>
          ))}
        </div>

        {/* Danh sach san pham */}
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaBox size={16} className="text-blue-400" /> Tat ca san pham
        </h2>

        {sanPhams.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <FaBox size={48} className="mx-auto mb-4 opacity-20" />
            <p>Shop chua co san pham nao</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sanPhams.map(sp => (
              <ProductCard key={sp.MaSanPham} product={sp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
