import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiSearch, FiLock, FiUnlock, FiMail } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getToken = () => JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleLock = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'BI_KHOA' ? 'HOAT_DONG' : 'BI_KHOA';
    try {
      await axios.put(`${API_URL}/admin/users/${userId}/status`, { trangThai: newStatus }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      toast.success(newStatus === 'BI_KHOA' ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
      fetchUsers();
    } catch (err) {
      toast.error('Lỗi cập nhật trạng thái');
    }
  };

  const filtered = users.filter(u =>
    (u.HoTen || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.Email || '').toLowerCase().includes(search.toLowerCase())
  );

  const roleLabel = (role) => {
    const map = { QUAN_TRI_VIEN: 'Admin', QuanTriVien: 'Admin', Admin: 'Admin', NGUOI_DUNG: 'Người dùng', NguoiDung: 'Người dùng' };
    return map[role] || role;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3"><FiUsers className="text-blue-400" /> Quản lý tài khoản</h1>
          <p className="text-slate-400 text-sm mt-1">{users.length} tài khoản</p>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email..." className="input-field pl-10 w-64" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 shimmer" />)}</div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-xs text-slate-400 uppercase">
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">SĐT</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Điểm</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <motion.tr key={u.MaNguoiDung} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs font-bold">
                        {u.HoTen?.[0] || '?'}
                      </div>
                      <span className="text-sm text-white font-medium">{u.HoTen}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{u.Email}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{u.SoDienThoai || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${roleLabel(u.VaiTro) === 'Admin' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {roleLabel(u.VaiTro)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={u.TrangThai === 'BI_KHOA' ? 'badge-red' : 'badge-green'}>
                      {u.TrangThai === 'BI_KHOA' ? 'Bị khóa' : 'Hoạt động'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-yellow-400">{u.DiemTichLuy || 0}</td>
                  <td className="px-4 py-3 text-right">
                    {roleLabel(u.VaiTro) !== 'Admin' && (
                      <button onClick={() => toggleLock(u.MaNguoiDung, u.TrangThai)}
                        className={`p-2 rounded-lg transition ${u.TrangThai === 'BI_KHOA' ? 'hover:bg-emerald-500/20 text-emerald-400' : 'hover:bg-red-500/20 text-red-400'}`}
                        title={u.TrangThai === 'BI_KHOA' ? 'Mở khóa' : 'Khóa tài khoản'}>
                        {u.TrangThai === 'BI_KHOA' ? <FiUnlock size={16} /> : <FiLock size={16} />}
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
