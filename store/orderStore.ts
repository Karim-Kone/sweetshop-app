import { create } from 'zustand';
import {
  collection, getDocs, addDoc, updateDoc,
  doc, serverTimestamp, query, orderBy, where, onSnapshot,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import type { Order, CartItem, DeliveryType } from '@/types';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  placeOrder: (
    items: CartItem[],
    deliveryType: DeliveryType,
    deliveryAddress: string,
    customerName: string,
    customerPhone: string,
    userId: string,
  ) => Promise<void>;
  fetchOrders: (userId?: string, isOwner?: boolean) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  isLoading: false,

  placeOrder: async (items, deliveryType, deliveryAddress, customerName, customerPhone, userId) => {
    set({ isLoading: true });
    try {
      const totalAmount = items.reduce(
        (t, i) => t + i.product.price * i.quantity, 0
      ) + (deliveryType === 'DELIVERY' ? 1000 : 0);

      const orderData = {
        userId,
        customerName,
        customerPhone,
        items: items.map((i) => ({
          id: Date.now().toString() + i.product.id,
          productId: i.product.id,
          productName: i.product.name,
          quantity: i.quantity,
          unitPrice: i.product.price,
        })),
        totalAmount,
        deliveryType,
        deliveryAddress: deliveryType === 'DELIVERY' ? deliveryAddress : '',
        status: 'NEW',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);

      set((state) => ({
        orders: [{
          ...orderData,
          id: docRef.id,
          createdAt: new Date().toISOString(),
        } as Order, ...state.orders],
        isLoading: false,
      }));
    } catch (e) {
      console.error('Erreur placeOrder:', e);
      set({ isLoading: false });
    }
  },

  fetchOrders: async (userId, isOwner) => {
    set({ isLoading: true });
    try {
      let q;
      if (isOwner) {
        q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      } else {
        q = query(
          collection(db, 'orders'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
      }

      // Listener en temps réel
      onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        })) as Order[];
        set({ orders, isLoading: false });
      });

    } catch (e) {
      console.error('Erreur fetchOrders:', e);
      set({ isLoading: false });
    }
  },
  updateOrderStatus: async (orderId, status) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === orderId ? { ...o, status } : o
        ),
      }));
    } catch (e) {
      console.error('Erreur updateOrderStatus:', e);
    }
  },
}));