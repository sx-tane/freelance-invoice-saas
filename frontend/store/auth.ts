import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { User, AuthState } from '@/types';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  isLoading: boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user, token } = response.data;
          
          Cookies.set('token', token, { expires: 7 });
          set({ user, token, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error) {
          return false;
        }
      },

      register: async (firstName: string, lastName: string, email: string, password: string) => {
        try {
          const response = await api.post('/auth/register', { firstName, lastName, email, password });
          const { user, access_token } = response.data;
          
          Cookies.set('token', access_token, { expires: 7 });
          set({ user, token: access_token, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error) {
          return false;
        }
      },

      logout: () => {
        Cookies.remove('token');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      },

      checkAuth: async () => {
        const token = Cookies.get('token');
        if (!token) {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
          return;
        }

        try {
          const response = await api.get('/auth/me');
          set({ user: response.data, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          Cookies.remove('token');
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...userData } });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);