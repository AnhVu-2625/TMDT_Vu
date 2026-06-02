import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiSend, FiUsers } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PageHeader from '../../components/admin/PageHeader';
import { sendNotification, broadcastNotification } from '../../services/adminApi';

const TYPES = [
  { value: 'HE_THONG', label: 'Hệ thống' },
  { value: 'KHUYEN_MAI', label: 'Khuyến mãi' },
  { value: 'DON_HANG', label: 'Đơn hàng' },
];

export default function AdminNotifications() {
  const [tab, setTab] = useState('single');
  const [form, setForm] = useState({ userId: '', tieuDe: '', noiDung: '', loaiThongBao: 'HE_THONG' });
  const [broadcastForm, setBroadcastForm] = useState({ tieuDe: '', noiDung: '', loaiThongBao: 'HE_THONG' });
  const [submitting, setSubmitting] = useState(false);

  const handleSingle = async () => {
    if (!form.userId || !form.tieuDe || !form.noiDung) {
      toast.warning('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setSubmitting(true);
    try {
      await sendNotification({
        ...form,
        userId: parseInt(form.userId),
      });
      toast.success('Đã gửi thông báo thành công');
      setForm({ userId: '', tieuDe: '', noiDung: '', loaiThongBao: 'HE_THONG' });
    } catch {
      toast.error('Gửi thông báo thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastForm.tieuDe || !broadcastForm.noiDung) {
      toast.warning('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (!window.confirm('Gửi thông báo đến TẤT CẢ người dùng?')) return;
    setSubmitting(true);
    try {
      await broadcastNotification(broadcastForm);
      toast.success('Đã gửi thông báo đến tất cả người dùng');
      setBroadcastForm({ tieuDe: '', noiDung: '', loaiThongBao: 'HE_THONG' });
    } catch {
      toast.error('Gửi thông báo thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Gửi thông báo hệ thống"
        subtitle="Gửi thông báo đến người dùng cụ thể hoặc toàn bộ hệ thống"
      />

      <div className="flex gap-2 mb-6">
        {[
          { value: 'single', label: 'Gửi cá nhân', icon: FiBell },
          { value: 'broadcast', label: 'Gửi toàn hệ thống', icon: FiUsers },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.value
                ? 'bg-red-600 text-white'
                : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-xl">
        {tab === 'single' ? (
          <motion.div
            key="single"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4"
          >
            <div>
              <label className="text-xs text-gray-400 mb-1 block">ID người dùng</label>
              <input
                type="number"
                value={form.userId}
                onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
                placeholder="Nhập ID người dùng..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Loại thông báo</label>
              <select
                value={form.loaiThongBao}
                onChange={(e) => setForm((f) => ({ ...f, loaiThongBao: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Tiêu đề</label>
              <input
                value={form.tieuDe}
                onChange={(e) => setForm((f) => ({ ...f, tieuDe: e.target.value }))}
                placeholder="Tiêu đề thông báo..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Nội dung</label>
              <textarea
                value={form.noiDung}
                onChange={(e) => setForm((f) => ({ ...f, noiDung: e.target.value }))}
                rows={4}
                placeholder="Nội dung thông báo..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
              />
            </div>

            <button
              onClick={handleSingle}
              disabled={submitting}
              className="flex items-center gap-2 w-full justify-center py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              <FiSend size={14} /> {submitting ? 'Đang gửi...' : 'Gửi thông báo'}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="broadcast"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4"
          >
            <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-lg p-3">
              <p className="text-xs text-yellow-400">
                ⚠️ Thông báo này sẽ được gửi đến <strong>tất cả người dùng</strong> trên hệ thống. Hãy cân nhắc kỹ trước khi gửi.
              </p>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Loại thông báo</label>
              <select
                value={broadcastForm.loaiThongBao}
                onChange={(e) => setBroadcastForm((f) => ({ ...f, loaiThongBao: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Tiêu đề</label>
              <input
                value={broadcastForm.tieuDe}
                onChange={(e) => setBroadcastForm((f) => ({ ...f, tieuDe: e.target.value }))}
                placeholder="Tiêu đề thông báo..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Nội dung</label>
              <textarea
                value={broadcastForm.noiDung}
                onChange={(e) => setBroadcastForm((f) => ({ ...f, noiDung: e.target.value }))}
                rows={4}
                placeholder="Nội dung thông báo..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
              />
            </div>

            <button
              onClick={handleBroadcast}
              disabled={submitting}
              className="flex items-center gap-2 w-full justify-center py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              <FiUsers size={14} /> {submitting ? 'Đang gửi...' : 'Gửi đến tất cả người dùng'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

