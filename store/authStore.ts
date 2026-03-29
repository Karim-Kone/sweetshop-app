import { create } from 'zustand';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import type { User, LoginRequest, RegisterRequest } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          set({
            user: userDoc.data() as User,
            token: await firebaseUser.getIdToken(),
            isInitialized: true,
          });
        } else {
          set({ isInitialized: true });
        }
      } else {
        set({ user: null, token: null, isInitialized: true });
      }
    });
  },

  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await signInWithEmailAndPassword(auth, data.email, data.password);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (userDoc.exists()) {
        set({
          user: userDoc.data() as User,
          token: await result.user.getIdToken(),
        });
      }
    } catch (e: any) {
      const msg = e.code === 'auth/invalid-credential'
        ? 'Email ou mot de passe incorrect'
        : 'Erreur de connexion';
      set({ error: msg });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const newUser: User = {
        id: result.user.uid,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', result.user.uid), newUser);
      set({
        user: newUser,
        token: await result.user.getIdToken(),
      });
    } catch (e: any) {
      const msg = e.code === 'auth/email-already-in-use'
        ? 'Cet email est déjà utilisé'
        : 'Erreur lors de la création du compte';
      set({ error: msg });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null, token: null, error: null });
  },

  clearError: () => set({ error: null }),
}));