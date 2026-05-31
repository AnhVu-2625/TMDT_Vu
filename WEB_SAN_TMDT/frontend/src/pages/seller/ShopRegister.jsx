import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiMapPin, FiPhone, FiUpload, FiSave, FiSend, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useSellerStore } from '../../store/sellerStore';
import { useAuthStore } from '../../store/authStore';

export default function ShopRegister() {
  const navigate = useNavigate();
  const { registerShop, saveDraft, fetchMyShop, loading } = useSellerStore();
  const { user } = useAuthStore();

  const [form, setForm] = useState({
    tenCuaHang: '', moTa: '', diaChiKho: '', sdtCuaHang: ''
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Load draft if exists
  useEffect(() => {
    (async () => {
      const shop = await fetchMyShop();
      if (shop) {
        if (shop.TrangThai === 'HOAT_DONG') return navigate('/seller/dashboard');
        if (shop.TrangThai === 'CHO_DUYET') return navigate('/seller/pending');
        // NHAP → load draft
        setForm({
          tenCuaHang: shop.TenCuaHang || '',
          moTa: shop.MoTa || '',
          diaChiKho: shop.DiaChiKho || '',
          sdtCuaHang: shop.SDTCuaHang || ''
        });
      }
    })();
  }, []);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append('tenCuaHang', form.tenCuaHang);
    fd.append('moTa', form.moTa);
    fd.append('diaChiKho', form.diaChiKho);
    fd.append('sdtCuaHang', form.sdtCuaHang);
    if (file) fd.append('anhGiayTo', file);
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tenCuaHang || !form.diaChiKho || !form.sdtCuaHang) {
      return toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
    }
    try {
      await registerShop(buildFormData());
      toast.success('Gửi hồ sơ thành công! Vui lòng chờ Admin duyệt.');
      navigate('/seller/pending');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDraft = async () => {
    try {
      await saveDraft(buildFormData());
      toast.success('Đã lưu nháp thành công');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition">
          <FiArrowLeft /> Quay lại
        </button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-800 flex items-center justify-center shadow-lg shadow-red-500/20">
              <FiShoppingCart size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Đăng ký mở Shop</h1>
              <p className="text-slate-400">Trở thành Người bán trên MartHub</p>
            </div>
          </div>
          {/* Steps indicator */}
          <div className="flex items-center gap-3 mt-6">
            {['Điền thông tin', 'Chờ duyệt', 'Bắt đầu bán'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-red-600 text-white' : 'bg-white/5 text-slate-500 border border-white/10'}`}>
                  {i + 1}
                </div>
                <span className={`text-sm ${i === 0 ? 'text-white font-medium' : 'text-slate-500'}`}>{step}</span>
                {i < 2 && <div className="w-8 h-px bg-slate-700 mx-1" />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-8 space-y-6"
        >
          {/* Tên Shop */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              <FiShoppingCart className="inline mr-2 text-red-400" /> Tên cửa hàng <span className="text-red-500">*</span>
            </label>
            <input type="text" value={form.tenCuaHang} onChange={e => setForm({ ...form, tenCuaHang: e.target.value })}
              placeholder="VD: Shop Thời Trang ABC" className="input-field" required />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Mô tả cửa hàng</label>
            <textarea value={form.moTa} onChange={e => setForm({ ...form, moTa: e.target.value })}
              placeholder="Giới thiệu ngắn về cửa hàng của bạn..."
              rows={3} className="input-field resize-none" />
          </div>

          {/* Địa chỉ kho */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              <FiMapPin className="inline mr-2 text-red-400" /> Địa chỉ kho hàng <span className="text-red-500">*</span>
            </label>
            <input type="text" value={form.diaChiKho} onChange={e => setForm({ ...form, diaChiKho: e.target.value })}
              placeholder="VD: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM" className="input-field" required />
          </div>

          {/* SĐT Shop */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              <FiPhone className="inline mr-2 text-red-400" /> Số điện thoại Shop <span className="text-red-500">*</span>
            </label>
            <input type="tel" value={form.sdtCuaHang} onChange={e => setForm({ ...form, sdtCuaHang: e.target.value })}
              placeholder="0901234567" pattern="[0-9]{10,11}" className="input-field" required />
          </div>

          {/* Upload ảnh */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              <FiUpload className="inline mr-2 text-red-400" /> Ảnh CCCD / Giấy phép kinh doanh
            </label>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-red-500/30 transition cursor-pointer"
              onClick={() => document.getElementById('fileInput').click()}>
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded-lg object-contain" />
              ) : (
                <div className="text-slate-500">
                  <FiUpload size={32} className="mx-auto mb-2" />
                  <p>Click để tải ảnh lên</p>
                  <p className="text-xs mt-1">JPG, PNG, PDF - Tối đa 5MB</p>
                </div>
              )}
              <input id="fileInput" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFile} className="hidden" />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={handleDraft} disabled={loading}
              className="btn-outline flex-1 flex items-center justify-center gap-2">
              <FiSave size={16} /> Lưu nháp
            </button>
            <button type="submit" disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <div className="spinner w-5 h-5 border-2" /> : <FiSend size={16} />}
              {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
          </div>
        </motion.form>

        {/* Note */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-slate-400">
          <p className="font-semibold text-slate-300 mb-2">📌 Lưu ý:</p>
          <ul className="space-y-1 list-disc pl-5">
            <li>Hồ sơ sẽ được Admin xét duyệt trong vòng 24-48 giờ.</li>
            <li>Bạn có thể lưu nháp và quay lại hoàn tất sau.</li>
            <li>Sau khi được duyệt, bạn có thể đăng sản phẩm và nhận đơn hàng.</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
