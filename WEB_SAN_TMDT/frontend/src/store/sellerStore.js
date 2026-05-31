import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const useSellerStore = create((set, get) => ({
  shop: null,
  products: [],
  orders: [],
  stats: null,
  loading: false,
  error: null,

  // ─── Shop Registration ───
  registerShop: async (formData) => {
    set({ loading: true, error: null });
    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
      const res = await axios.post(`${API_URL}/sellers/register`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      set({ loading: false });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng ký shop thất bại';
      set({ loading: false, error: msg });
      throw new Error(msg);
    }
  },

  saveDraft: async (formData) => {
    set({ loading: true, error: null });
    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
      const res = await axios.put(`${API_URL}/sellers/register/draft`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      set({ loading: false });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Lưu nháp thất bại';
      set({ loading: false, error: msg });
      throw new Error(msg);
    }
  },

  // ─── Shop Info ───
  fetchMyShop: async () => {
    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
      const res = await axios.get(`${API_URL}/sellers/my-shop`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ shop: res.data.data });
      return res.data.data;
    } catch (err) {
      console.error('fetchMyShop error:', err);
      return null;
    }
  },

  // ─── Products ───
  fetchMyProducts: async () => {
    set({ loading: true });
    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
      const res = await axios.get(`${API_URL}/sellers/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ products: res.data.data, loading: false });
    } catch (err) {
      set({ loading: false });
      console.error('fetchMyProducts error:', err);
    }
  },

  createProduct: async (data) => {
    const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
    const res = await axios.post(`${API_URL}/products`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  // ─── Orders ───
  fetchMyOrders: async () => {
    set({ loading: true });
    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
      const res = await axios.get(`${API_URL}/sellers/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ orders: res.data.data, loading: false });
    } catch (err) {
      set({ loading: false });
      console.error('fetchMyOrders error:', err);
    }
  },

  updateOrderStatus: async (orderId, trangThai) => {
    const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
    const res = await axios.put(`${API_URL}/sellers/orders/${orderId}/status`, { trangThai }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  // ─── Stats ───
  fetchStats: async () => {
    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
      const res = await axios.get(`${API_URL}/sellers/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ stats: res.data.data });
    } catch (err) {
      console.error('fetchStats error:', err);
    }
  },

  clearError: () => set({ error: null })
}));

export { useSellerStore };
