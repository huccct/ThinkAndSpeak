import { create } from 'zustand';
import { authApi } from './auth.api';
import type { RegisterRequest, LoginRequest } from './auth.types';

type User = {
  id: string;
  username: string;
  email: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  error?: string;
};

type AuthActions = {
  register: (username: string, password: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
};

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  error: undefined,

  register: async (username: string, password: string) => {
    set({ loading: true, error: undefined });
    try {
      const payload: RegisterRequest = { username, password };
      const res = await authApi.register(payload);
      if (res.code !== 0) {
        throw new Error(res.message || '注册失败');
      }
    } catch (error: any) {
      set({ error: error?.message || '注册失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  login: async (username: string, password: string) => {
    set({ loading: true, error: undefined });
    try {
      const payload: LoginRequest = { username, password };
      const res = await authApi.login(payload);
      if (res.code !== 0) {
        throw new Error(res.message || '登录失败');
      }
      
      if (!res.data) {
        throw new Error('登录响应数据缺失');
      }
      
      set({ 
        user: { id: '', username, email: '' }, // 简化用户信息，因为后端只返回token
        token: res.data.token,
        error: undefined 
      });
    } catch (error: any) {
      set({ error: error?.message || '登录失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    set({ user: null, token: null, error: undefined });
  },

  clearError: () => {
    set({ error: undefined });
  },
}));

// selectors
export const useAuthUser = () => useAuthStore(s => s.user);
export const useAuthToken = () => useAuthStore(s => s.token);
export const useAuthLoading = () => useAuthStore(s => s.loading);
export const useAuthError = () => useAuthStore(s => s.error);

// 分离的action选择器，避免返回新对象
export const useAuthRegister = () => useAuthStore(s => s.register);
export const useAuthLogin = () => useAuthStore(s => s.login);
export const useAuthLogout = () => useAuthStore(s => s.logout);
export const useAuthClearError = () => useAuthStore(s => s.clearError);
