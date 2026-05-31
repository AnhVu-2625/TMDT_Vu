import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiPackage } from 'react-icons/fi';
import { useSellerStore } from '../../store/sellerStore';
import { toast } from 'react-toastify';

export default function Products() {
  const { products, fetchMyProducts, loading } = useSellerStore();

  useEffect(() => { fetchMyProducts(); }, []);

  const statusMap = {
    HOAT_DONG: { label: 'Đang bán', cls: 'badge-green' },
    AN: { label: 'Đã ẩn', cls: 'badge-gray' },
    HET_HANG: { label: 'Hết hàng', cls: 'badge-red' },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Sản phẩm của tôi</h1>
          <p className="text-slate-400 text-sm mt-1">{products.length} sản phẩm</p>
        </div>
        <Link to="/seller/products/new" className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus size={16} /> Thêm sản phẩm
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-xl shimmer" />)}
        </div>
      ) : products.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-20 glass-card rounded-2xl">
          <FiPackage size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Chưa có sản phẩm nào</h3>
          <p className="text-slate-400 mb-6">Bắt đầu đăng sản phẩm đầu tiên của bạn</p>
          <Link to="/seller/products/new" className="btn-primary inline-flex items-center gap-2">
            <FiPlus size={16} /> Thêm sản phẩm
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {products.map((p, i) => (
            <motion.div key={p.MaSanPham} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl p-4 flex items-center gap-4 group hover:border-red-500/20 transition-all">
              {/* Image */}
              <div className="w-16 h-16 rounded-lg bg-slate-800 flex-shrink-0 overflow-hidden">
                {p.AnhChinh ? (
                  <img src={`http://localhost:5000${p.AnhChinh}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <FiPackage size={20} />
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{p.TenSanPham}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm">
                  <span className="text-red-400 font-bold">
                    {(p.GiaThapNhat || p.GiaGoc || 0).toLocaleString()}đ
                  </span>
                  <span className="text-slate-500">Tồn: {p.TongTonKho || 0}</span>
                  <span className="text-slate-500">{p.SoPhienBan || 0} phiên bản</span>
                </div>
              </div>
              {/* Status */}
              <div className={statusMap[p.TrangThai]?.cls || 'badge-gray'}>
                {statusMap[p.TrangThai]?.label || p.TrangThai}
              </div>
              {/* Actions */}
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <Link to={`/products/${p.MaSanPham}`} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition" title="Xem">
                  <FiEye size={16} />
                </Link>
                <Link to={`/seller/products/${p.MaSanPham}/edit`} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-blue-400 transition" title="Sửa">
                  <FiEdit2 size={16} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
