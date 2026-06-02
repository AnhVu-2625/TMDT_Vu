import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

API.interceptors.request.use(cfg => {
  // authStore dùng zustand persist với key 'auth-storage'
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      const token = parsed?.state?.token;
      if (token) cfg.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return cfg;
});

// ── Statistics ──────────────────────────────────────────────────────────────
export const getStatistics    = ()           => API.get('/admin/statistics');

// ── Users ───────────────────────────────────────────────────────────────────
export const getUsers         = (params)     => API.get('/admin/users', { params });
export const lockUser         = (id, lyDo)   => API.put(`/admin/users/${id}/lock`, { lyDo });
export const unlockUser       = (id)         => API.put(`/admin/users/${id}/unlock`);

// ── Shops (duyệt mở cửa hàng) ───────────────────────────────────────────────
export const getShops         = (params)     => API.get('/admin/shops', { params });
export const approveShop      = (id)         => API.put(`/admin/shops/${id}/approve`);
export const rejectShop       = (id, lyDo)   => API.put(`/admin/shops/${id}/reject`, { lyDo });
export const lockShop         = (id, lyDo)   => API.put(`/admin/shops/${id}/lock`, { lyDo });

// ── Reports ─────────────────────────────────────────────────────────────────
export const getReports       = (params)     => API.get('/admin/reports', { params });
export const resolveReport    = (id, data)   => API.put(`/admin/reports/${id}/resolve`, data);

// ── Disputes ────────────────────────────────────────────────────────────────
export const getDisputes      = (params)     => API.get('/disputes', { params });
export const getDisputeDetail = (id)         => API.get(`/disputes/${id}`);
export const resolveDispute   = (id, data)   => API.post(`/disputes/${id}/resolve`, data);

// ── Settlement ──────────────────────────────────────────────────────────────
export const getEligibleOrders   = (params)  => API.get('/settlements/eligible-orders', { params });
export const getSettlements      = (params)  => API.get('/settlements', { params });
export const getSettlementDetail = (id)      => API.get(`/settlements/${id}`);
export const createSettlement    = (data)    => API.post('/settlements', data);
export const executeSettlement   = (id)      => API.post(`/settlements/${id}/execute`);
export const getSystemConfig     = ()        => API.get('/settlements/config/system');
export const updateSystemConfig  = (data)    => API.put('/settlements/config/system', data);

// ── Policies ────────────────────────────────────────────────────────────────
export const getPolicies      = ()           => API.get('/admin/policies');
export const createPolicy     = (data)       => API.post('/admin/policies', data);
export const updatePolicy     = (id, data)   => API.put(`/admin/policies/${id}`, data);

// ── Notifications ────────────────────────────────────────────────────────────
export const sendNotification = (data)       => API.post('/admin/send-notification', data);
export const broadcastNotification = (data)  => API.post('/admin/broadcast-notification', data);

export default API;
