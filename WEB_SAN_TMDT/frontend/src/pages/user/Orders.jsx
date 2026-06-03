import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiPackage, FiTruck, FiCheck, FiX, FiClock, FiShoppingBag, FiChevronDown, FiChevronUp, FiRefreshCw, FiStar, FiMapPin, FiCreditCard, FiHome, FiPhone, FiMessageSquare
} from 'react-icons/fi';
import { FaStar, FaTimes, FaStore, FaShoppingCart, FaUndo, FaImage } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const STATUS_MAP = {
  CHO_XAC_NHAN: { label: 'Chờ xác nhận', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30', icon: FiClock },
  DA_XAC_NHAN:  { label: 'Đã xác nhận',  color: 'text-blue-400 bg-blue-400/10 border-blue-400/30',    icon: FiCheck },
  DANG_GIAO:    { label: 'Đang giao',     color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30', icon: FiTruck },
  DA_GIAO:      { label: 'Đã giao',       color: 'text-green-400 bg-green-400/10 border-green-400/30',  icon: FiCheck },
  DA_HUY:       { label: 'Đã hủy',        color: 'text-red-400 bg-red-400/10 border-red-400/30',         icon: FiX },
};

const TABS = [
  { key: 'all',          label: 'Tất cả' },
  { key: 'CHO_XAC_NHAN', label: 'Chờ xác nhận' },
  { key: 'DANG_GIAO',    label: 'Đang giao' },
  { key: 'DA_GIAO',      label: 'Đã giao' },
  { key: 'DA_HUY',       label: 'Đã hủy' },
];

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
};

const mockOrders = Array.from({ length: 5 }, (_, i) => ({
  MaDonHang: 1000 + i,
  TenCuaHang: ['Tech Store', 'Fashion Hub', 'Home Mart', 'Beauty Shop', 'Food Market'][i],
  NgayTao: new Date(Date.now() - i * 86400000 * 2).toISOString(),
  NgayCapNhat: new Date(Date.now() - i * 86400000).toISOString(),
  TrangThaiDonHang: ['DA_GIAO', 'DA_GIAO', 'DANG_GIAO', 'CHO_XAC_NHAN', 'DA_HUY'][i],
  TongTien: [29990000, 450000, 2890000, 1250000, 350000][i],
  TienGiamGia: [500000, 0, 200000, 100000, 0][i],
  TienThanhToan: [29490000, 450000, 2690000, 1150000, 350000][i],
  phiVanChuyen: [30000, 0, 15000, 15000, 0][i],
  phuongThucThanhToan: ['Chuyển khoản ngân hàng', 'Tiền mặt (COD)', 'Ví điện tử MoMo', 'Tiền mặt (COD)', 'Tiền mặt (COD)'][i],
  diaChiGiaoHang: {
    hoTen: ['Nguyễn Hoàng Anh', 'Trần Minh Quân', 'Lê Thị Phương', 'Phạm Đức Trung', 'Hoàng Thị Lan'][i],
    soDienThoai: '0987 654 321',
    diaChi: ['123 Nguyễn Huệ, Q.1, TP.HCM', '456 Lê Lợi, Q.3, TP.HCM', '789 Trần Hưng Đạo, Q.5, TP.HCM', '321 Hai Bà Trưng, Q.3, TP.HCM', '654 Võ Văn Tần, Q.3, TP.HCM'][i],
  },
  items: [
    { MaSanPham: i * 3 + 1, TenSanPham: ['Samsung Galaxy S24 Ultra', 'Áo thun nam cổ tròn', 'Máy lọc không khí Xiaomi', 'Nước hoa Chanel No5', 'Hạt điều rang muối 500g'][i], SoLuong: 1, GiaLucMua: [29990000, 350000, 2890000, 1250000, 280000][i], MauSac: ['Titanium Black', 'Đen', 'Trắng', 'EDP 50ml', 'Rang muối'][i], KichThuoc: ['256GB', 'L', null, null, '500g'][i], AnhSanPham: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&q=80', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80', 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200&q=80', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&q=80', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=200&q=80'][i] },
    { MaSanPham: i * 3 + 2, TenSanPham: ['Tai nghe Sony WH-1000XM5', 'Giày thể thao Nike Air Max', 'Nồi chiên không dầu Philips', 'Kem dưỡng da L\'Oréal', 'Trà xanh matcha Nhật Bản'][i], SoLuong: 1, GiaLucMua: [5490000, 3200000, 1590000, 450000, 350000][i], MauSac: ['Đen', 'Trắng/Đỏ', null, null, null][i], KichThuoc: [null, '42', null, null, '200g'][i], AnhSanPham: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80', 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=200&q=80', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&q=80'][i] },
  ].filter(Boolean),
}));

function ReviewModal({ orderId, product, onClose, onSuccess }) {
  const { token } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleMediaSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setMediaFiles(prev => [...prev, ...files].slice(0, 5));
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) { toast.warning('Vui lòng chọn số sao'); return; }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('maSanPham', product.MaSanPham);
      formData.append('maDonHang', orderId);
      formData.append('diemDanhGia', rating);
      formData.append('binhLuan', comment);
      mediaFiles.forEach(f => formData.append('media', f));

      await axios.post(`${API_URL}/reviews`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Đánh giá thành công!');
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể gửi đánh giá';
      toast.error(msg);
    } finally { setSubmitting(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
        onClick={e => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white">Đánh giá sản phẩm</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><FaTimes /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-white font-semibold">{product.TenSanPham}</p>
          <div className="flex justify-center gap-2 py-4">
            {[1,2,3,4,5].map(star => (
              <button key={star} onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
                className="text-3xl transition-all hover:scale-110">
                <FaStar className={(hover || rating) >= star ? 'text-yellow-400' : 'text-slate-700'} />
              </button>
            ))}
          </div>
          <textarea value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm h-24 resize-none outline-none focus:border-red-500 transition" />

          {/* Media upload */}
          <div>
            <input type="file" accept="image/*,video/*" multiple onChange={handleMediaSelect} hidden id="review-media-input" />
            <label htmlFor="review-media-input" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white cursor-pointer transition">
              <FaImage size={14} /> Thêm ảnh/video (tối đa 5)
            </label>
            {mediaFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {mediaFiles.map((f, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700">
                    {f.type.startsWith('video/') ? (
                      <video src={URL.createObjectURL(f)} className="w-full h-full object-cover" />
                    ) : (
                      <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" />
                    )}
                    <button onClick={() => removeMedia(i)}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/70 rounded-full text-white flex items-center justify-center text-[10px]">
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleSubmit} disabled={submitting}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition disabled:opacity-50">
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function OrderCard({ order, onCancel, onReview }) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const { token } = useAuthStore();
  const navigate = useNavigate();

  const handleChatWithShop = async () => {
    const maCuaHang = order.MaCuaHang || detail?.MaCuaHang;
    if (!maCuaHang) { toast.error('Không tìm thấy cửa hàng'); return; }
    try {
      const res = await axios.post(`${API_URL}/chat/shop/start`, {
        maCuaHang,
        loiNhan: `Xin chào, tôi cần hỗ trợ về đơn hàng #${order.MaDonHang}`
      }, { headers: { Authorization: `Bearer ${token}` } });
      navigate(`/chat?room=${res.data.data.MaPhongChat}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể kết nối với cửa hàng');
    }
  };

  const status = STATUS_MAP[order.TrangThaiDonHang] || STATUS_MAP['CHO_XAC_NHAN'];
  const StatusIcon = status.icon;

  const fetchDetail = async () => {
    if (detail) {
      setExpanded(v => !v);
      return detail;
    }
    setLoadingDetail(true);
    setExpanded(true);
    try {
      const res = await axios.get(`${API_URL}/orders/${order.MaDonHang}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDetail(res.data.data);
      return res.data.data;
    } catch {
      setDetail(order);
      return order;
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-red-600/10 hover:border-slate-700 transition-all"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg">
            <FiShoppingBag className="text-red-400" size={16} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">🏪 {order.TenCuaHang}</p>
            <p className="text-white font-bold text-sm">Đơn #{order.MaDonHang}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
          <StatusIcon size={10} /> {status.label}
        </span>
      </div>

      {/* Summary */}
      <div className="px-5 py-3 flex items-center justify-between">
        <div className="text-sm text-slate-400 space-y-0.5">
          <p>Ngày đặt: <span className="text-white">{new Date(order.NgayTao).toLocaleDateString('vi-VN')}</span></p>
          {Number(order.TienGiamGia || 0) > 0 && (
            <p>Giảm: <span className="text-green-400 font-semibold">-₫{Number(order.TienGiamGia).toLocaleString('vi-VN')}</span></p>
          )}
          <p>Tổng: <span className="text-red-400 font-bold">₫{Number(order.TienThanhToan || order.TongTien || 0).toLocaleString('vi-VN')}</span></p>
        </div>
        <div className="flex items-center gap-2">
          {order.TrangThaiDonHang === 'CHO_XAC_NHAN' && (
            <button onClick={() => onCancel(order.MaDonHang)}
              className="px-3 py-1.5 text-xs font-bold text-red-400 hover:text-white bg-red-400/10 hover:bg-red-600 border border-red-400/30 hover:border-red-600 rounded-lg transition">
              Hủy đơn
            </button>
          )}
          {order.TrangThaiDonHang === 'DA_GIAO' && (
            <button onClick={async () => {
              const d = detail || await fetchDetail();
              const firstItem = d?.items?.[0] || null;
              if (firstItem) {
                if (firstItem.DaDanhGia) {
                  toast.info('Bạn đã đánh giá sản phẩm này rồi');
                  return;
                }
                onReview(order.MaDonHang, firstItem);
              }
              else toast.warning('Không tìm thấy sản phẩm để đánh giá');
            }}
              className="px-3 py-1.5 text-xs font-bold text-yellow-400 hover:text-white bg-yellow-400/10 hover:bg-yellow-600 border border-yellow-400/30 hover:border-yellow-600 rounded-lg transition flex items-center gap-1">
              <FiStar size={10} /> {detail?.items?.some(i => i.DaDanhGia) ? 'Đã đánh giá' : 'Đánh giá'}
            </button>
          )}
          <button
            onClick={fetchDetail}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            Chi tiết {expanded ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-800/60"
          >
            <div className="px-5 py-4 space-y-5">
              {/* Tracking Timeline */}
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FiClock className="text-red-400" size={12} /> Trạng thái đơn hàng
                </h4>
                <div className="relative">
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-700" />
                  <div className="space-y-4">
                    {(() => {
                      const stages = [];
                      const now = new Date();
                      stages.push({ label: 'Đặt hàng', time: order.NgayTao, done: true, icon: '🛒' });
                      if (order.TrangThaiDonHang === 'DA_HUY') {
                        stages.push({ label: 'Đã hủy', time: order.NgayCapNhat || order.NgayTao, done: true, icon: '❌' });
                      } else {
                        const statuses = ['DA_XAC_NHAN', 'DANG_GIAO', 'DA_GIAO'];
                        const labels = ['Đã xác nhận', 'Đang giao', 'Đã giao'];
                        const icons = ['✅', '🚚', '📦'];
                        statuses.forEach((s, i) => {
                          const done = ['DA_XAC_NHAN', 'DANG_GIAO', 'DA_GIAO'].indexOf(order.TrangThaiDonHang) >= i;
                          stages.push({
                            label: labels[i],
                            time: done ? (order.NgayCapNhat || now.toISOString()) : null,
                            done,
                            icon: icons[i]
                          });
                        });
                      }
                      return stages.map((stage, i) => (
                        <div key={i} className="flex items-start gap-3 relative">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 z-10 ${
                            stage.done ? 'bg-green-500/20 border border-green-500/50' : 'bg-slate-800 border border-slate-700'
                          }`}>
                            <span>{stage.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className={`text-sm font-semibold ${stage.done ? 'text-green-400' : 'text-slate-500'}`}>
                              {stage.label}
                            </p>
                            {stage.time && (
                              <p className="text-xs text-slate-500 mt-0.5">
                                {new Date(stage.time).toLocaleString('vi-VN')}
                              </p>
                            )}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {detail?.diaChiGiaoHang && (
                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                  <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FiMapPin className="text-red-400" size={12} /> Địa chỉ nhận hàng
                  </h4>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FiHome className="text-red-400" size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{detail.diaChiGiaoHang.hoTen}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <FiPhone size={10} /> {detail.diaChiGiaoHang.soDienThoai}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{detail.diaChiGiaoHang.diaChi}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method + Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {detail?.phuongThucThanhToan && (
                  <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                    <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FiCreditCard className="text-red-400" size={12} /> Thanh toán
                    </h4>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <FiCreditCard className="text-emerald-400" size={14} />
                      </div>
                      <span className="text-sm text-white font-medium">{detail.phuongThucThanhToan}</span>
                    </div>
                  </div>
                )}

                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                  <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FiShoppingBag className="text-red-400" size={12} /> Chi tiết thanh toán
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Tạm tính</span>
                      <span>₫{Number(detail?.TongTien || 0).toLocaleString('vi-VN')}</span>
                    </div>
                    {Number(detail?.phiVanChuyen || 0) > 0 && (
                      <div className="flex justify-between text-sm text-slate-400">
                        <span>Phí vận chuyển</span>
                        <span>₫{Number(detail.phiVanChuyen).toLocaleString('vi-VN')}</span>
                      </div>
                    )}
                    {Number(detail?.TienGiamGia || 0) > 0 && (
                      <div className="flex justify-between text-sm text-green-400">
                        <span>Giảm giá</span>
                        <span>-₫{Number(detail.TienGiamGia).toLocaleString('vi-VN')}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-700/50 pt-1.5 mt-1.5 flex justify-between text-base font-bold text-white">
                      <span>Tổng cộng</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                        ₫{Number(detail?.TienThanhToan || detail?.TongTien || 0).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {loadingDetail ? (
                <div className="space-y-2">
                  {[1,2].map(i => <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-pulse" />)}
                </div>
              ) : detail?.items?.length > 0 ? (
                <div>
                  <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FiShoppingBag className="text-red-400" size={12} /> Sản phẩm đã mua ({detail.items.length})
                  </h4>
                  <div className="space-y-2">
                    {detail.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-all group">
                        <div className="w-12 h-12 rounded-lg bg-slate-700/50 flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                          {item.AnhSanPham ? (
                            <img src={getImageUrl(item.AnhSanPham)} alt={item.TenSanPham}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '📦'; }}
                            />
                          ) : <span>📦</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white truncate group-hover:text-red-300 transition-colors">{item.TenSanPham}</p>
                            <span className="text-[10px] text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">×{item.SoLuong}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {[item.MauSac, item.KichThuoc].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-red-400 flex-shrink-0">
                          ₫{Number(item.GiaLucMua * item.SoLuong).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-4">Không có dữ liệu chi tiết</p>
              )}

              {/* Action buttons */}
              {detail?.items?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <Link to="/products">
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-red-600/20 transition-all">
                      <FaShoppingCart size={11} /> Mua lại
                    </button>
                  </Link>
                  {detail.TenCuaHang && (
                    <Link to={`/shop/${detail.MaCuaHang || order.MaCuaHang}`}>
                      <button className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all">
                        <FaStore size={11} /> Xem shop
                      </button>
                    </Link>
                  )}
                  <button onClick={handleChatWithShop} className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all">
                    <FiMessageSquare size={11} /> Liên hệ
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Orders() {
  const { token } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [reviewData, setReviewData] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.data || []);
    } catch {
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancel = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    try {
      await axios.put(`${API_URL}/orders/${orderId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Đã hủy đơn hàng thành công!');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể hủy đơn hàng');
    }
  };

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(o => o.TrangThaiDonHang === activeTab);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="h-28 bg-slate-900/60 rounded-2xl animate-pulse border border-slate-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <FiPackage className="text-red-500" /> Đơn hàng của tôi
        </h1>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
        >
          <FiRefreshCw size={12} /> Làm mới
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                : 'text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800'
            }`}
          >
            {tab.label}
            {tab.key !== 'all' && (
              <span className="ml-1.5 text-[10px] opacity-70">
                ({orders.filter(o => o.TrangThaiDonHang === tab.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Order List */}
      {filteredOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-700">
            <FiPackage className="text-slate-600" size={40} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Chưa có đơn hàng nào</h2>
          <p className="text-slate-400 mb-6 text-sm">
            {activeTab === 'all' ? 'Hãy mua sắm và đơn hàng của bạn sẽ xuất hiện ở đây.' : 'Không có đơn hàng nào trong trạng thái này.'}
          </p>
          <Link to="/products">
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl transition shadow-lg shadow-red-600/20">
              Khám phá sản phẩm
            </button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <OrderCard key={order.MaDonHang} order={order} onCancel={handleCancel} onReview={(orderId, product) => setReviewData({ orderId, product })} />
          ))}
        </div>
      )}
      {reviewData && (
        <AnimatePresence>
          <ReviewModal
            orderId={reviewData.orderId}
            product={reviewData.product}
            onClose={() => setReviewData(null)}
            onSuccess={() => { setReviewData(null); fetchOrders(); }}
          />
        </AnimatePresence>
      )}
    </div>
  );
}
