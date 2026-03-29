import { create } from 'zustand';
import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import type { Product } from '@/types';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>, imageUri?: string) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  isLoading: false,

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const products = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as Product[];
      set({ products });
    } catch (e) {
      console.error('Erreur fetchProducts:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  addProduct: async (product, imageUri) => {
    try {
      let imageUrl = '';

      // Upload image sur Cloudinary si fournie
      if (imageUri) {
        const formData = new FormData();
        formData.append('file', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'product.jpg',
        } as any);
        formData.append('upload_preset', 'zahad2_preset');
        formData.append('cloud_name', 'ddg4ia4tr');

        const response = await fetch(
          'https://api.cloudinary.com/v1_1/ddg4ia4tr/image/upload',
          {
            method: 'POST',
            body: formData,
          }
        );
        const data = await response.json();
        imageUrl = data.secure_url || '';
      }

      const docRef = await addDoc(collection(db, 'products'), {
        name: product.name,
        description: product.description || '',
        price: product.price,
        stockQuantity: product.stockQuantity,
        isAvailable: product.isAvailable,
        imageUrl: imageUrl,
        createdAt: serverTimestamp(),
      });

      set((state) => ({
        products: [{
          id: docRef.id,
          name: product.name,
          description: product.description || '',
          price: product.price,
          stockQuantity: product.stockQuantity,
          isAvailable: product.isAvailable,
          imageUrl: imageUrl,
          createdAt: new Date().toISOString(),
        }, ...state.products],
      }));
    } catch (e) {
      console.error('Erreur addProduct:', e);
    }
  },

  updateProduct: async (id, updates) => {
    try {
      await updateDoc(doc(db, 'products', id), updates);
      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
      }));
    } catch (e) {
      console.error('Erreur updateProduct:', e);
    }
  },

  deleteProduct: async (id) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      }));
    } catch (e) {
      console.error('Erreur deleteProduct:', e);
    }
  },
}));