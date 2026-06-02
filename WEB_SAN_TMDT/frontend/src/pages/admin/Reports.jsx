import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PageHeader from '../../components/admin/PageHeader';
import Badge from '../../components/admin/Badge';
import { getReports, resolveReport } from '../../services/adminApi';

const TYPES = {
  SAN_PHAM_KHONG_HOP_LE: 'Sản phẩm không hợp lệ',
  HANH_VI_KHONG_HOP_LE: 'Hành vi không hợp lệ',
  GIAN_LAN: 'Gian lận',
  KHAC: 'Khác',
};

const TABS = [
  { value: 'CHO_XU_LY', label: 'Chờ xử lý' },
  { value: 'DANG_XU_LY', label: 'Đang xử lý' },
  { value: 'DA_GIAI_QUYET', label: 'Đã giải quyết' },
  { value: '', label: 'Tất cả' },
];

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('CHO_XU_LY');
  const [modal, setModal] = useState(null);
  const [note, setNote] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    getReports({ status: tab })
      .then((r) => setReports(r.data.data || []))
      .catch(() => toast.error('Không thể tải báo cáo'))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const handleResolve = async (decision) => {
    if (!modal) return;
    try {
      await resolveReport(modal.MaBaoCao, { decision, ghiChu: note });
      toast.success(decision === 'APPROVED' ? 'Đã xử lý và gỡ nội dung vi phạm' : 'Đã từ chối báo cáo');
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
        title="Báo cáo vi phạm"
        subtitle="Xem và xử lý các báo cáo từ người dùng"
        action={
          <button
            onClick={load}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <FiRefreshCw size={14} /> Làm mới
          </button>
        }
      />

      <div className="flex gap-2 mb-5">
        {TABS.map((t) => (
          <button
            key={t.value || 'all'}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.value
                ? 'bg-red-600 text-white'
                : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Đang tải...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16">
          <FiAlertTriangle size={40} className="mx-auto text-gray-700 mb-3" />
          <p className="text-gray-500">Không có báo cáo nào</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {reports.map((r) => (
            <motion.div
              key={r.MaBaoCao}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-orange-600/20 text-orange-400 px-2 py-0.5 rounded-full">
                      {TYPES[r.LoaiBaoCao] || r.LoaiBaoCao}
                    </span>
                    <Badge status={r.TrangThai} />
                    <span className="text-xs text-gray-600">#{r.MaBaoCao}</span>
                  </div>

                  <p className="text-sm text-gray-300 mb-1 line-clamp-2">{r.MoTaChiTiet}</p>
                  {r.GhiChuAdmin && <p className="text-xs text-gray-500 italic">Ghi chú: {r.GhiChuAdmin}</p>}

                  <p className="text-xs text-gray-600 mt-1">
                    {r.NgayTao ? new Date(r.NgayTao).toLocaleString('vi-VN') : ''}
                    {r.LoaiMaThamChieu ? ` · ${r.LoaiMaThamChieu} #${r.MaThamChieu}` : ''}
                  </p>
                </div>

                {r.TrangThai === 'CHO_XU_LY' && (
                  <button
                    onClick={() => setModal(r)}
                    className="shrink-0 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs rounded-lg transition-colors"
                  >
                    Xử lý
                  </button>
                )}
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
            className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg"
          >
            <h3 className="text-white font-semibold mb-1">Xử lý báo cáo #{modal.MaBaoCao}</h3>
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
                onClick={() => handleResolve('REJECTED')}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <FiX size={13} /> Từ chối
              </button>

              <button
                onClick={() => handleResolve('APPROVED')}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <FiCheck size={13} /> Gỡ vi phạm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

