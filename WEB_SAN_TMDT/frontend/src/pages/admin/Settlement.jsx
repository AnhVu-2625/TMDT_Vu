import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiRefreshCw, FiPlay, FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PageHeader from '../../components/admin/PageHeader';
import Badge from '../../components/admin/Badge';
import {
  getEligibleOrders, getSettlements, getSettlementDetail,
  createSettlement, executeSettlement, getSystemConfig, updateSystemConfig
} from '../../services/adminApi';

const fmtMoney = n => Number(n || 0).toLocaleString('vi-VN') + '₫';

export default function AdminSettlement() {
  const [tab, setTab] = useState('eligible');
  const [eligible, setEligible] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [detail, setDetail] = useState(null);
  const [config, setConfig] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ tenPhien: '', tuNgay: '', denNgay: '', ghiChu: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadEligible = () => {
    setLoading(true);
    getEligibleOrders()
      .then(r => setEligible(r.data.data))
      .catch(() => toast.error('Không thể tải dữ liệu'))
      .finally(() => setLoading(false));
  };

  const loadSessions = () => {
    setLoading(true);
    getSettlements()
      .then(r => setSessions(r.data.data || []))
      .catch(() => toast.error('Không thể tải phiên đối soát'))
      .finally(() => setLoading(false));
  };

  const loadConfig = () => {
    getSystemConfig().then(r => setConfig(r.data.data || [])).catch(console.error);
  };

  useEffect(() => {
    if (tab === 'eligible') loadEligible();
    else if (tab === 'sessions') loadSessions();
    else if (tab === 'config') loadConfig();
  }, [tab]);

  const handleCreate = async () => {
    if (!form.tenPhien || !form.tuNgay || !form.denNgay) {
      toast.warning('Vui lòng điền đầy đủ thông tin'); return;
    }
    setSubmitting(true);
    try {
      const r = await createSettlement(form);
      toast.success('Tạo phiên đối soát thành công');
      setCreateModal(false);
      setForm({ tenPhien: '', tuNgay: '', denNgay: '', ghiChu: '' });
      setTab('sessions'); loadSessions();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Thao tác thất bại');
    } finally { setSubmitting(false); }
  };

  const handleExecute = async (id) => {
    if (!window.confirm('Xác nhận thực hiện chi trả tiền cho người bán?')) return;
    try {
      const r = await executeSettlement(id);
      toast.success(r.data.message);
      loadSessions();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleUpdateConfig = async (tenCauHinh, giaTri) => {
    try {
      await updateSystemConfig({ tenCauHinh, giaTri });
      toast.success('Đã cập nhật cấu hình');
      loadConfig();
    } catch { toast.error('Cập nhật thất bại'); }
  };

  return (
    <div>
      <PageHeader
        title="Đối soát & Chia tiền"
        subtitle="Tính toán và chi trả tiền cho người bán sau khi trừ phí sàn"
        action={
          tab === 'eligible' && (
            <button
              onClick={() => setCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
            >
              <FiPlay size={14} /> Tạo phiên đối soát
            </button>
          )
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { value: 'eligible', label: 'Đơn đủ điều kiện' },
          { value: 'sessions', label: 'Phiên đối soát' },
          { value: 'config',   label: 'Cấu hình' },
        ].map(t => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.value ? 'bg-red-600 text-white' : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Eligible Orders */}
      {tab === 'eligible' && (
        <div>
          {loading ? <div className="text-center py-16 text-gray-500">Đang tải...</div> : eligible && (
            <>
              {/* Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                {[
                  { label: 'Số đơn hàng', value: eligible.summary?.tongDonHang },
                  { label: 'Tổng doanh thu', value: fmtMoney(eligible.summary?.tongDoanhThu) },
                  { label: `Phí sàn (${eligible.summary?.phanTramPhiSan}%)`, value: fmtMoney(eligible.summary?.tongPhiSan) },
                  { label: 'Tiền trả shop', value: fmtMoney(eligible.summary?.tongChiTra) },
                ].map(s => (
                  <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                    <p className="text-lg font-bold text-white">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Orders table */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-4 py-3 text-xs text-gray-500">Đơn hàng</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-500">Cửa hàng</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-500">Doanh thu</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-500">Ngày giao</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-500">Hết hạn đổi trả</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eligible.orders?.map(o => (
                      <tr key={o.MaDonHang} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-3 text-gray-300">#{o.MaDonHang}</td>
                        <td className="px-4 py-3 text-gray-300">{o.TenCuaHang}</td>
                        <td className="px-4 py-3 text-right text-white font-medium">{fmtMoney(o.TienThanhToan)}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{new Date(o.NgayGiaoHang).toLocaleDateString('vi-VN')}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{new Date(o.NgayHetHanDoiTra).toLocaleDateString('vi-VN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Sessions */}
      {tab === 'sessions' && (
        <div>
          {loading ? <div className="text-center py-16 text-gray-500">Đang tải...</div>
          : sessions.length === 0 ? (
            <div className="text-center py-16">
              <FiDollarSign size={40} className="mx-auto text-gray-700 mb-3" />
              <p className="text-gray-500">Chưa có phiên đối soát nào</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {sessions.map(s => (
                <motion.div key={s.MaPhienDoiSoat} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium">{s.TenPhien}</h3>
                        <Badge status={s.TrangThai} />
                      </div>
                      <div className="grid grid-cols-4 gap-3 mt-2">
                        {[
                          { label: 'Đơn hàng', value: s.TongDonHang },
                          { label: 'Doanh thu', value: fmtMoney(s.TongDoanhThu) },
                          { label: 'Phí sàn', value: fmtMoney(s.TongPhiSan) },
                          { label: 'Chi trả shop', value: fmtMoney(s.TongChiTraNguoiBan) },
                        ].map(item => (
                          <div key={item.label}>
                            <p className="text-xs text-gray-500">{item.label}</p>
                            <p className="text-sm text-white font-medium">{item.value}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        {new Date(s.TuNgay).toLocaleDateString('vi-VN')} → {new Date(s.DenNgay).toLocaleDateString('vi-VN')}
                        {s.TenNguoiThucHien && ` · Bởi ${s.TenNguoiThucHien}`}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={async () => {
                        const r = await getSettlementDetail(s.MaPhienDoiSoat);
                        setDetail(r.data.data);
                      }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-colors">
                        <FiEye size={13} /> Chi tiết
                      </button>
                      {s.TrangThai === 'DANG_XU_LY' && (
                        <button onClick={() => handleExecute(s.MaPhienDoiSoat)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors">
                          <FiPlay size={13} /> Chi trả
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Config */}
      {tab === 'config' && (
        <div className="grid gap-3 max-w-lg">
          {config.map(c => (
            <div key={c.MaCauHinh} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-sm text-white font-medium mb-0.5">{c.TenCauHinh}</p>
              <p className="text-xs text-gray-500 mb-3">{c.MoTa}</p>
              <div className="flex gap-2">
                <input
                  defaultValue={c.GiaTri}
                  id={`cfg-${c.MaCauHinh}`}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                />
                <button
                  onClick={() => {
                    const val = document.getElementById(`cfg-${c.MaCauHinh}`).value;
                    handleUpdateConfig(c.TenCauHinh, val);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                >
                  Lưu
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {createModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-white font-semibold mb-4">Tạo phiên đối soát</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Tên phiên</label>
                <input value={form.tenPhien} onChange={e => setForm(f => ({ ...f, tenPhien: e.target.value }))}
                  placeholder="VD: Đối soát tháng 5/2026"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Từ ngày</label>
                  <input type="datetime-local" value={form.tuNgay} onChange={e => setForm(f => ({ ...f, tuNgay: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Đến ngày</label>
                  <input type="datetime-local" value={form.denNgay} onChange={e => setForm(f => ({ ...f, denNgay: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Ghi chú</label>
                <input value={form.ghiChu} onChange={e => setForm(f => ({ ...f, ghiChu: e.target.value }))}
                  placeholder="Tùy chọn..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500" />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-5">
              <button onClick={() => setCreateModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Hủy</button>
              <button onClick={handleCreate} disabled={submitting}
                className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50">
                {submitting ? 'Đang tạo...' : 'Tạo phiên'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-white font-semibold mb-4">{detail.phien?.TenPhien}</h3>
            <div className="space-y-2">
              {detail.chiTiet?.map(c => (
                <div key={c.MaCuaHang} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm text-white">{c.TenCuaHang}</p>
                    <p className="text-xs text-gray-500">{c.SoDonHang} đơn hàng</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white font-medium">{fmtMoney(c.TongTienThucNhan)}</p>
                    <p className="text-xs text-gray-500">Phí: {fmtMoney(c.TongPhiSan)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setDetail(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Đóng</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
