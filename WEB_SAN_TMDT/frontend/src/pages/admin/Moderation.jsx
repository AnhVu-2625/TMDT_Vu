import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiEyeOff, FiCheck, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PageHeader from '../../components/admin/PageHeader';
import Badge from '../../components/admin/Badge';
import { getReports, resolveReport } from '../../services/adminApi';

export default function AdminModeration() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [note, setNote] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    // Lấy các report đang chờ xử lý (dùng chung API reports)
    getReports({ status: 'CHO_XU_LY' })
      .then((r) => {
        const data = r.data.data || [];
        // Lọc những report có tham chiếu tới SAN_PHAM (tương thích phần UI)
        setItems(
          data.filter(
            (i) => i.LoaiMaThamChieu === 'SAN_PHAM' || i.LoaiBaoCao === 'SAN_PHAM_KHONG_HOP_LE',
          ),
        );
      })
      .catch(() => toast.error('Không thể tải dữ liệu'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAction = async (decision) => {
    if (!modal) return;
    try {
      await resolveReport(modal.MaBaoCao, { decision, ghiChu: note });
      toast.success(decision === 'APPROVED' ? 'Đã gỡ nội dung vi phạm' : 'Đã bỏ qua báo cáo');
      setModal(null);
      setNote('');
      load();
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  return (
    <div>
      <PageHeader
        title="Kiểm duyệt hệ thống"
        subtitle="Xem xét và gỡ bỏ nội dung vi phạm"
        action={
          <button
            onClick={load}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <FiRefreshCw size={14} /> Làm mới
          </button>
        }
      />

      {loading ? (
        <div className="text-center py-16 text-gray-500">Đang tải...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <FiShield size={40} className="mx-auto text-gray-700 mb-3" />
          <p className="text-gray-500">Không có nội dung nào cần kiểm duyệt</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <motion.div
              key={item.MaBaoCao}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-red-600/20 text-red-400 px-2 py-0.5 rounded-full">
                      Sản phẩm #{item.MaThamChieu}
                    </span>
                    <Badge status={item.TrangThai} />
                  </div>
                  <p className="text-sm text-gray-300 mb-1 line-clamp-2">{item.MoTaChiTiet}</p>
                  <p className="text-xs text-gray-600">
                    {item.NgayTao ? new Date(item.NgayTao).toLocaleString('vi-VN') : ''}
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  {item.MaThamChieu && (
                    <a
                      href={`/products/${item.MaThamChieu}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-colors"
                    >
                      <FiExternalLink size={12} /> Xem
                    </a>
                  )}

                  <button
                    onClick={() => setModal(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs rounded-lg transition-colors"
                  >
                    <FiEyeOff size={12} /> Gỡ vi phạm
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-white font-semibold mb-1">Xử lý nội dung vi phạm</h3>
            <p className="text-sm text-gray-400 mb-3">{modal.MoTaChiTiet}</p>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú xử lý..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 mb-4 resize-none"
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setModal(null);
                  setNote('');
                }}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Hủy
              </button>

              <button
                onClick={() => handleAction('REJECTED')}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <FiEyeOff size={13} /> Bỏ qua
              </button>

              <button
                onClick={() => handleAction('APPROVED')}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <FiCheck size={13} /> Gỡ bài
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

