import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Thêm sản phẩm vào giỏ hàng
      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find(i => i.maPhienBan === item.maPhienBan);

        if (existingItem) {
          set({
            items: items.map(i =>
              i.maPhienBan === item.maPhienBan
                ? { ...i, soLuong: i.soLuong + (item.soLuong || 1) }
                : i
            )
          });
        } else {
          set({ items: [...items, { ...item, soLuong: item.soLuong || 1 }] });
        }
      },

      // Cập nhật số lượng
      updateQuantity: (maPhienBan, soLuong) => {
        if (soLuong <= 0) {
          get().removeItem(maPhienBan);
          return;
        }

        set({
          items: get().items.map(item =>
            item.maPhienBan === maPhienBan
              ? { ...item, soLuong }
              : item
          )
        });
      },

      // Xóa sản phẩm
      removeItem: (maPhienBan) => {
        set({
          items: get().items.filter(item => item.maPhienBan !== maPhienBan)
        });
      },

      // Xóa toàn bộ giỏ hàng
      clearCart: () => {
        set({ items: [] });
      },

      // Tính tổng tiền
      getTotal: () => {
        return get().items.reduce((total, item) => {
          return total + (item.giaBan * item.soLuong);
        }, 0);
      },

      // Đếm số lượng sản phẩm
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.soLuong, 0);
      }
    }),
    {
      name: 'cart-storage'
    }
  )
);

export { useCartStore };
