import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiEdit3, FiSave, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function Policy() {
  const [policies, setPolicies] = useState([
    { id: 1, title: 'Chính sách bán hàng', content: 'Người bán phải cung cấp thông tin sản phẩm chính xác, hình ảnh thực tế, và tuân thủ quy định về chất lượng hàng hóa. Vi phạm sẽ bị gỡ bài và khóa shop.', updatedAt: '15/05/2026' },
    { id: 2, title: 'Chính sách đổi trả', content: 'Người mua có quyền đổi trả trong vòng 7 ngày kể từ ngày nhận hàng nếu sản phẩm bị lỗi, sai mô tả hoặc không đúng chất lượng cam kết.', updatedAt: '10/05/2026' },
    { id: 3, title: 'Chính sách thanh toán', content: 'MartHub hỗ trợ thanh toán qua VNPay, Momo, chuyển khoản ngân hàng và COD. Phí hoa hồng 5% trên mỗi đơn hàng thành công.', updatedAt: '01/05/2026' },
    { id: 4, title: 'Quy tắc cộng đồng', content: 'Nghiêm cấm đăng tải nội dung vi phạm pháp luật, xúc phạm, gian lận hoặc spam. Tài khoản vi phạm sẽ bị cảnh cáo hoặc khóa vĩnh viễn.', updatedAt: '20/04/2026' },
  ]);

  const [editing, setEditing] = useState(null);
  const [editContent, setEditContent] = useState('');

  const startEdit = (p) => {
    setEditing(p.id);
    setEditContent(p.content);
  };

  const saveEdit = (id) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, content: editContent, updatedAt: new Date().toLocaleDateString('vi-VN') } : p));
    setEditing(null);
    toast.success('Cập nhật chính sách thành công!');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FiBookOpen className="text-indigo-400" /> Chính sách sử dụng
        </h1>
        <p className="text-slate-400 text-sm mt-1">Cập nhật và quản lý chính sách nền tảng</p>
      </div>

      <div className="space-y-4">
        {policies.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">{p.title}</h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 flex items-center gap-1"><FiClock size={12} /> {p.updatedAt}</span>
                {editing === p.id ? (
                  <button onClick={() => saveEdit(p.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition">
                    <FiSave size={14} /> Lưu
                  </button>
                ) : (
                  <button onClick={() => startEdit(p)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-sm rounded-lg transition border border-white/[0.06]">
                    <FiEdit3 size={14} /> Sửa
                  </button>
                )}
              </div>
            </div>
            {editing === p.id ? (
              <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                className="input-field resize-none w-full" rows={4} />
            ) : (
              <p className="text-sm text-slate-300 leading-relaxed">{p.content}</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
