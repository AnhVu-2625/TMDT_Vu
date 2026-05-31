import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiCheck, FiTruck, FiX, FiUser, FiPhone } from 'react-icons/fi';
import { useSellerStore } from '../../store/sellerStore';
import { toast } from 'react-toastify';

const statusConfig = {
  CHO_XAC_NHAN: { label: 'Chờ xác nhận', cls: 'badge-yellow', nextAction: 'DA_XAC_NHAN', nextLabel: 'Xác nhận' },
  DA_XAC_NHAN: { label: 'Đã xác nhận', cls: 'badge-blue', nextAction: 'DANG_GIAO', nextLabel: 'Giao hàng' },
  DANG_GIAO: { label: 'Đang giao', cls: 'badge-blue', nextAction: 'DA_GIAO', nextLabel: 'Hoàn thành' },
  DA_GIAO: { label: 'Đã giao', cls: 'badge-green' },
  DA_HUY: { label: 'Đã hủy', cls: 'badge-red' },
};

export default function SellerOrders() {
  const { orders, fetchMyOrders, updateOrderStatus, loading } = useSellerStore();
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { fetchMyOrders(); }, []);

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.TrangThaiDonHang === filter);

  const handleStatus = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success('Cập nhật trạng thái thành công');
      fetchMyOrders();
    } catch (err) {
      toast.error('Lỗi cập nhật trạng thái');
    }
  };

  const filterTabs = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'CHO_XAC_NHAN', label: 'Chờ xác nhận' },
    { value: 'DA_XAC_NHAN', label: 'Đã xác nhận' },
    { value: 'DANG_GIAO', label: 'Đang giao' },
    { value: 'DA_GIAO', label: 'Hoàn thành' },
    { value: 'DA_HUY', label: 'Đã hủy' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Quản lý đơn hàng</h1>
      <p className="text-slate-400 text-sm mb-6">{orders.length} đơn hàng</p>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {filterTabs.map(tab => (
          <button key={tab.value} onClick={() => setFilter(tab.value)}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === tab.value ? 'bg-red-600 text-white' : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-xl shimmer" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-2xl">
          <FiShoppingBag size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Không có đơn hàng</h3>
          <p className="text-slate-400">Chưa có đơn hàng nào trong mục này</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order, i) => {
            const config = statusConfig[order.TrangThaiDonHang] || {};
            return (
              <motion.div key={order.MaDonHang} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">Đơn #{order.MaDonHang}</span>
                    <span className={config.cls}>{config.label}</span>
                  </div>
                  <span className="text-xs text-slate-500">{new Date(order.NgayTao).toLocaleDateString('vi-VN')}</span>
                </div>

                {/* Buyer info */}
                <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <FiUser className="text-slate-400" />
                  <span className="text-sm text-white">{order.TenNguoiMua}</span>
                  <FiPhone className="text-slate-400 ml-2" />
                  <span className="text-sm text-slate-300">{order.SDTNguoiMua}</span>
                </div>

                {/* Items */}
                {order.chiTiet?.map(item => (
                  <div key={item.MaChiTiet || item.MaPhienBan} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex-shrink-0 overflow-hidden flex items-center justify-center text-slate-600 text-xs">
                      {item.AnhSP ? <img src={`http://localhost:5000${item.AnhSP}`} alt="" className="w-full h-full object-cover" /> : '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{item.TenSanPham}</p>
                      <p className="text-xs text-slate-500">{[item.MauSac, item.KichThuoc].filter(Boolean).join(' / ') || '—'} × {item.SoLuong}</p>
                    </div>
                    <p className="text-sm font-semibold text-red-400">{(item.GiaLucMua * item.SoLuong).toLocaleString()}đ</p>
                  </div>
                ))}

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06]">
                  <p className="text-lg font-bold text-white">Tổng: <span className="text-red-400">{(order.TienThanhToan || 0).toLocaleString()}đ</span></p>
                  <div className="flex gap-2">
                    {config.nextAction && (
                      <button onClick={() => handleStatus(order.MaDonHang, config.nextAction)}
                        className="btn-primary text-sm px-4 py-2 flex items-center gap-1">
                        {config.nextAction === 'DA_XAC_NHAN' && <FiCheck size={14} />}
                        {config.nextAction === 'DANG_GIAO' && <FiTruck size={14} />}
                        {config.nextAction === 'DA_GIAO' && <FiCheck size={14} />}
                        {config.nextLabel}
                      </button>
                    )}
                    {order.TrangThaiDonHang === 'CHO_XAC_NHAN' && (
                      <button onClick={() => handleStatus(order.MaDonHang, 'DA_HUY')}
                        className="btn-outline text-sm px-4 py-2 flex items-center gap-1 text-red-400">
                        <FiX size={14} /> Hủy
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
