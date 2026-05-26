import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiCalendar, FiEdit2, FiSave } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateUser, loading } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    hoTen: user?.hoTen || '',
    email: user?.email || '',
    soDienThoai: user?.soDienThoai || '',
    ngaySinh: user?.ngaySinh || '',
    gioiTinh: user?.gioiTinh || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(formData);
      toast.success('Cập nhật thông tin thành công');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom max-w-4xl">
        <h1 className="heading-2 text-white mb-8">Thông tin cá nhân</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar */}
          <div className="card text-center">
            <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center">
              {user?.anhDaiDien ? (
                <img src={user.anhDaiDien} alt={user.hoTen} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-white font-bold text-4xl">
                  {user?.hoTen?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{user?.hoTen}</h3>
            <p className="text-gray-400 mb-4">{user?.email}</p>
            <button className="btn-outline w-full">Đổi ảnh đại diện</button>
          </div>

          {/* Info Form */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Thông tin chi tiết</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <FiEdit2 />
                  <span>Chỉnh sửa</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Họ và tên
                </label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.hoTen}
                    onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                    disabled={!isEditing}
                    className="input-field pl-12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="input-field pl-12 opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Số điện thoại
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.soDienThoai}
                    onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                    disabled={!isEditing}
                    className="input-field pl-12"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary flex-1"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 flex items-center justify-center space-x-2"
                  >
                    <FiSave />
                    <span>Lưu thay đổi</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
