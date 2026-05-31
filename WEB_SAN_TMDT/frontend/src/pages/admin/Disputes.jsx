import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiEye, FiRefreshCw, FiVideo } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PageHeader from '../../components/admin/PageHeader';
import Badge from '../../components/admin/Badge';
import { getDisputes, getDisputeDetail, resolveDispute } from '../../services/adminApi';

const fmtMoney = n => Number(n).toLocaleString('vi-VN') + '₫';

const TABS = [
  { value: 'KHIEU_NAI_ADMIN', label: 'Chờ phán quyết' },
  { value: 'SHOP_TU_CHOI',    label: 'Shop từ chối' },
  { value: 'DA_GIAI_QUYET',   label: 'Đã giải quyết' },
  { value: '',                 label: 'Tất cả' },
];

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('KHIEU_NAI_ADMIN');
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getDisputes({ trangThai: tab })
      .then(r => setDisputes(r.data.data || []))
      .catch(() => toast.error('Không thể tải tranh chấp'))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const r = await getDisputeDetail(id);
      setDetail(r.data.data);
    } catch { toast.error('Không thể tải chi tiết'); }
    finally { setLoadingDetail(false); }
  };

  const handleResolve = async (quyetDinh) => {
    if (!reason.trim()) { toast.warning('Vui lòng nhập lý do quyết định'); return; }
    setSubmitting(true);
    try {
      await resolveDispute(detail.dispute.MaDoiTra, { quyetDinh, lyDo: reason });
      toast.success(quyetDinh === 'DONG_Y_HOAN_TIEN' ? 'Đã đồng ý hoàn tiền cho người mua' : 'Đã từ chối hoàn tiền');
      setDetail(null); setReason(''); load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Thao tác thất bại');
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <PageHeader
        title="Giải quyết tranh chấp đổi trả"
        subtitle="Admin làm trung gian phân xử khi hai bên không thỏa thuận được"
        action={
          <button onClick={load} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <FiRefreshCw size={14} /> Làm mới
          </button>
        }
      />

      <div className="flex gap-2 mb-5">
        {TABS.map(t => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.value ? 'bg-red-600 text-white' : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Đang tải...</div>
      ) : disputes.length === 0 ? (
        <div className="text-center py-16">
          <FiMessageSquare size={40} className="mx-auto text-gray-700 mb-3" />
          <p className="text-gray-500">Không có tranh chấp nào</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {disputes.map(d => (
            <motion.div key={d.MaDoiTra} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-400 font-medium">Đơn #{d.MaDonHang}</span>
                    <Badge status={d.TrangThai} />
                    <span className="text-sm font-bold text-white">{fmtMoney(d.TienThanhToan)}</span>
                  </div>
                  <p className="text-base text-gray-100 mb-2 line-clamp-2 leading-relaxed">{d.LyDo}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span>Người mua: <span className="text-gray-200 font-medium">{d.TenNguoiMua}</span></span>
                    <span>·</span>
                    <span>Shop: <span className="text-gray-200 font-medium">{d.TenCuaHang}</span></span>
                    <span>·</span>
                    <span className="text-gray-400">{new Date(d.NgayTao).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                <button
                  onClick={() => openDetail(d.MaDoiTra)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs rounded-lg transition-colors"
                >
                  <FiEye size={13} /> Xem & Xử lý
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {(detail || loadingDetail) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl my-4">
            {loadingDetail ? (
              <div className="p-12 text-center text-gray-500">Đang tải...</div>
            ) : detail && (
              <>
                <div className="flex items-center justify-between p-5 border-b border-gray-800">
                  <h3 className="text-white font-semibold">
                    Tranh chấp đơn #{detail.dispute.MaDonHang}
                  </h3>
                  <Badge status={detail.dispute.TrangThai} />
                </div>

                <div className="p-5 space-y-4">
                  {/* Parties */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-2 font-medium">Người mua</p>
                      <p className="text-base text-white font-semibold mb-1.5">{detail.dispute.TenNguoiMua}</p>
                      <p className="text-sm text-gray-300 mb-0.5">{detail.dispute.EmailNguoiMua}</p>
                      <p className="text-sm text-gray-300">{detail.dispute.SDTNguoiMua}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-2 font-medium">Người bán</p>
                      <p className="text-base text-white font-semibold mb-1.5">{detail.dispute.TenCuaHang}</p>
                      <p className="text-sm text-gray-300 mb-0.5">{detail.dispute.EmailNguoiBan}</p>
                      <p className="text-sm text-gray-300">{detail.dispute.SDTNguoiBan}</p>
                    </div>
                  </div>

                  {/* Dispute info */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2 font-medium">Lý do tranh chấp</p>
                    <p className="text-base text-gray-100 leading-relaxed mb-3">{detail.dispute.LyDo}</p>
                    <p className="text-sm text-gray-400">
                      Giá trị đơn hàng: <span className="text-white font-bold text-base">{fmtMoney(detail.dispute.TienThanhToan)}</span>
                    </p>
                  </div>

                  {/* Videos */}
                  {detail.videos?.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-400 mb-3 font-medium">Bằng chứng video</p>
                      <div className="grid grid-cols-2 gap-3">
                        {detail.videos.map(v => (
                          <a key={v.MaBangChung} href={v.DuongDanVideo} target="_blank" rel="noreferrer"
                            className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-colors">
                            <FiVideo size={20} className="text-blue-400 shrink-0" />
                            <div>
                              <p className="text-sm text-white font-medium">{v.LoaiVideo === 'DONG_HANG' ? 'Video đóng hàng' : 'Video mở hàng'}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{new Date(v.NgayTai).toLocaleDateString('vi-VN')}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* History */}
                  {detail.history?.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-400 mb-3 font-medium">Lịch sử xử lý</p>
                      <div className="space-y-2">
                        {detail.history.map(h => (
                          <div key={h.MaLichSu} className="flex gap-3 text-sm">
                            <span className="text-gray-500 shrink-0 font-medium">{new Date(h.NgayThucHien).toLocaleDateString('vi-VN')}</span>
                            <div>
                              <span className="text-gray-200">{h.HanhDong}</span>
                              {h.GhiChu && <p className="text-gray-400 mt-1">{h.GhiChu}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Verdict */}
                  {detail.dispute.TrangThai !== 'DA_GIAI_QUYET' && (
                    <div className="border-t border-gray-800 pt-5">
                      <p className="text-base text-white font-semibold mb-3">Phán quyết của Admin</p>
                      <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="Nhập lý do quyết định..."
                        rows={3}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 mb-4 resize-none leading-relaxed"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleResolve('TU_CHOI_HOAN_TIEN')}
                          disabled={submitting}
                          className="flex-1 py-3 text-sm font-medium bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          Từ chối hoàn tiền (tiền về shop)
                        </button>
                        <button
                          onClick={() => handleResolve('DONG_Y_HOAN_TIEN')}
                          disabled={submitting}
                          className="flex-1 py-3 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          Đồng ý hoàn tiền (tiền về người mua)
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-gray-800 flex justify-end">
                  <button onClick={() => { setDetail(null); setReason(''); }}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                    Đóng
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
