import { create } from 'zustand';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useProductStore = create((set, get) => ({
  products: [],
  product: null,
  categories: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },

  // Lấy danh sách sản phẩm
  fetchProducts: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/products`, { params });
      set({
        products: response.data.data.products,
        pagination: response.data.data.pagination,
        loading: false
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi tải sản phẩm';
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  // Lấy chi tiết sản phẩm
  fetchProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/products/${id}`);
      set({
        product: response.data.data,
        loading: false
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi tải chi tiết sản phẩm';
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  // Lấy danh mục
  fetchCategories: async () => {
    try {
      const response = await axios.get(`${API_URL}/products/categories/all`);
      set({ categories: response.data.data });
      return response.data;
    } catch (error) {
      console.error('Lỗi tải danh mục:', error);
    }
  },

  // Tìm kiếm sản phẩm
  searchProducts: async (searchQuery, filters = {}) => {
    return get().fetchProducts({ search: searchQuery, ...filters });
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Clear product detail
  clearProduct: () => set({ product: null })
}));

export { useProductStore };
