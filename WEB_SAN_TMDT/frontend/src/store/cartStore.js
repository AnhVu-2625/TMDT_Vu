import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get authorization headers from the auth store
const getHeaders = () => {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const useCartStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  // Lấy danh sách sản phẩm trong giỏ hàng từ cơ sở dữ liệu
  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/cart`, {
        headers: getHeaders()
      });
      set({ items: res.data.data || [], loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Không thể tải giỏ hàng', loading: false });
    }
  },

  // Thêm sản phẩm vào giỏ hàng trên cơ sở dữ liệu
  addItem: async (maPhienBan, soLuong = 1) => {
    set({ loading: true, error: null });
    let finalMaPhienBan = maPhienBan;
    let finalSoLuong = soLuong;

    // Support object parameters from ProductCard.jsx
    if (typeof maPhienBan === 'object' && maPhienBan !== null) {
      finalMaPhienBan = maPhienBan.maPhienBan || maPhienBan.MaPhienBan;
      finalSoLuong = maPhienBan.soLuong || maPhienBan.SoLuong || 1;
    }

    try {
      await axios.post(
        `${API_URL}/cart/add`,
        { maPhienBan: finalMaPhienBan, soLuong: finalSoLuong },
        { headers: getHeaders() }
      );
      await get().fetchCart();
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  // Cập nhật số lượng sản phẩm trong giỏ hàng trên cơ sở dữ liệu
  updateItem: async (cartItemId, soLuong) => {
    if (soLuong <= 0) {
      await get().removeItem(cartItemId);
      return;
    }
    set({ loading: true, error: null });
    try {
      await axios.put(
        `${API_URL}/cart/${cartItemId}`,
        { soLuong },
        { headers: getHeaders() }
      );
      await get().fetchCart();
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể cập nhật số lượng';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  // Xóa sản phẩm khỏi giỏ hàng trên cơ sở dữ liệu
  removeItem: async (cartItemId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${API_URL}/cart/${cartItemId}`, {
        headers: getHeaders()
      });
      await get().fetchCart();
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể xóa sản phẩm khỏi giỏ hàng';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: async () => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${API_URL}/cart`, {
        headers: getHeaders()
      });
      set({ items: [], loading: false });
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể xóa sạch giỏ hàng';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  // Tính tổng số tiền trong giỏ hàng
  getTotal: () => {
    return get().items.reduce((total, item) => {
      return total + ((item.GiaBan || 0) * (item.SoLuong || 0));
    }, 0);
  },

  // Đếm tổng số lượng sản phẩm trong giỏ hàng
  getItemCount: () => {
    return get().items.reduce((count, item) => count + (item.SoLuong || 0), 0);
  }
}));

export { useCartStore };
