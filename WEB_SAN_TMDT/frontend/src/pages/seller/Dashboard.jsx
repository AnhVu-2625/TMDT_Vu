import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPackage, FiPlus, FiEdit2, FiTrash2, FiX, FiSave,
  FiRefreshCw, FiShoppingBag, FiDollarSign, FiEye, FiEyeOff
} from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const EMPTY_FORM = {
  tenSanPham: '',
  moTa: '',
  giaGoc: '',
  maDanhMuc: '',
  trangThai: 'HOAT_DONG',
};

// ─── Modal Thêm / Sửa Sản Phẩm ─────────────────────────────────────────────
function ProductModal({ product, categories, token, onClose, onSaved }) {
  const isEdit = !!product;
  const [form, setForm] = useState(isEdit ? {
    tenSanPham: product.TenSanPham || '',
    moTa: product.MoTa || '',
    giaGoc: product.GiaGoc || '',
    maDanhMuc: product.MaDanhMuc || '',
    trangThai: product.TrangThai || 'HOAT_DONG',
  } : { ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tenSanPham.trim()) return toast.warning('Vui lòng nhập tên sản phẩm');
    if (!form.giaGoc || Number(form.giaGoc) <= 0) return toast.warning('Vui lòng nhập giá hợp lệ');

    setSaving(true);
    try {
      const payload = {
        tenSanPham: form.tenSanPham.trim(),
        moTa: form.moTa.trim(),
        giaGoc: Number(form.giaGoc),
        maDanhMuc: form.maDanhMuc ? Number(form.maDanhMuc) : null,
        trangThai: form.trangThai,
      };

      if (isEdit) {
        await axios.put(`${API_URL}/products/${product.MaSanPham}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Cập nhật sản phẩm thành công! ✨');
      } else {
        await axios.post(`${API_URL}/products`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Thêm sản phẩm mới thành công! 🎉');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <h2 className="font-bold text-lg text-white flex items-center gap-2">
            {isEdit ? <><FiEdit2 className="text-yellow-400" /> Sửa sản phẩm</> : <><FiPlus className="text-green-400" /> Thêm sản phẩm mới</>}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <FiX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Tên sản phẩm <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.tenSanPham}
              onChange={e => setForm(f => ({ ...f, tenSanPham: e.target.value }))}
              placeholder="Nhập tên sản phẩm..."
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Giá gốc (₫) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                required
                min="1000"
                value={form.giaGoc}
                onChange={e => setForm(f => ({ ...f, giaGoc: e.target.value }))}
                placeholder="299000"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Danh mục</label>
              <select
                value={form.maDanhMuc}
                onChange={e => setForm(f => ({ ...f, maDanhMuc: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500 transition"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => (
                  <option key={c.MaDanhMuc} value={c.MaDanhMuc}>{c.TenDanhMuc}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Mô tả sản phẩm</label>
            <textarea
              rows={4}
              value={form.moTa}
              onChange={e => setForm(f => ({ ...f, moTa: e.target.value }))}
              placeholder="Mô tả chi tiết về sản phẩm..."
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500 transition resize-none"
            />
          </div>

          {isEdit && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Trạng thái</label>
              <select
                value={form.trangThai}
                onChange={e => setForm(f => ({ ...f, trangThai: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500 transition"
              >
                <option value="HOAT_DONG">🟢 Đang bán</option>
                <option value="AN">🔴 Ẩn sản phẩm</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-800/50">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl text-slate-400 hover:text-white transition font-medium">
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition shadow-lg shadow-red-600/20 disabled:opacity-50"
            >
              <FiSave size={14} />
              {saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Thêm sản phẩm')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Main Seller Dashboard ───────────────────────────────────────────────────
export default function SellerDashboard() {
  const { token } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Dùng API products của seller (lọc theo shop của token)
      const res = await axios.get(`${API_URL}/products/seller`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 100 }
      });
      // Lọc ra sản phẩm của shop mình
      const all = res.data.data?.products || [];
      setProducts(all);
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể tải danh sách sản phẩm';
      const requireShopRegister = err.response?.data?.requireShopRegister;
      const shopStatus = err.response?.data?.shopStatus;

      if (requireShopRegister) {
        toast.error('Bạn chưa đăng ký làm người bán (chưa có shop)');
      } else if (shopStatus) {
        toast.error(`Cửa hàng đang chờ duyệt: ${shopStatus}`);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/products/categories/all`);
      setCategories(res.data.data || []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleDelete = async (product) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.TenSanPham}"?\n(Sản phẩm sẽ bị ẩn, không xóa vĩnh viễn)`)) return;
    try {
      await axios.delete(`${API_URL}/products/${product.MaSanPham}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Đã xóa sản phẩm thành công!');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xóa sản phẩm');
    }
  };

  const handleToggleStatus = async (product) => {
    const newStatus = product.TrangThai === 'HOAT_DONG' ? 'AN' : 'HOAT_DONG';
    try {
      await axios.put(`${API_URL}/products/${product.MaSanPham}`, {
        tenSanPham: product.TenSanPham,
        moTa: product.MoTa,
        giaGoc: product.GiaGoc,
        maDanhMuc: product.MaDanhMuc,
        trangThai: newStatus,
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(newStatus === 'HOAT_DONG' ? 'Đã hiện sản phẩm' : 'Đã ẩn sản phẩm');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const filteredProducts = products.filter(p =>
    p.TenSanPham?.toLowerCase().includes(search.toLowerCase())
  );

  const totalActive = products.filter(p => p.TrangThai === 'HOAT_DONG').length;
  const totalRevenue = products.reduce((s, p) => s + (Number(p.GiaGoc) || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FiShoppingBag className="text-red-500" /> Quản lý sản phẩm
          </h1>
          <p className="text-slate-400 text-sm mt-1">Thêm, sửa, xóa sản phẩm của cửa hàng bạn</p>
        </div>
        <button
          onClick={() => { setEditingProduct(null); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition shadow-lg shadow-red-600/20"
        >
          <FiPlus size={16} /> Thêm sản phẩm
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Tổng sản phẩm', value: products.length, icon: FiPackage, color: 'text-blue-400' },
          { label: 'Đang bán', value: totalActive, icon: FiEye, color: 'text-green-400' },
          { label: 'Tổng giá trị', value: `₫${totalRevenue.toLocaleString('vi-VN')}`, icon: FiDollarSign, color: 'text-yellow-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 bg-slate-800 rounded-xl">
              <stat.icon className={stat.color} size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
              <p className="text-lg font-extrabold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Refresh */}
      <div className="flex gap-3 mb-5">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm kiếm sản phẩm..."
          className="flex-1 bg-slate-900/60 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500 transition"
        />
        <button
          onClick={fetchProducts}
          className="flex items-center gap-1.5 px-4 py-2.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition text-sm"
        >
          <FiRefreshCw size={14} /> Làm mới
        </button>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-16 bg-slate-900/60 rounded-xl animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
            <FiPackage className="text-slate-600" size={32} />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">
            {search ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}
          </h3>
          <p className="text-slate-400 text-sm mb-5">
            {search ? 'Thử từ khóa khác' : 'Thêm sản phẩm đầu tiên để bắt đầu bán hàng!'}
          </p>
          {!search && (
            <button
              onClick={() => { setEditingProduct(null); setShowModal(true); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition"
            >
              <FiPlus size={14} /> Thêm sản phẩm đầu tiên
            </button>
          )}
        </motion.div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/30">
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Sản phẩm</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Giá</th>
                <th className="text-center px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                <th className="text-center px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredProducts.map((p, i) => (
                <motion.tr
                  key={p.MaSanPham}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg flex-shrink-0 border border-slate-700">
                        📦
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate max-w-xs">{p.TenSanPham}</p>
                        <p className="text-xs text-slate-500">{p.TenDanhMuc || 'Chưa phân loại'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-sm font-bold text-red-400">
                      ₫{Number(p.GiaGoc || 0).toLocaleString('vi-VN')}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(p)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                        p.TrangThai === 'HOAT_DONG'
                          ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400'
                          : 'bg-slate-700/30 border-slate-600/30 text-slate-400 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400'
                      }`}
                      title="Click để đổi trạng thái"
                    >
                      {p.TrangThai === 'HOAT_DONG' ? <><FiEye size={10} /> Đang bán</> : <><FiEyeOff size={10} /> Đã ẩn</>}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => { setEditingProduct(p); setShowModal(true); }}
                        className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg transition"
                        title="Sửa sản phẩm"
                      >
                        <FiEdit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-2 text-red-400/60 hover:text-red-400 bg-red-950/20 hover:bg-red-950/40 border border-red-900/20 hover:border-red-900/40 rounded-lg transition"
                        title="Xóa sản phẩm"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-slate-800/50 text-xs text-slate-500">
            Hiển thị {filteredProducts.length} / {products.length} sản phẩm
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <ProductModal
            product={editingProduct}
            categories={categories}
            token={token}
            onClose={() => { setShowModal(false); setEditingProduct(null); }}
            onSaved={fetchProducts}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export const Products = SellerDashboard;
export const Orders = () => (
  <div className="max-w-3xl mx-auto px-4 py-12 text-center">
    <FiPackage className="text-slate-600 mx-auto mb-4" size={48} />
    <h2 className="text-xl font-bold text-white mb-2">Đơn hàng từ cửa hàng</h2>
    <p className="text-slate-400">Tính năng quản lý đơn hàng seller đang được phát triển.</p>
  </div>
);
