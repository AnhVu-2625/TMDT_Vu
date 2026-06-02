import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper: kiểm tra admin role (support nhiều format DB)
const ADMIN_ROLES = ['QUAN_TRI_VIEN', 'QuanTriVien', 'Admin', 'admin'];
const isAdminRole = (role) => ADMIN_ROLES.includes(role);

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      redirectPath: null,

      // Helpers kiểm tra vai trò (theo schema DB)
      // Admin: VaiTro = 'QUAN_TRI_VIEN'
      // Seller: có cửa hàng (user.shop != null) - không phụ thuộc VaiTro
      isAdmin: () => get().user?.vaiTro === 'QUAN_TRI_VIEN',
      isSeller: () => !!(get().user?.shop?.MaCuaHang),


      // Đăng ký
      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/auth/register`, userData);
          set({ loading: false });
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Đăng ký thất bại';
          set({ loading: false, error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      // Xác thực OTP
      verifyOTP: async (email, otp) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
          set({ loading: false });
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Xác thực OTP thất bại';
          set({ loading: false, error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      // Gửi lại OTP
      resendOTP: async (email) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/auth/resend-otp`, { email });
          set({ loading: false });
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Gửi lại OTP thất bại';
          set({ loading: false, error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      // Đăng nhập
      login: async (emailOrPhone, matKhau) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/auth/login`, {
            emailOrPhone,
            matKhau
          });
          
          const { token, user } = response.data.data;
          
          // Tính redirect dựa theo schema:
          // - QUAN_TRI_VIEN → /admin/dashboard
          // - NGUOI_DUNG + có shop → /seller/dashboard
          // - NGUOI_DUNG + không shop → / (trang chủ)
          let redirectPath = '/';
          if (isAdminRole(user.vaiTro)) {
            redirectPath = '/admin/dashboard';
          } else if (user.shop && user.shop.TrangThai === 'CHO_DUYET') {
            redirectPath = '/seller/pending';
          } else if (user.shop && user.shop.MaCuaHang && user.shop.TrangThai === 'HOAT_DONG') {
            redirectPath = '/seller/dashboard';
          }

          // Lưu token vào axios defaults
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
            error: null,
            redirectPath,
          });
          
          return { ...response.data, redirectPath };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại';
          set({ loading: false, error: errorMessage });
          throw new Error(errorMessage);
        }
      },


      // Đăng xuất
      logout: () => {
        delete axios.defaults.headers.common['Authorization'];
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
      },

      // Cập nhật thông tin người dùng
      updateUser: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.put(`${API_URL}/users/profile`, userData, {
            headers: {
              Authorization: `Bearer ${get().token}`
            }
          });
          
          set({
            user: { ...get().user, ...(response.data?.data || userData) },
            loading: false
          });
          
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Cập nhật thất bại';
          set({ loading: false, error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      // Quên mật khẩu
      forgotPassword: async (email) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
          set({ loading: false });
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Gửi yêu cầu thất bại';
          set({ loading: false, error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      // Đặt lại mật khẩu
      resetPassword: async (email, otp, matKhauMoi) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/auth/reset-password`, {
            email,
            otp,
            matKhauMoi
          });
          set({ loading: false });
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Đặt lại mật khẩu thất bại';
          set({ loading: false, error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      // Khởi tạo auth từ localStorage
      initAuth: () => {
        const token = get().token;
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      },

      // Clear error
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        redirectPath: state.redirectPath,
      })
    }
  )
);

// Khởi tạo auth khi app load
useAuthStore.getState().initAuth();

export { useAuthStore };
