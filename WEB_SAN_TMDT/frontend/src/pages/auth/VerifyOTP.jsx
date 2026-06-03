import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiRefreshCw, FiArrowRight } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [displayOtp, setDisplayOtp] = useState(location.state?.otp);
  const { verifyOTP, resendOTP, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const demoOtp = location.state?.otp;

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      toast.error('Vui lòng nhập đầy đủ mã OTP');
      return;
    }

    try {
      await verifyOTP(email, otpCode);
      toast.success('Xác thực thành công!');
      navigate('/login');
    } catch (error) {
      toast.error(error.message);
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      const res = await resendOTP(email);
      const newOtp = res?.data?.otp;
      if (newOtp) { setDisplayOtp(newOtp); toast.info(`[Demo] Mã OTP mới: ${newOtp}`, { autoClose: 10000 }); }
      else toast.success('Đã gửi lại mã OTP');
      setCountdown(60);
      setCanResend(false);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
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
        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-12"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: -5 }}
            className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-600/50"
          >
            <FiMail className="text-white text-5xl" />
          </motion.div>
          <h1 className="text-4xl font-black text-white mb-2">Xác thực tài khoản</h1>
          <p className="text-slate-300 mb-1">Chúng tôi đã gửi mã OTP đến email:</p>
          <p className="text-red-500 font-bold text-lg break-all">{email}</p>
          {displayOtp && (
            <motion.div key={displayOtp} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 mx-auto max-w-sm p-3 bg-yellow-500/10 border-2 border-dashed border-yellow-500/40 rounded-xl">
              <p className="text-yellow-400 font-bold text-xs uppercase tracking-wider mb-1">🔧 Chế độ Demo</p>
              <p className="text-white font-bold text-2xl tracking-[0.3em]">{displayOtp}</p>
              <p className="text-yellow-500/60 text-[10px] mt-1">Sao chép mã này để xác thực (email không hoạt động)</p>
            </motion.div>
          )}
        </motion.div>

        {/* OTP Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gradient-to-br from-slate-900 to-black border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {/* OTP Label */}
              <motion.label variants={itemVariants} className="block text-center">
                <span className="block text-sm font-semibold text-white mb-2">Nhập mã OTP</span>
                <span className="text-xs text-slate-400">(6 chữ số)</span>
              </motion.label>

              {/* OTP Input Fields */}
              <motion.div
                variants={itemVariants}
                className="flex justify-center gap-3"
                onPaste={handlePaste}
              >
                {otp.map((digit, index) => (
                  <motion.input
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-14 h-16 text-center text-3xl font-bold bg-slate-800/50 border-2 border-slate-700 text-white placeholder-slate-600 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all hover:border-slate-600 hover:bg-slate-800/70"
                    autoFocus={index === 0}
                  />
                ))}
              </motion.div>

              {/* Countdown or Resend */}
              <motion.div variants={itemVariants} className="text-center pt-4">
                {canResend ? (
                  <motion.button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center space-x-2 text-red-500 hover:text-red-400 font-semibold transition-colors"
                  >
                    <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    <span>Gửi lại mã OTP</span>
                  </motion.button>
                ) : (
                  <div className="inline-block px-4 py-2 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-300 text-sm">
                      Gửi lại mã sau{' '}
                      <span className="text-red-500 font-bold text-base">{countdown}s</span>
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-lg hover:shadow-xl hover:shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed group mt-8"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <span>Xác thực OTP</span>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Back to Login */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-slate-400 mt-8 pt-6 border-t border-slate-800"
          >
            <Link to="/login" className="text-red-500 hover:text-red-400 font-bold transition-colors">
              ← Quay lại đăng nhập
            </Link>
          </motion.p>
        </motion.div>

        {/* Help Text */}
        {!displayOtp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-center"
          >
            <p className="text-sm text-slate-400">
              ❓ Không nhận được email? Kiểm tra thư mục <span className="text-yellow-500 font-semibold">Spam</span> hoặc liên hệ hỗ trợ khách hàng
            </p>
          </motion.div>
        )}

        {/* Security Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-slate-400 text-sm mt-6"
        >
          🔒 Mã OTP của bạn sẽ hết hạn sau 10 phút
        </motion.p>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
