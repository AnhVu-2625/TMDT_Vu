import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiHome, FiCheckCircle } from 'react-icons/fi';

export default function ShopPending() {
  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        className="max-w-md w-full text-center glass-card rounded-2xl p-10">
        
        {/* Icon */}
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center">
          <FiClock size={40} className="text-amber-400" />
        </motion.div>

        <h1 className="text-2xl font-bold text-white mb-3">Hồ sơ đang được xét duyệt</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Cảm ơn bạn đã đăng ký! Admin sẽ xét duyệt hồ sơ cửa hàng của bạn trong vòng <span className="text-amber-400 font-semibold">24-48 giờ</span>.
        </p>

        {/* Status steps */}
        <div className="space-y-4 mb-8 text-left">
          {[
            { icon: FiCheckCircle, text: 'Gửi hồ sơ đăng ký', done: true },
            { icon: FiClock, text: 'Chờ Admin xét duyệt', active: true },
            { icon: FiCheckCircle, text: 'Bắt đầu bán hàng', done: false }
          ].map((step, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${step.active ? 'bg-amber-500/10 border border-amber-500/20' : step.done ? 'bg-emerald-500/5' : 'bg-white/[0.02]'}`}>
              <step.icon size={20} className={step.done ? 'text-emerald-400' : step.active ? 'text-amber-400' : 'text-slate-600'} />
              <span className={step.active ? 'text-amber-300 font-medium' : step.done ? 'text-emerald-400' : 'text-slate-500'}>{step.text}</span>
            </div>
          ))}
        </div>

        <Link to="/" className="btn-primary w-full flex items-center justify-center gap-2">
          <FiHome size={16} /> Về trang chủ
        </Link>
      </motion.div>
    </div>
  );
}
