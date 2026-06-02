import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiMail, FiPhone, FiCalendar, FiEdit2, FiSave, FiMapPin,
  FiCheck, FiPlus, FiX, FiAward, FiTrendingUp, FiCheckCircle,
  FiUpload, FiCamera, FiTrash2, FiLock
} from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MOCK_AVATARS = [
  { name: 'Boy Tech', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
  { name: 'Girl Design', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { name: 'Gaming Boy', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150' },
  { name: 'Creative Girl', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
  { name: 'Tech Guy', url: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150' },
  { name: 'Elegant Woman', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' }
];

const MEMBER_TIERS = [
  { name: 'Đồng (Bronze)', minPoints: 0, discount: 0, color: 'text-amber-600 bg-amber-600/10 border-amber-600/30' },
  { name: 'Bạc (Silver)', minPoints: 100, discount: 2, color: 'text-slate-400 bg-slate-400/10 border-slate-400/30' },
  { name: 'Vàng (Gold)', minPoints: 500, discount: 5, color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
  { name: 'Bạch Kim (Platinum)', minPoints: 1000, discount: 10, color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' }
];

// Helper gender normalizers to map friendly Vietnamese name to Database constraint capitals
const getFriendlyGender = (g) => {
  if (!g) return 'Nam';
  const clean = g.toUpperCase();
  if (clean === 'NAM') return 'Nam';
  if (clean === 'NU') return 'Nữ';
  return 'Khác';
};

const getDbGender = (g) => {
  if (!g) return 'NAM';
  const clean = g.trim().toLowerCase();
  if (clean === 'nam') return 'NAM';
  if (clean === 'nữ' || clean === 'nu') return 'NU';
  return 'KHAC';
};

export default function Profile() {
  const { user, token, updateUser, loading } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  // State Profile
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    hoTen: user?.hoTen || '',
    email: user?.email || '',
    soDienThoai: user?.soDienThoai || '',
    ngaySinh: user?.ngaySinh ? user.ngaySinh.split('T')[0] : '',
    gioiTinh: getFriendlyGender(user?.gioiTinh),
    anhDaiDien: user?.anhDaiDien || ''
  });

  // State Password Change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  // State Addresses
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    tenNguoiNhan: '',
    sdtNguoiNhan: '',
    diaChiCuThe: '',
    phuongXa: '',
    quanHuyen: '',
    tinhThanh: '',
    laMacDinh: false
  });
  const [submittingAddress, setSubmittingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // State VIP Packages
  const [vipPackages, setVipPackages] = useState([]);
  const [currentVip, setCurrentVip] = useState(null);
  const [loadingVip, setLoadingVip] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        hoTen: user.hoTen || '',
        email: user.email || '',
        soDienThoai: user.soDienThoai || '',
        ngaySinh: user.ngaySinh ? user.ngaySinh.split('T')[0] : '',
        gioiTinh: getFriendlyGender(user.gioiTinh),
        anhDaiDien: user.anhDaiDien || ''
      });
    }
    if (activeTab === 'address') fetchAddresses();
    if (activeTab === 'vip') fetchVIPData();
  }, [user, activeTab]);

  // Fetch Delivery Addresses
  const fetchAddresses = async () => {
    if (!token) return;
    setLoadingAddresses(true);
    try {
      const res = await axios.get(`${API_URL}/users/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(res.data.data || []);
    } catch (err) {
      console.error('Error fetching addresses', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Fetch VIP status & packages
  const fetchVIPData = async () => {
    if (!token) return;
    setLoadingVip(true);
    try {
      const statusRes = await axios.get(`${API_URL}/users/vip-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentVip(statusRes.data.data || null);

      const pkgRes = await axios.get(`${API_URL}/users/vip-packages`);
      setVipPackages(pkgRes.data.data || []);
    } catch (err) {
      console.error('Error fetching VIP info', err);
    } finally {
      setLoadingVip(false);
    }
  };

  // Handle local avatar file upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size & type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chỉ chọn các tệp tin hình ảnh!');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa cho phép là 5MB!');
      return;
    }

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('avatar', file);

    try {
      const res = await axios.post(`${API_URL}/users/upload-avatar`, uploadData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setFormData(prev => ({ ...prev, anhDaiDien: res.data.data.url }));
      toast.success('Tải hình ảnh lên thành công! Hãy bấm "Lưu hồ sơ" để lưu lại.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể tải hình ảnh lên hệ thống');
    } finally {
      setUploading(false);
    }
  };

  // Profile Submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser({
        hoTen: formData.hoTen,
        ngaySinh: formData.ngaySinh || null,
        gioiTinh: getDbGender(formData.gioiTinh),
        anhDaiDien: formData.anhDaiDien
      });
      toast.success('Cập nhật hồ sơ cá nhân thành công! ✨');
      setIsEditing(false);
      setShowAvatarPicker(false);
    } catch (err) {
      toast.error(err.message || 'Cập nhật thất bại');
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.warning('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (newPassword.length < 6) {
      toast.warning('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.warning('Mật khẩu xác nhận không khớp');
      return;
    }
    setChangingPassword(true);
    try {
      await axios.put(`${API_URL}/users/change-password`, {
        matKhauCu: currentPassword,
        matKhauMoi: newPassword
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Đổi mật khẩu thành công! 🔐');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle open add address modal
  const handleAddNewAddress = () => {
    setEditingAddressId(null);
    setNewAddress({
      tenNguoiNhan: '',
      sdtNguoiNhan: '',
      diaChiCuThe: '',
      phuongXa: '',
      quanHuyen: '',
      tinhThanh: '',
      laMacDinh: false
    });
    setShowAddressModal(true);
  };

  // Handle open edit address modal
  const handleEditAddress = (addr) => {
    setEditingAddressId(addr.MaDiaChi);
    setNewAddress({
      tenNguoiNhan: addr.TenNguoiNhan || '',
      sdtNguoiNhan: addr.SDTNguoiNhan || '',
      diaChiCuThe: addr.DiaChiCuThe || '',
      phuongXa: addr.PhuongXa || '',
      quanHuyen: addr.QuanHuyen || '',
      tinhThanh: addr.TinhThanh || '',
      laMacDinh: !!addr.LaMacDinh
    });
    setShowAddressModal(true);
  };

  // Handle delete address
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ giao hàng này không? 🗑️')) return;
    try {
      await axios.delete(`${API_URL}/users/addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Đã xóa địa chỉ giao hàng thành công! 🗑️');
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xóa địa chỉ');
    }
  };

  // Address Submit (handles both Add and Edit)
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAddress(true);
    try {
      if (editingAddressId) {
        // Edit Address
        await axios.put(`${API_URL}/users/addresses/${editingAddressId}`, newAddress, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Cập nhật địa chỉ giao hàng thành công! ✨');
      } else {
        // Add Address
        await axios.post(`${API_URL}/users/addresses`, newAddress, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Đã thêm địa chỉ giao hàng mới thành công! ✨');
      }
      setShowAddressModal(false);
      setEditingAddressId(null);
      // Reset form
      setNewAddress({
        tenNguoiNhan: '',
        sdtNguoiNhan: '',
        diaChiCuThe: '',
        phuongXa: '',
        quanHuyen: '',
        tinhThanh: '',
        laMacDinh: false
      });
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác địa chỉ thất bại');
    } finally {
      setSubmittingAddress(false);
    }
  };

  // Join VIP package
  const handleSubscribeVIP = async (pkgId, pkgName) => {
    if (!window.confirm(`Bạn có chắc muốn đăng ký gói ${pkgName}?`)) return;
    try {
      await axios.post(
        `${API_URL}/users/vip/subscribe`,
        { maGiaDichVu: pkgId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Đăng ký gói ${pkgName} thành công! Nhận ngay 100 điểm thưởng! 🎉`);
      fetchVIPData();
      // Reload user details to sync accumulated points
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký VIP thất bại');
    }
  };

  // Helper calculates loyalty progress
  const getCurrentTier = () => {
    const pts = user?.diemTichLuy || 0;
    for (let i = MEMBER_TIERS.length - 1; i >= 0; i--) {
      if (pts >= MEMBER_TIERS[i].minPoints) {
        return { tier: MEMBER_TIERS[i], next: MEMBER_TIERS[i + 1] || null };
      }
    }
    return { tier: MEMBER_TIERS[0], next: MEMBER_TIERS[1] };
  };

  const { tier: currentTier, next: nextTier } = getCurrentTier();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Hidden file input for Avatar selection */}
      <input
        type="file"
        id="avatar-upload-input"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />

      {/* Title */}
      <h1 className="text-3xl font-extrabold text-white mb-6 flex items-center gap-2">
        👤 Tài khoản của tôi
      </h1>

      {/* Tabs list */}
      <div className="flex gap-2 border-b border-slate-800 pb-3 mb-6 flex-wrap">
        {[
          { key: 'profile', label: 'Thông tin cá nhân', icon: FiUser },
          { key: 'address', label: 'Sổ địa chỉ giao hàng', icon: FiMapPin },
          { key: 'vip', label: 'Hạng VIP & Ưu đãi', icon: FaCrown }
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setSearchParams({ tab: t.key })}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === t.key
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: MINI CARD (Point & Status) */}
        <div className="space-y-6">
          {/* User Brief card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full blur-2xl" />
            
            <div className="relative flex flex-col items-center text-center">
              {/* Avatar Frame with select option */}
              <div className="relative group mb-4">
                <div
                  onClick={() => {
                    if (isEditing) {
                      document.getElementById('avatar-upload-input')?.click();
                    }
                  }}
                  className={`w-28 h-28 rounded-full overflow-hidden border-2 border-red-500/50 p-1 bg-slate-950 flex items-center justify-center relative ${
                    isEditing ? 'cursor-pointer hover:border-red-500 hover:scale-105 transition-all group' : ''
                  }`}
                  title={isEditing ? 'Click để tải ảnh lên trực tiếp' : ''}
                >
                  {formData.anhDaiDien ? (
                    <img src={formData.anhDaiDien} alt={user?.hoTen} className="w-full h-full rounded-full object-cover transition-opacity group-hover:opacity-75" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-800 text-white font-extrabold text-3xl flex items-center justify-center transition-colors group-hover:bg-slate-700">
                      {user?.hoTen?.[0]?.toUpperCase()}
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiCamera className="text-white" size={24} />
                      <span className="text-[8px] text-white mt-1 uppercase font-bold">Tải ảnh</span>
                    </div>
                  )}
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAvatarPicker(!showAvatarPicker);
                    }}
                    className="absolute bottom-0 right-0 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition"
                    title="Chọn ảnh đại diện thiết kế sẵn"
                  >
                    <FiPlus size={14} />
                  </button>
                )}
              </div>

              <h2 className="text-xl font-bold text-white mb-1 truncate max-w-full">{user?.hoTen}</h2>
              <p className="text-sm text-slate-400 truncate max-w-full mb-3">{user?.email}</p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 justify-center">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${currentTier.color}`}>
                  <FiAward size={12} /> Hạng {currentTier.name.split(' ')[0]}
                </span>
                {currentVip && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-yellow-400/30 text-yellow-400 bg-yellow-400/10 animate-pulse">
                    👑 VIP Member
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Membership Tier Progress Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <FiTrendingUp className="text-red-500" /> Tiến trình nâng hạng
            </h3>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>Điểm tích lũy:</span>
                <span className="text-yellow-400">{user?.diemTichLuy || 0} điểm</span>
              </div>

              {/* Progress bar */}
              {nextTier ? (
                (() => {
                  const currentMin = currentTier.minPoints;
                  const targetPoints = nextTier.minPoints;
                  const gained = (user?.diemTichLuy || 0) - currentMin;
                  const totalNeeded = targetPoints - currentMin;
                  const pct = Math.min(100, Math.max(0, (gained / totalNeeded) * 100));

                  return (
                    <div className="space-y-2">
                      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700/50">
                        <div className="bg-gradient-to-r from-red-500 to-amber-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs text-slate-400">
                        Cần thêm <span className="text-white font-bold">{targetPoints - (user?.diemTichLuy || 0)}</span> điểm để nâng hạng <span className="text-red-400 font-bold">{nextTier.name.split(' ')[0]}</span>.
                      </p>
                    </div>
                  );
                })()
              ) : (
                <p className="text-xs text-green-400 font-semibold flex items-center gap-1">
                  <FiCheckCircle /> Bạn đã đạt cấp bậc cao nhất (Platinum)!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN CONTENT ACCORDING TO ACTIVE TAB */}
        <div className="lg:col-span-2 space-y-6">

          {/* TAB 1: PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">📋 Chi tiết thông tin</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-red-600/10"
                  >
                    <FiEdit2 size={13} /> Chỉnh sửa
                  </button>
                )}
              </div>

              {/* Avatar Grid selection (Unsplash mockup Gallery) */}
              <AnimatePresence>
                {isEditing && showAvatarPicker && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-6 p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-4 overflow-hidden"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Chọn ảnh đại diện thiết kế sẵn</span>
                      <button type="button" onClick={() => setShowAvatarPicker(false)} className="text-slate-400 hover:text-white"><FiX size={16} /></button>
                    </div>

                    {/* Quick direct upload helper inside picker */}
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => document.getElementById('avatar-upload-input')?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition"
                      >
                        <FiUpload size={14} /> {uploading ? '🔄 Đang tải lên...' : '📁 Hoặc tải tệp tin từ thiết bị của bạn'}
                      </button>
                    </div>

                    {/* Mock Avatar Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {MOCK_AVATARS.map((av, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, anhDaiDien: av.url }));
                            setShowAvatarPicker(false);
                            toast.info('Đã chọn ảnh mẫu. Hãy bấm "Lưu hồ sơ" để hoàn tất.');
                          }}
                          className={`relative w-14 h-14 rounded-full overflow-hidden border-2 transition ${
                            formData.anhDaiDien === av.url ? 'border-red-500 scale-105 shadow-lg shadow-red-500/20' : 'border-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-900">
                      <input
                        type="text"
                        placeholder="Hoặc dán trực tiếp đường dẫn URL ảnh vào đây..."
                        value={formData.anhDaiDien}
                        onChange={(e) => setFormData(prev => ({ ...prev, anhDaiDien: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-1.5 text-xs outline-none focus:border-red-500 transition"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Họ và tên</label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={formData.hoTen}
                        onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                        disabled={!isEditing}
                        className="w-full bg-slate-800/40 border border-slate-800 text-white rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Số điện thoại</label>
                    <div className="relative">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={formData.soDienThoai}
                        disabled
                        className="w-full bg-slate-850 border border-slate-800 text-slate-400 rounded-xl pl-11 pr-4 py-2.5 text-sm cursor-not-allowed opacity-60"
                        title="Số điện thoại là định danh tài khoản, không thể thay đổi"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email cá nhân</label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full bg-slate-850 border border-slate-800 text-slate-400 rounded-xl pl-11 pr-4 py-2.5 text-sm cursor-not-allowed opacity-60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ngày sinh</label>
                    <div className="relative">
                      <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="date"
                        value={formData.ngaySinh}
                        onChange={(e) => setFormData({ ...formData, ngaySinh: e.target.value })}
                        disabled={!isEditing}
                        className="w-full bg-slate-800/40 border border-slate-800 text-white rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Giới tính</label>
                  {isEditing ? (
                    <div className="flex gap-4">
                      {['Nam', 'Nữ', 'Khác'].map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setFormData({ ...formData, gioiTinh: g })}
                          className={`px-6 py-2.5 rounded-xl text-sm font-semibold border transition ${
                            formData.gioiTinh === g
                              ? 'bg-red-600/10 border-red-500 text-red-400 shadow-md'
                              : 'border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={formData.gioiTinh}
                      disabled
                      className="w-full bg-slate-800/20 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm disabled:opacity-50"
                    />
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4 border-t border-slate-800/30">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setShowAvatarPicker(false);
                        setFormData({
                          hoTen: user?.hoTen || '',
                          email: user?.email || '',
                          soDienThoai: user?.soDienThoai || '',
                          ngaySinh: user?.ngaySinh ? user.ngaySinh.split('T')[0] : '',
                          gioiTinh: getFriendlyGender(user?.gioiTinh),
                          anhDaiDien: user?.anhDaiDien || ''
                        });
                      }}
                      className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition text-sm"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/10"
                    >
                      <FiSave size={15} /> {loading ? 'Đang lưu...' : 'Lưu hồ sơ'}
                    </button>
                  </div>
                )}
              </form>

              {/* Password Change */}
              <div className="mt-6 pt-6 border-t border-slate-800/30">
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
                >
                  <FiLock size={13} /> {showPasswordForm ? 'Đóng' : 'Đổi mật khẩu'}
                </button>
                <AnimatePresence>
                  {showPasswordForm && (
                    <motion.form
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      onSubmit={handlePasswordChange}
                      className="overflow-hidden mt-4 space-y-4"
                    >
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mật khẩu hiện tại</label>
                        <input
                          type="password"
                          required
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
                          placeholder="••••••••"
                          className="w-full bg-slate-800/40 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500 transition"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mật khẩu mới</label>
                          <input
                            type="password"
                            required
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                            placeholder="Ít nhất 6 ký tự"
                            className="w-full bg-slate-800/40 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Xác nhận mật khẩu</label>
                          <input
                            type="password"
                            required
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                            placeholder="Nhập lại mật khẩu mới"
                            className="w-full bg-slate-800/40 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500 transition"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={changingPassword}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition text-sm flex items-center gap-2 shadow-lg shadow-red-600/10 disabled:opacity-50"
                      >
                        {changingPassword ? 'Đang xử lý...' : 'Lưu mật khẩu mới'}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* TAB 2: DELIVERY ADDRESS BOOK */}
          {activeTab === 'address' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FiMapPin className="text-red-500" /> Sổ địa chỉ giao hàng
                </h3>
                <button
                  onClick={handleAddNewAddress}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-red-600/10"
                >
                  <FiPlus size={14} /> Thêm mới
                </button>
              </div>

              {loadingAddresses ? (
                <div className="space-y-3">
                  {[1,2].map(i => <div key={i} className="h-20 bg-slate-800/40 rounded-xl animate-pulse" />)}
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-10 bg-slate-950/20 border border-slate-850 rounded-xl">
                  <span className="text-2xl">📍</span>
                  <p className="text-slate-400 text-sm mt-2">Bạn chưa có địa chỉ giao hàng nào.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div key={addr.MaDiaChi} className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="text-xl bg-slate-800 p-2.5 rounded-lg border border-slate-700/50 flex-shrink-0 text-red-400">
                          📍
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">{addr.TenNguoiNhan}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400 text-xs font-medium">{addr.SDTNguoiNhan}</span>
                            {addr.LaMacDinh && (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold rounded-full uppercase">
                                <FiCheck size={8} /> Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1.5 truncate">
                            {addr.DiaChiCuThe}, {addr.PhuongXa}, {addr.QuanHuyen}, {addr.TinhThanh}
                          </p>
                        </div>
                      </div>
                      
                      {/* Action buttons (Edit & Delete) */}
                      <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                        <button
                          type="button"
                          onClick={() => handleEditAddress(addr)}
                          className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-850 border border-slate-700/50 hover:border-slate-600 rounded-lg transition"
                          title="Sửa địa chỉ"
                        >
                          <FiEdit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.MaDiaChi)}
                          className="p-2 text-red-450 hover:text-red-400 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 hover:border-red-900/50 rounded-lg transition"
                          title="Xóa địa chỉ"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: VIP TIER & BENEFITS */}
          {activeTab === 'vip' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              {/* Active VIP card */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-yellow-400/5 rounded-full blur-3xl animate-pulse" />
                
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  👑 Gói VIP đang sử dụng
                </h3>

                {loadingVip ? (
                  <div className="h-20 bg-slate-850 rounded-xl animate-pulse" />
                ) : currentVip ? (
                  <div className="p-4 rounded-xl bg-yellow-400/5 border border-yellow-400/20 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-yellow-400 flex items-center gap-1.5">
                        ✨ Gói {currentVip.TenGoi}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold">
                        Đang hoạt động
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 space-y-1">
                      <p>Ngày bắt đầu: {new Date(currentVip.NgayBatDau).toLocaleDateString('vi-VN')}</p>
                      <p>Ngày hết hạn: {new Date(currentVip.NgayKetThuc).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-950/20 border border-slate-850 rounded-xl space-y-2">
                    <span className="text-3xl">🛡️</span>
                    <p className="text-slate-400 text-sm font-semibold">Bạn hiện chưa tham gia gói thành viên VIP nào</p>
                    <p className="text-xs text-slate-500">Đăng ký ngay để nhận ưu đãi đặc quyền và 100 điểm tích lũy!</p>
                  </div>
                )}
              </div>

              {/* VIP Subscribe Options */}
              {!currentVip && vipPackages.length > 0 && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    ⚡ Các gói VIP siêu ưu đãi
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {vipPackages.map((pkg) => (
                      <div key={pkg.MaGiaDichVu} className="p-4 rounded-xl bg-slate-950/50 border border-slate-850 flex flex-col justify-between items-center text-center space-y-4">
                        <div>
                          <h4 className="font-bold text-white text-sm">{pkg.TenGoi}</h4>
                          <span className="text-xs text-yellow-400 font-semibold">{pkg.ThoiGianDangKy} ngày</span>
                        </div>
                        <div className="text-red-400 font-extrabold text-sm">
                          ₫{Number(pkg.GiaTien).toLocaleString('vi-VN')}
                        </div>
                        <button
                          onClick={() => handleSubscribeVIP(pkg.MaGiaDichVu, pkg.TenGoi)}
                          className="w-full py-1.5 text-xs font-bold bg-yellow-500 hover:bg-yellow-600 text-slate-950 rounded-lg transition shadow-md shadow-yellow-500/10"
                        >
                          Đăng ký ngay
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Membership Benefits comparison */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  🎁 Đặc quyền ưu đãi theo cấp bậc
                </h3>
                <div className="space-y-3">
                  {MEMBER_TIERS.map((tier, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-950/20 border border-slate-850/60">
                      <div>
                        <p className="text-sm font-bold text-white">{tier.name.split(' ')[0]}</p>
                        <p className="text-xs text-slate-500">Mốc đạt được: {tier.minPoints} điểm</p>
                      </div>
                      <span className="text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                        Giảm {tier.discount}% toàn sản phẩm
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>

      {/* NEW ADDRESS MODAL */}
      <AnimatePresence>
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/30">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  📍 {editingAddressId ? 'Cập nhật địa chỉ giao hàng' : 'Thêm địa chỉ giao hàng mới'}
                </h3>
                <button onClick={() => setShowAddressModal(false)} className="text-slate-400 hover:text-white">
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleAddressSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Người nhận</label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A..."
                      value={newAddress.tenNguoiNhan}
                      onChange={(e) => setNewAddress({ ...newAddress, tenNguoiNhan: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Số điện thoại</label>
                    <input
                      type="text"
                      required
                      placeholder="0912345678..."
                      value={newAddress.sdtNguoiNhan}
                      onChange={(e) => setNewAddress({ ...newAddress, sdtNguoiNhan: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Địa chỉ cụ thể</label>
                  <input
                    type="text"
                    required
                    placeholder="Số nhà, ngõ ngách, tên đường..."
                    value={newAddress.diaChiCuThe}
                    onChange={(e) => setNewAddress({ ...newAddress, diaChiCuThe: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500 transition"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phường / Xã</label>
                    <input
                      type="text"
                      required
                      placeholder="Phường 12..."
                      value={newAddress.phuongXa}
                      onChange={(e) => setNewAddress({ ...newAddress, phuongXa: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-red-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Quận / Huyện</label>
                    <input
                      type="text"
                      required
                      placeholder="Quận 10..."
                      value={newAddress.quanHuyen}
                      onChange={(e) => setNewAddress({ ...newAddress, quanHuyen: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-red-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tỉnh / Thành</label>
                    <input
                      type="text"
                      required
                      placeholder="TP. HCM..."
                      value={newAddress.tinhThanh}
                      onChange={(e) => setNewAddress({ ...newAddress, tinhThanh: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-red-500 transition"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Đặt làm mặc định</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAddress.laMacDinh}
                      onChange={(e) => setNewAddress({ ...newAddress, laMacDinh: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600 peer-checked:after:bg-white" />
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800/40">
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition font-medium"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAddress}
                    className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition flex items-center gap-1.5 shadow-lg shadow-red-600/20 disabled:opacity-50"
                  >
                    {submittingAddress ? 'Đang xử lý...' : (editingAddressId ? 'Cập nhật địa chỉ' : 'Lưu địa chỉ')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
