import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiLock, FiRefreshCw, FiShoppingBag } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PageHeader from '../../components/admin/PageHeader';
import Badge from '../../components/admin/Badge';
import { getShops, approveShop, rejectShop, lockShop } from '../../services/adminApi';

const TABS = [
  { value: 'CHO_DUYET', label: 'Chờ duyệt' },
  { value: 'HOAT_DONG', label: 'Đang hoạt động' },
  { value: 'BI_KHOA',   label: 'Bị khóa' },
  { value: '',          label: 'Tất cả' },
];

export default function AdminShops() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('CHO_DUYET');
  const [modal, setModal] = useState(null); // { type: 'reject'|'lock', shop }
  const [reason, setReason] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    getShops({ trangThai: tab })
      .then(r => setShops(r.data.data || []))
      .catch(() => toast.error('Không thể tải danh sách cửa hàng'))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (shop) => {
    try {
      await approveShop(shop.MaCuaHang);
      toast.success(`Đã duyệt cửa hàng "${shop.TenCuaHang}"`);
      load();
    } catch { toast.error('Thao tác thất bại'); }
  };

  const handleReject = async () => {
    try {
      await rejectShop(modal.shop.MaCuaHang, reason);
      toast.success('Đã từ chối đăng ký');
      setModal(null); setReason(''); load();
    } catch { toast.error('Thao tác thất bại'); }
  };

  const handleLock = async () => {
    try {
      await lockShop(modal.shop.MaCuaHang, reason);
      toast.success(`Đã khóa cửa hàng "${modal.shop.TenCuaHang}"`);
      setModal(null); setReason(''); load();
    } catch { toast.error('Thao tác thất bại'); }
  };

  return (
    <div>
      <PageHeader
        title="Duyệt đăng ký mở cửa hàng"
        subtitle="Xét duyệt và quản lý cửa hàng trên nền tảng"
        action={
          <button onClick={load} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <FiRefreshCw size={14} /> Làm mới
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.value ? 'bg-red-600 text-white' : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="text-center py-16 text-gray-500">Đang tải...</div>
      ) : shops.length === 0 ? (
        <div className="text-center py-16">
          <FiShoppingBag size={40} className="mx-auto text-gray-700 mb-3" />
          <p className="text-gray-500">Không có cửa hàng nào</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {shops.map(shop => (
            <motion.div
              key={shop.MaCuaHang}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Logo */}
                  <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center shrink-0">
                    {shop.Logo
                      ? <img src={shop.Logo} alt="" className="w-full h-full object-cover rounded-xl" />
                      : <FiShoppingBag size={20} className="text-gray-500" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold">{shop.TenCuaHang}</h3>
                      <Badge status={shop.TrangThai} />
                    </div>
                    <p className="text-sm text-gray-400 mb-1">
                      Chủ: <span className="text-gray-300">{shop.HoTen}</span>
                      <span className="mx-2 text-gray-600">·</span>
                      <span className="text-gray-400">{shop.Email}</span>
                    </p>
                    {shop.MoTa && (
                      <p className="text-xs text-gray-500 line-clamp-2">{shop.MoTa}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      Đăng ký: {new Date(shop.NgayTao).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  {shop.TrangThai === 'CHO_DUYET' && (
                    <>
                      <button
                        onClick={() => handleApprove(shop)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
                      >
                        <FiCheck size={13} /> Duyệt
                      </button>
                      <button
                        onClick={() => setModal({ type: 'reject', shop })}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs rounded-lg transition-colors"
                      >
                        <FiX size={13} /> Từ chối
                      </button>
                    </>
                  )}
                  {shop.TrangThai === 'HOAT_DONG' && (
                    <button
                      onClick={() => setModal({ type: 'lock', shop })}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-colors"
                    >
                      <FiLock size={13} /> Khóa shop
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-white font-semibold mb-1">
              {modal.type === 'reject' ? 'Từ chối đăng ký' : 'Khóa cửa hàng'}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {modal.type === 'reject'
                ? `Từ chối đăng ký của "${modal.shop.TenCuaHang}"?`
                : `Khóa cửa hàng "${modal.shop.TenCuaHang}"?`
              }
            </p>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Lý do..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 mb-4 resize-none"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setModal(null); setReason(''); }}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                Hủy
              </button>
              <button
                onClick={modal.type === 'reject' ? handleReject : handleLock}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Xác nhận
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
