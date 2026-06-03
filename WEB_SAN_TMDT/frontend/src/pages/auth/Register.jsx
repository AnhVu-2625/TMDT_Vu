import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    hoTen: '',
    email: '',
    soDienThoai: '',
    matKhau: '',
    xacNhanMatKhau: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast.error('Vui lòng đồng ý với Điều khoản sử dụng');
      return;
    }

    if (formData.matKhau !== formData.xacNhanMatKhau) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.matKhau.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      const { xacNhanMatKhau, ...registerData } = formData;
      const res = await register(registerData);
      const demoOtp = res?.data?.otp;
      if (demoOtp) toast.info(`[Demo] Mã OTP của bạn: ${demoOtp}`, { autoClose: 10000 });
      else toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
      navigate('/verify-otp', { state: { email: formData.email, otp: demoOtp } });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blur elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Logo Section */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-12"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-600/50"
          >
            <span className="text-4xl font-bold text-white">M</span>
          </motion.div>
          <h1 className="text-4xl font-black text-white mb-2">MartHub</h1>
          <p className="text-lg text-slate-300">Tạo tài khoản mới</p>
          <p className="text-sm text-slate-400 mt-2">Tham gia cộng đồng MartHub ngay hôm nay</p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gradient-to-br from-slate-900 to-black border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {/* Full Name Field */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-white mb-3">Họ và tên</label>
                <div className="relative group">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-red-500 transition-colors" size={18} />
                  <input
                    type="text"
                    name="hoTen"
                    value={formData.hoTen}
                    onChange={handleChange}
                    placeholder="Nhập họ và tên"
                    className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all hover:border-slate-600"
                    required
                  />
                </div>
              </motion.div>

              {/* Email Field */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-white mb-3">Email</label>
                <div className="relative group">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-red-500 transition-colors" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Nhập email"
                    className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all hover:border-slate-600"
                    required
                  />
                </div>
              </motion.div>

              {/* Phone Field */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-white mb-3">Số điện thoại</label>
                <div className="relative group">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-red-500 transition-colors" size={18} />
                  <input
                    type="tel"
                    name="soDienThoai"
                    value={formData.soDienThoai}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                    className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all hover:border-slate-600"
                    pattern="[0-9]{10,11}"
                    required
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-white mb-3">Mật khẩu</label>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-red-500 transition-colors" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="matKhau"
                    value={formData.matKhau}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-12 pr-12 py-3 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all hover:border-slate-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-white mb-3">Xác nhận mật khẩu</label>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-red-500 transition-colors" size={18} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="xacNhanMatKhau"
                    value={formData.xacNhanMatKhau}
                    onChange={handleChange}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-12 pr-12 py-3 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all hover:border-slate-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </motion.div>

              {/* Terms Agreement */}
              <motion.label variants={itemVariants} className="flex items-start space-x-3 group cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-5 h-5 mt-1 bg-slate-800 border border-slate-600 rounded-md text-red-600 focus:ring-red-600 focus:ring-offset-0 focus:ring-2 cursor-pointer"
                  required
                />
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                  Tôi đồng ý với{' '}
                  <Link to="/" className="text-red-500 hover:text-red-400 font-semibold transition-colors">
                    Điều khoản sử dụng
                  </Link>{' '}
                  và{' '}
                  <Link to="/" className="text-red-500 hover:text-red-400 font-semibold transition-colors">
                    Chính sách bảo mật
                  </Link>
                </span>
              </motion.label>

              {/* Submit Button */}
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-lg hover:shadow-xl hover:shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed group mt-6"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang đăng ký...</span>
                  </>
                ) : (
                  <>
                    <span>Tạo tài khoản</span>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Login Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-slate-400 mt-8 pt-6 border-t border-slate-800"
          >
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-red-500 hover:text-red-400 font-bold transition-colors">
              Đăng nhập ngay →
            </Link>
          </motion.p>
        </motion.div>

        {/* Security Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center text-slate-400 text-sm mt-8"
        >
          🔒 Dữ liệu của bạn được bảo mật tuyệt đối trên MartHub
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Register;
