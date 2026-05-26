import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiRefreshCw } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { verifyOTP, resendOTP, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

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

    // Auto focus next input
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
      await resendOTP(email);
      toast.success('Đã gửi lại mã OTP');
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-full 
                      flex items-center justify-center mx-auto mb-6 glow-red">
          <FiMail className="text-white text-3xl" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Xác thực tài khoản</h1>
        <p className="text-gray-400">
          Chúng tôi đã gửi mã OTP đến email
        </p>
        <p className="text-red-500 font-semibold mt-1">{email}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
            Nhập mã OTP (6 chữ số)
          </label>
          <div className="flex justify-center space-x-3" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold bg-gray-900/50 border-2 border-gray-800 
                         rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 
                         focus:border-transparent transition-all"
                autoFocus={index === 0}
              />
            ))}
          </div>
        </div>

        {/* Countdown */}
        <div className="text-center">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="text-red-500 hover:text-red-400 font-semibold flex items-center 
                       justify-center space-x-2 mx-auto"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              <span>Gửi lại mã OTP</span>
            </button>
          ) : (
            <p className="text-gray-400">
              Gửi lại mã sau{' '}
              <span className="text-red-500 font-semibold">{countdown}s</span>
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || otp.join('').length !== 6}
          className="w-full btn-primary"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="spinner w-5 h-5 border-2" />
              <span>Đang xác thực...</span>
            </div>
          ) : (
            'Xác thực'
          )}
        </button>

        {/* Back to Login */}
        <p className="text-center text-gray-400">
          <Link to="/login" className="text-red-500 hover:text-red-400 font-semibold">
            Quay lại đăng nhập
          </Link>
        </p>
      </form>

      {/* Help Text */}
      <div className="mt-8 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
        <p className="text-sm text-gray-400 text-center">
          Không nhận được email? Kiểm tra thư mục spam hoặc liên hệ hỗ trợ
        </p>
      </div>
    </motion.div>
  );
};

export default VerifyOTP;
