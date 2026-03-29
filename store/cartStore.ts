import { create } from 'zustand';
import type { CartItem, Product, DeliveryType } from '@/types';

interface CartState {
  items: CartItem[];
  deliveryType: DeliveryType;
  deliveryAddress: string;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  increaseQty: (productId: string) => void;
  decreaseQty: (productId: string) => void;
  clearCart: () => void;
  setDeliveryType: (type: DeliveryType) => void;
  setDeliveryAddress: (address: string) => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  deliveryType: 'PICKUP',
  deliveryAddress: '',

  addItem: (product) => {
    const existing = get().items.find((i) => i.product.id === product.id);
    if (existing) {
      set((state) => ({
        items: state.items.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      }));
    } else {
      set((state) => ({
        items: [...state.items, { product, quantity: 1 }],
      }));
    }
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId),
    }));
  },

  increaseQty: (productId) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.product.id === productId
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ),
    }));
  },

  decreaseQty: (productId) => {
    const item = get().items.find((i) => i.product.id === productId);
    if (item && item.quantity === 1) {
      get().removeItem(productId);
    } else {
      set((state) => ({
        items: state.items.map((i) =>
          i.product.id === productId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        ),
      }));
    }
  },

  clearCart: () => set({ items: [], deliveryAddress: '' }),

  setDeliveryType: (type) => set({ deliveryType: type }),

  setDeliveryAddress: (address) => set({ deliveryAddress: address }),

  getTotalPrice: () => {
    return get().items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },
}));