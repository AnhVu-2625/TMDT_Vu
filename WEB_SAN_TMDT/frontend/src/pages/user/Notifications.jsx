import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaBell, FaCheck, FaStore, FaShoppingBag, FaTag } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TYPE_ICONS = {
  DON_HANG: { icon: FaShoppingBag, color: 'text-blue-400 bg-blue-400/10' },
  KHUYEN_MAI: { icon: FaTag, color: 'text-green-400 bg-green-400/10' },
  HE_THONG: { icon: FaBell, color: 'text-yellow-400 bg-yellow-400/10' },
  CUA_HANG: { icon: FaStore, color: 'text-red-400 bg-red-400/10' },
};

export default function Notifications() {
  const { token } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/users/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data.data || []);
    } catch {
      toast.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await axios.put(`${API_URL}/users/notifications/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.MaThongBao === id ? { ...n, DaDoc: true } : n));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.DaDoc).map(n => n.MaThongBao);
    if (unreadIds.length === 0) return;
    try {
      await Promise.all(unreadIds.map(id =>
        axios.put(`${API_URL}/users/notifications/${id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ));
      setNotifications(prev => prev.map(n => ({ ...n, DaDoc: true })));
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch {}
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-20 space-y-3">
      {[1,2,3,4].map(i => <div key={i} className="h-20 bg-slate-800/60 rounded-xl animate-pulse" />)}
    </div>
  );

  const unread = notifications.filter(n => !n.DaDoc).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FaBell className="text-yellow-400" /> Thông báo
        </h1>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <>
              <span className="text-xs bg-red-600 text-white px-2.5 py-1 rounded-full font-bold">{unread} chưa đọc</span>
              <button onClick={handleMarkAllRead}
                className="text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition font-semibold">
                Đã đọc tất cả
              </button>
            </>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔔</div>
          <h2 className="text-xl font-bold text-white mb-2">Chưa có thông báo</h2>
          <p className="text-slate-400">Bạn sẽ nhận được thông báo về đơn hàng và khuyến mãi tại đây.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const typeInfo = TYPE_ICONS[n.LoaiThongBao] || TYPE_ICONS.HE_THONG;
            const Icon = typeInfo.icon;
            return (
              <motion.div
                key={n.MaThongBao}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => !n.DaDoc && handleMarkRead(n.MaThongBao)}
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  n.DaDoc
                    ? 'bg-slate-900/40 border-slate-800/30 hover:border-slate-700'
                    : 'bg-slate-900/80 border-red-500/20 hover:border-red-500/40 shadow-lg shadow-red-600/5'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeInfo.color}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.DaDoc ? 'text-slate-400' : 'text-white font-medium'}`}>{n.NoiDung}</p>
                  <p className="text-xs text-slate-500 mt-1">{new Date(n.NgayTao).toLocaleString('vi-VN')}</p>
                </div>
                {!n.DaDoc && (
                  <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-2" />
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
