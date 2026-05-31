import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiSend, FiUsers, FiShoppingBag } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function Notifications() {
  const [form, setForm] = useState({ title: '', content: '', target: 'all' });
  const [sending, setSending] = useState(false);

  const [history] = useState([
    { id: 1, title: 'Cập nhật chính sách mới', target: 'Tất cả', date: '30/05/2026', count: 1250 },
    { id: 2, title: 'Flash Sale tháng 6', target: 'Người mua', date: '28/05/2026', count: 980 },
    { id: 3, title: 'Hướng dẫn đăng sản phẩm', target: 'Seller', date: '25/05/2026', count: 156 },
  ]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!form.title || !form.content) return toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung');
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success('Đã gửi thông báo thành công!');
      setForm({ title: '', content: '', target: 'all' });
    }, 1000);
  };

  const targets = [
    { value: 'all', label: 'Tất cả', icon: FiUsers },
    { value: 'buyers', label: 'Người mua', icon: FiShoppingBag },
    { value: 'sellers', label: 'Seller', icon: FiShoppingBag },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FiBell className="text-yellow-400" /> Thông báo hệ thống
        </h1>
        <p className="text-slate-400 text-sm mt-1">Gửi thông báo đến người dùng</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <motion.form onSubmit={handleSend} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-bold text-white">Tạo thông báo mới</h2>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tiêu đề</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="VD: Cập nhật chính sách mới" className="input-field" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Nội dung</label>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
              placeholder="Nội dung thông báo..." rows={4} className="input-field resize-none" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Đối tượng nhận</label>
            <div className="flex gap-2">
              {targets.map(t => (
                <button key={t.value} type="button" onClick={() => setForm({ ...form, target: t.value })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${form.target === t.value ? 'bg-red-600 text-white' : 'bg-white/[0.04] text-slate-400 border border-white/[0.06]'}`}>
                  <t.icon size={14} /> {t.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={sending}
            className="btn-primary w-full flex items-center justify-center gap-2">
            {sending ? <div className="spinner w-5 h-5 border-2" /> : <FiSend size={16} />}
            {sending ? 'Đang gửi...' : 'Gửi thông báo'}
          </button>
        </motion.form>

        {/* History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Lịch sử gửi</h2>
          <div className="space-y-3">
            {history.map((n, i) => (
              <div key={n.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white font-medium text-sm">{n.title}</p>
                  <span className="text-xs text-slate-500">{n.date}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="badge-blue">{n.target}</span>
                  <span>📤 {n.count} người nhận</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
