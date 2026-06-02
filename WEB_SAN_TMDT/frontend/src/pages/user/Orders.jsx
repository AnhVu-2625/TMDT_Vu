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
      <div className="min-h-screen flex items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-32 h-32 bg-gradient-to-br from-slate-800 to-black rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700">
            <FiPackage className="text-6xl text-slate-600" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Chưa có đơn hàng</h2>
          <p className="text-slate-400 mb-8">Bạn chưa có đơn hàng nào</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Đơn hàng của tôi</h1>
        
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-slate-900 to-black border border-slate-800 rounded-xl p-6 shadow-xl hover:shadow-red-600/20 transition-all"
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
