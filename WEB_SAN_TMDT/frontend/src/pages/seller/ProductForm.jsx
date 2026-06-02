import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave, FiPlus, FiTrash2, FiUploadCloud, FiX } from 'react-icons/fi';
import { useSellerStore } from '../../store/sellerStore';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createProduct, loading } = useSellerStore();
  const { token } = useAuthStore();
  const isEdit = Boolean(id);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    tenSanPham: '', moTa: '', giaGoc: '', maDanhMuc: ''
  });
  const [variants, setVariants] = useState([
    { mauSac: '', kichThuoc: '', giaBan: '', soLuongTonKho: '' }
  ]);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const addVariant = () => setVariants([...variants, { mauSac: '', kichThuoc: '', giaBan: '', soLuongTonKho: '' }]);
  const removeVariant = (i) => setVariants(variants.filter((_, idx) => idx !== i));
  const updateVariant = (i, field, value) => {
    const updated = [...variants];
    updated[i][field] = value;
    setVariants(updated);
  };

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      // Preview ảnh trước khi upload
      const reader = new FileReader();
      reader.onload = (evt) => {
        setImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          preview: evt.target.result,
          file,
          isMain: images.length === 0,
          uploading: true
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (imageObj, productId) => {
    try {
      const formData = new FormData();
      formData.append('file', imageObj.file);
      formData.append('laAnhChinh', imageObj.isMain);

      const response = await axios.post(
        `${API_URL}/products/${productId}/upload-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tenSanPham || !form.giaGoc) {
      return toast.error('Vui lòng điền tên và giá sản phẩm');
    }
    if (images.length === 0) {
      return toast.error('Vui lòng thêm ít nhất 1 ảnh sản phẩm');
    }
    
    try {
      setUploading(true);
      console.log('📤 Submitting product:', {
        tenSanPham: form.tenSanPham,
        moTa: form.moTa,
        giaGoc: parseFloat(form.giaGoc),
        maDanhMuc: form.maDanhMuc ? parseInt(form.maDanhMuc) : null
      });

      const result = await createProduct({
        tenSanPham: form.tenSanPham,
        moTa: form.moTa,
        giaGoc: parseFloat(form.giaGoc),
        maDanhMuc: form.maDanhMuc ? parseInt(form.maDanhMuc) : null
      });

      const productId = result.data.maSanPham;
      console.log('✅ Product created:', productId);

      // Upload ảnh
      for (const img of images) {
        if (img.file) {
          try {
            console.log('📸 Uploading image:', img.file.name);
            await uploadImage(img, productId);
          } catch (err) {
            console.error('Upload ảnh thất bại:', err);
          }
        }
      }

      // Upload phiên bản (variants)
      for (const variant of variants) {
        if (variant.giaBan && variant.soLuongTonKho) {
          try {
            console.log('📝 Creating variant:', variant);
            await axios.post(
              `${API_URL}/products/${productId}/variants`,
              {
                mauSac: variant.mauSac || null,
                kichThuoc: variant.kichThuoc || null,
                giaBan: parseFloat(variant.giaBan),
                soLuongTonKho: parseInt(variant.soLuongTonKho)
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );
          } catch (err) {
            console.error('Tạo phiên bản thất bại:', err);
          }
        }
      }

      setUploading(false);
      toast.success('Tạo sản phẩm thành công!');
      navigate('/seller/products');
    } catch (err) {
      console.error('❌ Submit error details:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        errors: err.response?.data?.errors,
        fullError: err.response?.data
      });
      setUploading(false);
      if (err.response?.data?.errors) {
        const errorMsg = err.response.data.errors.map(e => `${e.param}: ${e.msg}`).join(', ');
        toast.error(errorMsg);
      } else {
        toast.error(err.response?.data?.message || 'Lỗi tạo sản phẩm');
      }
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
              <label className="block text-sm font-medium text-slate-300 mb-2">Mô tả sản phẩm</label>
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

          {/* Image upload */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Hình ảnh sản phẩm</h2>

            {/* Upload area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-slate-600 hover:border-emerald-500 rounded-xl p-8 text-center cursor-pointer transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3">
                <FiUploadCloud size={32} className="text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-white">Kéo thả hoặc nhấp để chọn ảnh</p>
                  <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP (tối đa 10MB)</p>
                </div>
              </div>
            </div>

            {/* Image preview grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.map((img) => (
                  <div key={img.id} className="relative group">
                    <img src={img.preview} alt="preview" className="w-full h-24 object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <label className="cursor-pointer">
                        <input
                          type="radio"
                          checked={img.isMain}
                          onChange={() => setImages(images.map((i) => ({
                            ...i,
                            isMain: i.id === img.id
                          })))}
                          className="hidden"
                        />
                        <span className="text-xs text-white font-medium">Ảnh chính</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setImages(images.filter(i => i.id !== img.id))}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                    {img.isMain && (
                      <div className="absolute top-1 right-1 bg-emerald-500 text-white text-xs px-2 py-1 rounded">
                        Chính
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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
            <button type="submit" disabled={loading || uploading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading || uploading ? <div className="spinner w-5 h-5 border-2" /> : <FiSave size={16} />}
              {loading || uploading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo sản phẩm'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
