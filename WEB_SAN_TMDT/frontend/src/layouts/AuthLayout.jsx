import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center glow-red">
                <span className="text-white font-bold text-2xl">E</span>
              </div>
              <span className="text-2xl font-bold gradient-text">ECommerce</span>
            </motion.div>
          </Link>

          {/* Form Content */}
          <Outlet />
        </div>
      </div>

      {/* Right Side - Image/Branding */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1557821552-17105176677c?w=1920"
            alt="Shopping"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/90 to-black/90" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center p-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl font-bold mb-6 text-shadow-lg">
              Chào mừng đến với<br />
              <span className="text-white">ECommerce</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 text-shadow">
              Nền tảng thương mại điện tử hàng đầu Việt Nam
            </p>
            <ul className="space-y-4">
              {[
                'Hàng ngàn sản phẩm chất lượng',
                'Giao hàng nhanh chóng',
                'Thanh toán an toàn',
                'Hỗ trợ 24/7'
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                  <span className="text-lg">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
