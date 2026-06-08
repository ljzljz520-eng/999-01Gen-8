import { create } from 'zustand';
import api from '../utils/api';
import type { User, UserRole, LoginRequest, LoginResponse } from '../../shared/types.js';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (request: LoginRequest) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  sendSms: (phone: string) => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token') !== null,
  loading: false,
  error: null,

  login: async (request: LoginRequest) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post<LoginResponse>('/auth/login', request);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, loading: false });
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.error || '登录失败', loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      try {
        const response = await api.get<User>('/auth/me');
        const user = response.data;
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  },

  sendSms: async (phone: string) => {
    const response = await api.post('/auth/send-sms', { phone });
    return response.data;
  },

  clearError: () => set({ error: null }),
}));

export function getUserRole(): UserRole | null {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr) as User;
    return user.role;
  }
  return null;
}
