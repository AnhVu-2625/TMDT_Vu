import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiSearch, FiTrash2, FiEye, FiAlertTriangle } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function Moderation() {
  const [activeTab, setActiveTab] = useState('products');

  const tabs = [
    { id: 'products', label: 'Sản phẩm vi phạm' },
    { id: 'reviews', label: 'Đánh giá vi phạm' },
    { id: 'shops', label: 'Shop vi phạm' },
  ];

  // Mock data — thay bằng API thực tế sau
  const items = [
    { id: 1, name: 'Sản phẩm giả mạo thương hiệu', shop: 'Shop ABC', reportCount: 5, status: 'pending' },
    { id: 2, name: 'Sản phẩm mô tả sai lệch', shop: 'Shop XYZ', reportCount: 3, status: 'pending' },
    { id: 3, name: 'Hình ảnh không phù hợp', shop: 'Shop DEF', reportCount: 8, status: 'resolved' },
  ];

  const handleRemove = (id) => {
    toast.success('Đã gỡ bài vi phạm #' + id);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FiShield className="text-purple-400" /> Kiểm duyệt hệ thống
        </h1>
        <p className="text-slate-400 text-sm mt-1">Kiểm duyệt nội dung & gỡ bài vi phạm</p>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'bg-red-600 text-white' : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <FiAlertTriangle className="text-red-400" />
              </div>
              <div>
                <p className="text-white font-medium">{item.name}</p>
                <p className="text-sm text-slate-400">Shop: {item.shop} • {item.reportCount} báo cáo</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={item.status === 'pending' ? 'badge-yellow' : 'badge-green'}>
                {item.status === 'pending' ? 'Chờ xử lý' : 'Đã xử lý'}
              </span>
              <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition" title="Xem chi tiết">
                <FiEye size={16} />
              </button>
              <button onClick={() => handleRemove(item.id)}
                className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition" title="Gỡ bài">
                <FiTrash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
