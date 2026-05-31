import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useSellerStore } from '../../store/sellerStore';
import { toast } from 'react-toastify';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createProduct, loading } = useSellerStore();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    tenSanPham: '', moTa: '', giaGoc: '', maDanhMuc: ''
  });
  const [variants, setVariants] = useState([
    { mauSac: '', kichThuoc: '', giaBan: '', soLuongTonKho: '' }
  ]);

  const addVariant = () => setVariants([...variants, { mauSac: '', kichThuoc: '', giaBan: '', soLuongTonKho: '' }]);
  const removeVariant = (i) => setVariants(variants.filter((_, idx) => idx !== i));
  const updateVariant = (i, field, value) => {
    const updated = [...variants];
    updated[i][field] = value;
    setVariants(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tenSanPham || !form.giaGoc) {
      return toast.error('Vui lòng điền tên và giá sản phẩm');
    }
    try {
      const result = await createProduct({
        tenSanPham: form.tenSanPham,
        moTa: form.moTa,
        giaGoc: parseFloat(form.giaGoc),
        maDanhMuc: form.maDanhMuc ? parseInt(form.maDanhMuc) : null
      });
      toast.success('Tạo sản phẩm thành công!');
      navigate('/seller/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi tạo sản phẩm');
    }
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition">
        <FiArrowLeft /> Quay lại
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white mb-6">{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic info */}
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white">Thông tin cơ bản</h2>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tên sản phẩm <span className="text-red-500">*</span></label>
              <input type="text" value={form.tenSanPham} onChange={e => setForm({ ...form, tenSanPham: e.target.value })}
                placeholder="VD: Áo thun nam cotton cao cấp" className="input-field" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Mô tả sản phẩm <span className="text-red-500">*</span></label>
              <textarea value={form.moTa} onChange={e => setForm({ ...form, moTa: e.target.value })}
                placeholder="Chi tiết về sản phẩm, chất liệu, công dụng..." rows={4} className="input-field resize-none" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Giá gốc (VNĐ) <span className="text-red-500">*</span></label>
                <input type="number" value={form.giaGoc} onChange={e => setForm({ ...form, giaGoc: e.target.value })}
                  placeholder="299000" min="0" className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Mã danh mục</label>
                <input type="number" value={form.maDanhMuc} onChange={e => setForm({ ...form, maDanhMuc: e.target.value })}
                  placeholder="VD: 1" className="input-field" />
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Phiên bản sản phẩm</h2>
              <button type="button" onClick={addVariant} className="btn-outline text-sm flex items-center gap-1">
                <FiPlus size={14} /> Thêm phiên bản
              </button>
            </div>
            <p className="text-sm text-slate-400">Thêm các phiên bản (màu sắc, kích thước) cho sản phẩm</p>

            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <input type="text" value={v.mauSac} onChange={e => updateVariant(i, 'mauSac', e.target.value)}
                  placeholder="Màu sắc" className="input-field text-sm" />
                <input type="text" value={v.kichThuoc} onChange={e => updateVariant(i, 'kichThuoc', e.target.value)}
                  placeholder="Kích thước" className="input-field text-sm" />
                <input type="number" value={v.giaBan} onChange={e => updateVariant(i, 'giaBan', e.target.value)}
                  placeholder="Giá bán" className="input-field text-sm" />
                <input type="number" value={v.soLuongTonKho} onChange={e => updateVariant(i, 'soLuongTonKho', e.target.value)}
                  placeholder="Tồn kho" className="input-field text-sm" />
                {variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(i)} className="flex items-center justify-center text-red-400 hover:text-red-300">
                    <FiTrash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button type="button" onClick={() => navigate(-1)} className="btn-outline flex-1">Hủy</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <div className="spinner w-5 h-5 border-2" /> : <FiSave size={16} />}
              {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo sản phẩm'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
