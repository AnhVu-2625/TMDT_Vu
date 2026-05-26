import React from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiTruck, FiCheck, FiX } from 'react-icons/fi';

const Orders = () => {
  // Mock data - sẽ được thay thế bằng API call
  const orders = [];

  const getStatusBadge = (status) => {
    const badges = {
      'CHO_XAC_NHAN': { class: 'badge-yellow', text: 'Chờ xác nhận' },
      'DA_XAC_NHAN': { class: 'badge-blue', text: 'Đã xác nhận' },
      'DANG_GIAO': { class: 'badge-blue', text: 'Đang giao' },
      'DA_GIAO': { class: 'badge-green', text: 'Đã giao' },
      'DA_HUY': { class: 'badge-red', text: 'Đã hủy' }
    };
    return badges[status] || badges['CHO_XAC_NHAN'];
  };

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-32 h-32 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiPackage className="text-6xl text-gray-600" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Chưa có đơn hàng</h2>
          <p className="text-gray-400 mb-8">Bạn chưa có đơn hàng nào</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom max-w-5xl">
        <h1 className="heading-2 text-white mb-8">Đơn hàng của tôi</h1>
        
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              {/* Order content here */}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
