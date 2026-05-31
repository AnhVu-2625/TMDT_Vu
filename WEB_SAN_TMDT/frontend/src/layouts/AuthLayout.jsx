import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex bg-[#050507]">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Subtle background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.04]"
            style={{ background: 'radial-gradient(circle, #dc2626 0%, transparent 70%)' }} />
          <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full opacity-[0.03]"
            style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 mb-10">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-800 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
                <span className="text-white font-black text-xl">M</span>
              </div>
              <span className="text-2xl font-black gradient-text">MartHub</span>
            </motion.div>
          </Link>

          {/* Form Content */}
          <Outlet />
        </div>
      </div>

      {/* Right Side - Cinematic Branding Panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Dark gradient background with pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-[#0a0a0e] to-[#050507]" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }} />

        {/* Glowing orbs */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #dc2626 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)', filter: 'blur(40px)' }} />
        
        <div className="relative z-10 flex flex-col justify-center p-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Nền tảng TMĐT hàng đầu
            </div>

            <h1 className="text-5xl font-black mb-6 leading-tight">
              Chào mừng đến với
              <br />
              <span className="gradient-text text-6xl">MartHub</span>
            </h1>
            <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-md">
              Kết nối hàng triệu người mua và người bán trên nền tảng thương mại điện tử trung tâm.
            </p>

            {/* Feature list */}
            <ul className="space-y-4">
              {[
                { icon: '🛡️', text: 'Thanh toán qua sàn bảo mật' },
                { icon: '⚡', text: 'Giao hàng nhanh toàn quốc' },
                { icon: '💬', text: 'Chat trực tiếp với người bán' },
                { icon: '👑', text: 'Tích điểm VIP, nhận ưu đãi' }
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center space-x-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-lg">
                    {item.icon}
                  </div>
                  <span className="text-slate-300 font-medium">{item.text}</span>
                </motion.li>
              ))}
            </ul>

            {/* Stats */}
            <div className="flex gap-8 mt-12 pt-8 border-t border-white/[0.06]">
              {[
                { num: '10M+', label: 'Sản phẩm' },
                { num: '500K+', label: 'Người bán' },
                { num: '5M+', label: 'Khách hàng' },
              ].map((stat, i) => (
                <motion.div key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                >
                  <div className="text-2xl font-black gradient-text">{stat.num}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
