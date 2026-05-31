import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiLock, FiUnlock, FiUser, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PageHeader from '../../components/admin/PageHeader';
import Badge from '../../components/admin/Badge';
import { getUsers, lockUser, unlockUser } from '../../services/adminApi';

const STATUSES = [
  { value: '', label: 'Tất cả' },
  { value: 'HOAT_DONG', label: 'Hoạt động' },
  { value: 'BI_KHOA', label: 'Bị khóa' },
  { value: 'CHUA_KICH_HOAT', label: 'Chưa kích hoạt' },
];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [lockModal, setLockModal] = useState(null); // { userId, hoTen }
  const [lockReason, setLockReason] = useState('');
  const LIMIT = 20;

  const load = useCallback(() => {
    setLoading(true);
    getUsers({ page, limit: LIMIT, search, status })
      .then(r => { setUsers(r.data.data); setTotal(r.data.pagination.total); })
      .catch(() => toast.error('Không thể tải danh sách người dùng'))
      .finally(() => setLoading(false));
  }, [page, search, status]);

  useEffect(() => { load(); }, [load]);

  const handleLock = async () => {
    try {
      await lockUser(lockModal.userId, lockReason);
      toast.success(`Đã khóa tài khoản ${lockModal.hoTen}`);
      setLockModal(null); setLockReason(''); load();
    } catch { toast.error('Thao tác thất bại'); }
  };

  const handleUnlock = async (userId, hoTen) => {
    try {
      await unlockUser(userId);
      toast.success(`Đã mở khóa tài khoản ${hoTen}`);
      load();
    } catch { toast.error('Thao tác thất bại'); }
  };

  return (
    <div>
      <PageHeader
        title="Quản lý người dùng"
        subtitle={`${total} tài khoản`}
        action={
          <button onClick={load} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <FiRefreshCw size={14} /> Làm mới
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm tên, email, SĐT..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
          />
        </div>
        <div className="flex gap-2">
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => { setStatus(s.value); setPage(1); }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                status === s.value ? 'bg-red-600 text-white' : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Người dùng</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Liên hệ</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Vai trò</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Trạng thái</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Ngày tạo</th>
              <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-500">Đang tải...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-500">Không có dữ liệu</td></tr>
            ) : users.map(u => (
              <tr key={u.MaNguoiDung} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center text-xs">
                      {u.HoTen?.[0] || <FiUser size={12} />}
                    </div>
                    <div>
                      <p className="text-white font-medium">{u.HoTen}</p>
                      <p className="text-xs text-gray-500">#{u.MaNguoiDung}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-gray-300">{u.Email}</p>
                  <p className="text-xs text-gray-500">{u.SoDienThoai}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    u.VaiTro === 'QUAN_TRI_VIEN' ? 'bg-purple-600/20 text-purple-400' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {u.VaiTro === 'QUAN_TRI_VIEN' ? 'Admin' : 'Người dùng'}
                  </span>
                </td>
                <td className="px-4 py-3"><Badge status={u.TrangThai} /></td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(u.NgayTao).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-4 py-3 text-right">
                  {u.VaiTro !== 'QUAN_TRI_VIEN' && (
                    u.TrangThai === 'BI_KHOA' ? (
                      <button
                        onClick={() => handleUnlock(u.MaNguoiDung, u.HoTen)}
                        className="flex items-center gap-1 ml-auto text-xs text-green-400 hover:text-green-300 bg-green-600/10 hover:bg-green-600/20 px-2 py-1 rounded-lg transition-all"
                      >
                        <FiUnlock size={12} /> Mở khóa
                      </button>
                    ) : (
                      <button
                        onClick={() => setLockModal({ userId: u.MaNguoiDung, hoTen: u.HoTen })}
                        className="flex items-center gap-1 ml-auto text-xs text-red-400 hover:text-red-300 bg-red-600/10 hover:bg-red-600/20 px-2 py-1 rounded-lg transition-all"
                      >
                        <FiLock size={12} /> Khóa
                      </button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {total > LIMIT && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <span className="text-xs text-gray-500">Trang {page} / {Math.ceil(total / LIMIT)}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 text-xs bg-gray-800 rounded-lg disabled:opacity-40 hover:bg-gray-700 transition-colors">
                Trước
              </button>
              <button disabled={page * LIMIT >= total} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 text-xs bg-gray-800 rounded-lg disabled:opacity-40 hover:bg-gray-700 transition-colors">
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lock Modal */}
      {lockModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-white font-semibold mb-1">Khóa tài khoản</h3>
            <p className="text-sm text-gray-400 mb-4">Khóa tài khoản <strong className="text-white">{lockModal.hoTen}</strong>?</p>
            <textarea
              value={lockReason}
              onChange={e => setLockReason(e.target.value)}
              placeholder="Lý do khóa tài khoản..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 mb-4 resize-none"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setLockModal(null); setLockReason(''); }}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                Hủy
              </button>
              <button onClick={handleLock}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                Xác nhận khóa
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
