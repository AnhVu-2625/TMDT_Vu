import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* 404 Text */}
          <motion.h1
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-9xl md:text-[200px] font-bold gradient-text mb-8"
          >
            404
          </motion.h1>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trang không tồn tại
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
              Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <Link
              to="/"
              className="btn-primary flex items-center space-x-2"
            >
              <FiHome />
              <span>Về trang chủ</span>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="btn-outline flex items-center space-x-2"
            >
              <FiArrowLeft />
              <span>Quay lại</span>
            </button>
          </motion.div>

          {/* Decoration */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="mt-16 text-8xl"
          >
            🔍
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
