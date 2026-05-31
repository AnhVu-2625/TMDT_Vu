import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiPlus, FiEdit2, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PageHeader from '../../components/admin/PageHeader';
import { getPolicies, createPolicy, updatePolicy } from '../../services/adminApi';

const TYPES = [
  { value: 'CHI_TRA', label: 'Chính sách chi trả' },
  { value: 'BAO_MAT', label: 'Bảo mật' },
  { value: 'KHIEU_NAI', label: 'Khiếu nại' },
  { value: 'KHAC', label: 'Khác' },
];

const emptyForm = { tenChinhSach: '', noiDung: '', loaiChinhSach: 'KHAC' };

export default function AdminPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { mode: 'create'|'edit', data }
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    getPolicies()
      .then(r => setPolicies(r.data.data || []))
      .catch(() => toast.error('Không thể tải chính sách'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setModal({ mode: 'create' }); };
  const openEdit = (p) => {
    setForm({ tenChinhSach: p.TenChinhSach, noiDung: p.NoiDung, loaiChinhSach: p.LoaiChinhSach });
    setModal({ mode: 'edit', id: p.MaChinhSach });
  };

  const handleSubmit = async () => {
    if (!form.tenChinhSach || !form.noiDung) { toast.warning('Vui lòng điền đầy đủ'); return; }
    setSubmitting(true);
    try {
      if (modal.mode === 'create') {
        await createPolicy(form);
        toast.success('Đã tạo chính sách mới');
      } else {
        await updatePolicy(modal.id, form);
        toast.success('Đã cập nhật chính sách');
      }
      setModal(null); load();
    } catch { toast.error('Thao tác thất bại'); }
    finally { setSubmitting(false); }
  };

  return (
    <div>
      <PageHeader
        title="Chính sách sử dụng"
        subtitle="Quản lý các chính sách của nền tảng"
        action={
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors">
            <FiPlus size={14} /> Thêm chính sách
          </button>
        }
      />

      {loading ? (
        <div className="text-center py-16 text-gray-500">Đang tải...</div>
      ) : policies.length === 0 ? (
        <div className="text-center py-16">
          <FiFileText size={40} className="mx-auto text-gray-700 mb-3" />
          <p className="text-gray-500">Chưa có chính sách nào</p>
          <button onClick={openCreate} className="mt-3 text-sm text-red-400 hover:text-red-300">Tạo chính sách đầu tiên</button>
        </div>
      ) : (
        <div className="grid gap-3">
          {policies.map(p => (
            <motion.div key={p.MaChinhSach} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium">{p.TenChinhSach}</h3>
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                      {TYPES.find(t => t.value === p.LoaiChinhSach)?.label || p.LoaiChinhSach}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-3">{p.NoiDung}</p>
                  <p className="text-xs text-gray-600 mt-2">
                    Cập nhật: {new Date(p.NgayCapNhat || p.NgayTao).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <button onClick={() => openEdit(p)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-colors">
                  <FiEdit2 size={12} /> Sửa
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-2xl">
            <h3 className="text-white font-semibold mb-4">
              {modal.mode === 'create' ? 'Thêm chính sách mới' : 'Cập nhật chính sách'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Tên chính sách</label>
                <input value={form.tenChinhSach} onChange={e => setForm(f => ({ ...f, tenChinhSach: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Loại</label>
                <select value={form.loaiChinhSach} onChange={e => setForm(f => ({ ...f, loaiChinhSach: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500">
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Nội dung</label>
                <textarea value={form.noiDung} onChange={e => setForm(f => ({ ...f, noiDung: e.target.value }))}
                  rows={8}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-5">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Hủy</button>
              <button onClick={handleSubmit} disabled={submitting}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50">
                {submitting ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
