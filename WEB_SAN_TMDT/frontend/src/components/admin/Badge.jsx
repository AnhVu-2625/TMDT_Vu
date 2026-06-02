import React from 'react';

const presets = {
  HOAT_DONG:       'bg-green-600/20 text-green-400',
  BI_KHOA:         'bg-red-600/20 text-red-400',
  CHUA_KICH_HOAT:  'bg-yellow-600/20 text-yellow-400',
  CHO_DUYET:       'bg-yellow-600/20 text-yellow-400',
  DA_DUYET:        'bg-green-600/20 text-green-400',
  TU_CHOI:         'bg-red-600/20 text-red-400',
  CHO_XU_LY:       'bg-yellow-600/20 text-yellow-400',
  DANG_XU_LY:      'bg-blue-600/20 text-blue-400',
  DA_GIAI_QUYET:   'bg-green-600/20 text-green-400',
  BI_TU_CHOI:      'bg-red-600/20 text-red-400',
  SHOP_TU_CHOI:    'bg-red-600/20 text-red-400',
  KHIEU_NAI_ADMIN: 'bg-orange-600/20 text-orange-400',
  HOAN_THANH:      'bg-green-600/20 text-green-400',
  LOI:             'bg-red-600/20 text-red-400',
};

const labels = {
  HOAT_DONG: 'Hoạt động', BI_KHOA: 'Bị khóa', CHUA_KICH_HOAT: 'Chưa kích hoạt',
  CHO_DUYET: 'Chờ duyệt', DA_DUYET: 'Đã duyệt', TU_CHOI: 'Từ chối',
  CHO_XU_LY: 'Chờ xử lý', DANG_XU_LY: 'Đang xử lý', DA_GIAI_QUYET: 'Đã giải quyết',
  BI_TU_CHOI: 'Bị từ chối', SHOP_TU_CHOI: 'Shop từ chối', KHIEU_NAI_ADMIN: 'Chờ admin',
  HOAN_THANH: 'Hoàn thành', LOI: 'Lỗi',
};

export default function Badge({ status, text }) {
  const cls = presets[status] || 'bg-gray-700 text-gray-300';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {text || labels[status] || status}
    </span>
  );
}
