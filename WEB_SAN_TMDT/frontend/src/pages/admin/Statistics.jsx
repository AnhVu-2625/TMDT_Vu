import React, { useEffect, useState } from 'react';
import { FiUsers, FiShoppingBag, FiTrendingUp, FiDollarSign, FiAlertTriangle, FiMessageSquare, FiLock, FiRefreshCw } from 'react-icons/fi';
import StatCard from '../../components/admin/StatCard';
import PageHeader from '../../components/admin/PageHeader';
import { getStatistics } from '../../services/adminApi';

const fmtMoney = n => n == null ? '—' : Number(n).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
const fmt = n => n == null ? '—' : Number(n).toLocaleString('vi-VN');

export default function AdminStatistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getStatistics()
      .then(r => setStats(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <PageHeader
        title="Thống kê tổng quan"
        subtitle="Số liệu tổng hợp toàn hệ thống"
        action={
          <button onClick={load} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
          </button>
        }
      />

      {loading ? (
        <div className="text-center py-16 text-gray-500">Đang tải...</div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Người dùng & Cửa hàng</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={FiUsers}       label="Tổng người dùng"    value={fmt(stats?.totalUsers)}    color="blue" />
              <StatCard icon={FiLock}        label="Tài khoản bị khóa"  value={fmt(stats?.lockedUsers)}   color="red" />
              <StatCard icon={FiShoppingBag} label="Tổng cửa hàng"      value={fmt(stats?.totalShops)}    color="purple" />
              <StatCard icon={FiShoppingBag} label="Chờ duyệt shop"     value={fmt(stats?.pendingShops)}  color="yellow" />
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Đơn hàng & Doanh thu</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard icon={FiTrendingUp}  label="Tổng đơn hàng"      value={fmt(stats?.totalOrders)}   color="green" />
              <StatCard icon={FiDollarSign}  label="Tổng doanh thu"      value={fmtMoney(stats?.totalRevenue)} color="yellow" />
              <StatCard icon={FiDollarSign}  label="Yêu cầu rút tiền"   value={fmt(stats?.pendingWithdrawals)} color="orange" sub="Chờ duyệt" />
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Xử lý & Kiểm duyệt</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard icon={FiAlertTriangle} label="Báo cáo vi phạm"  value={fmt(stats?.pendingReports)}  color="red"    sub="Chờ xử lý" />
              <StatCard icon={FiMessageSquare} label="Tranh chấp"        value={fmt(stats?.pendingDisputes)} color="orange" sub="Chờ phán quyết" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
