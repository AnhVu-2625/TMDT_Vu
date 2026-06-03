import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiPackage, FiShoppingBag, FiAlertTriangle } from 'react-icons/fi';
import { useSellerStore } from '../../store/sellerStore';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';

export default function Products() {
  const { products, fetchMyProducts, deleteProduct, loading } = useSellerStore();
  const { user } = useAuthStore();
  const shopId = user?.shop?.MaCuaHang;
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { fetchMyProducts(); }, []);

  const handleDelete = async (p) => {
    try {
      await deleteProduct(p.MaSanPham);
      toast.success(`Đã xóa "${p.TenSanPham}"`);
      fetchMyProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa thất bại');
    }
    setDeleting(null);
  };

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
        <div className="flex gap-2">
          {shopId && (
            <Link to={`/shop/${shopId}`} className="btn-outline flex items-center gap-2 text-sm text-red-400 border-red-500/30 hover:bg-red-500/10">
              <FiShoppingBag size={16} /> Mua hàng
            </Link>
          )}
          <Link to="/seller/products/new" className="btn-primary flex items-center gap-2 text-sm">
            <FiPlus size={16} /> Thêm sản phẩm
          </Link>
        </div>
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
                <button onClick={() => setDeleting(p)} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-red-400 transition" title="Xóa">
                  <FiTrash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleting(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 border border-red-800/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
                  <FiAlertTriangle size={28} className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Xác nhận xóa</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Bạn có chắc muốn xóa "<span className="text-white font-semibold">{deleting.TenSanPham}</span>"?
                  </p>
                  <p className="text-xs text-red-400 mt-2">Hành động này không thể hoàn tác!</p>
                </div>
                <div className="flex gap-3 w-full">
                  <button onClick={() => setDeleting(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition">
                    Hủy
                  </button>
                  <button onClick={() => handleDelete(deleting)}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition">
                    Xóa
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}