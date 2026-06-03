import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStore, FaStar, FaBox, FaEye, FaPhone, FaClock, FaArrowLeft, FaSpinner, FaComments, FaShoppingBag, FaSearch, FaFilter, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return 'http://localhost:5000' + (path.startsWith('/') ? '' : '/') + path;
}

export default function ShopDetail() {
  const { shopId } = useParams();
  const { isAuthenticated } = useAuthStore();
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [danhMuc, setDanhMuc] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchShop = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 100 });
      if (danhMuc) params.append('danhMuc', danhMuc);
      if (sortBy) params.append('sortBy', sortBy);
      if (search) params.append('search', search);
      const res = await axios.get(API_URL + '/shops/' + shopId + '?' + params);
      if (res.data.success) setShopData(res.data.data);
      else toast.error('Kh\xF4ng t\xECm th\u1EA5y c\u1EEDa h\xE0ng');
    } catch (error) {
      console.error('Error loading shop:', error);
      toast.error('Kh\xF4ng th\u1EC3 t\u1EA3i th\xF4ng tin c\u1EEDa h\xE0ng');
    } finally {
      setLoading(false);
    }
  }, [shopId, danhMuc, sortBy, search, page]);

  useEffect(() => {
    fetchShop();
  }, [fetchShop]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchShop();
  };

  const SORT_OPTIONS = [
    { value: 'newest', label: 'M\u1EDBi nh\u1EA5t' },
    { value: 'price-asc', label: 'Gi\xE1: Th\u1EA5p-Cao' },
    { value: 'price-desc', label: 'Gi\xE1: Cao-Th\u1EA5p' },
    { value: 'name', label: 'T\xEAn A-Z' },
    { value: 'rating', label: '\u0110\xE1nh gi\xE1' },
  ];

  if (loading && !shopData) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 shimmer" />
          <div className="h-4 w-40 mx-auto rounded shimmer mb-2" />
          <div className="h-3 w-56 mx-auto rounded shimmer" />
        </div>
      </div>
    );
  }

  if (!shopData) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center text-slate-500">
        <div className="text-center">
          <FaStore size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">Kh\xF4ng t\xECm th\u1EA5y c\u1EEDa h\xE0ng</p>
          <Link to="/" className="text-blue-400 text-sm mt-2 inline-block">V\u1EC1 trang ch\u1EE7</Link>
        </div>
      </div>
    );
  }

  const { shop, thongKe, danhMucs, sanPhams, pagination } = shopData;

  return (
    <div className="min-h-screen bg-[#050816]">
      {/* Shop Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent">
        <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-4 transition">
            <FaArrowLeft size={12} /> Trang ch\u1EE7
          </Link>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-blue-600/20 overflow-hidden flex-shrink-0">
              {shop.Logo ? (
                <img src={getImageUrl(shop.Logo)} alt={shop.TenCuaHang} className="w-full h-full object-cover" />
              ) : (
                shop.TenCuaHang?.[0] || 'S'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-white">{shop.TenCuaHang}</h1>
              <p className="text-slate-400 text-sm mt-1 line-clamp-2">{shop.MoTa || 'Ch\u01B0a c\xF3 m\xF4 t\u1EA3'}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                <span><FaBox size={10} className="inline mr-1 text-blue-400" />{thongKe.tongSP} s\u1EA3n ph\u1EA9m</span>
                <span><FaStar size={10} className="inline mr-1 text-yellow-500" />M\u1EDBi</span>
                <span><FaClock size={10} className="inline mr-1" />Tham gia {shop.NgayTao ? new Date(shop.NgayTao).toLocaleDateString('vi-VN') : ''}</span>
              </div>
              <div className="flex gap-2 mt-3">
                {isAuthenticated && (
                  <Link to={'/chat?room='}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1">
                    <FaComments size={10} /> Chat v\u1EDBi shop
                  </Link>
                )}
                <a href={'tel:' + (shop.SoDienThoai || '')}
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1">
                  <FaPhone size={10} /> {shop.SoDienThoai || 'Li\xEAn h\u1EC7'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="border-y border-white/[0.06] bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'S\u1EA3n ph\u1EA9m', value: thongKe.tongSP, icon: FaShoppingBag, color: 'text-blue-400' },
              { label: '\u0110\xE1nh gi\xE1', value: thongKe.tongFollow > 0 ? '' + thongKe.tongFollow : '0', icon: FaStar, color: 'text-yellow-400' },
              { label: 'Theo d\xF5i', value: thongKe.tongFollow, icon: FaEye, color: 'text-emerald-400' },
              { label: 'Ph\u1EA3n h\u1ED3i', value: 'Chat', icon: FaComments, color: 'text-purple-400' },
            ].map(({ label, value, icon: Icon, color }, i) => (
              <div key={i} className="text-center py-1">
                <Icon size={16} className={'mx-auto mb-0.5 ' + color} />
                <p className="text-white text-sm font-bold">{value}</p>
                <p className="text-slate-500 text-[10px]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="T\xECm s\u1EA3n ph\u1EA9m trong shop..." 
              className="w-full bg-slate-800/50 text-white text-sm pl-9 pr-4 py-2 rounded-xl border border-white/[0.06] focus:border-blue-500/50 outline-none transition placeholder:text-slate-600" />
          </form>
          <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}
            className="bg-slate-800/50 text-white text-sm px-3 py-2 rounded-xl border border-white/[0.06] outline-none focus:border-blue-500/50">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Category tabs */}
        {danhMucs && danhMucs.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-2" style={{ scrollbarWidth: 'none' }}>
            <button onClick={() => { setDanhMuc(''); setPage(1); }}
              className={'text-xs px-3 py-1.5 rounded-full border transition whitespace-nowrap flex-shrink-0 ' + (!danhMuc ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800/50 text-slate-400 border-white/[0.06] hover:text-white')}>
              T\u1EA5t c\u1EA3 ({thongKe.tongSP})
            </button>
            {danhMucs.map(dm => (
              <button key={dm.MaDanhMuc} onClick={() => { setDanhMuc(dm.MaDanhMuc); setPage(1); }}
                className={'text-xs px-3 py-1.5 rounded-full border transition whitespace-nowrap flex-shrink-0 ' + (danhMuc == dm.MaDanhMuc ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800/50 text-slate-400 border-white/[0.06] hover:text-white')}>
                {dm.TenDanhMuc} ({dm.SoSP})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Products */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-slate-800/30 rounded-xl overflow-hidden border border-white/[0.06]">
                <div className="aspect-square shimmer" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-full rounded shimmer" />
                  <div className="h-4 w-20 rounded shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : sanPhams.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <FaBox size={56} className="mx-auto mb-4 opacity-20" />
            <p className="text-base">Kh\xF4ng t\xECm th\u1EA5y s\u1EA3n ph\u1EA9m</p>
            <p className="text-xs text-slate-600 mt-1">Th\u1EED b\u1ECF l\u1ECDc ho\u1EB7c t\xECm ki\u1EBFm kh\xE1c</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sanPhams.map((sp, i) => (
                <motion.div key={sp.MaSanPham} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <ProductCard product={sp} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="w-9 h-9 rounded-lg bg-slate-800/50 border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 transition">
                  <FaChevronLeft size={12} />
                </button>
                {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                  let p = i + 1;
                  if (pagination.totalPages > 5) {
                    const start = Math.max(1, page - 2);
                    const end = Math.min(pagination.totalPages, start + 4);
                    p = start + i;
                    if (p > pagination.totalPages) return null;
                  }
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={'w-9 h-9 rounded-lg text-sm font-medium transition ' + (page === p ? 'bg-blue-600 text-white' : 'bg-slate-800/50 text-slate-400 hover:text-white border border-white/[0.06]')}>
                      {p}
                    </button>
                  );
                })}
                <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}
                  className="w-9 h-9 rounded-lg bg-slate-800/50 border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 transition">
                  <FaChevronRight size={12} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}