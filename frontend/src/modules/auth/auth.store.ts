import { create } from 'zustand';
import { authApi } from './auth.api';
import type { RegisterRequest, LoginRequest } from './auth.types';
import { useChatStore } from '../chat/chat.store';
import { useCharactersStore } from '../characters/characters.store';

// localStorage keys
const TOKEN_KEY = 'think-speak-token';
const USER_KEY = 'think-speak-user';

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
  getUserAvatar: (username: string) => string;
  initializeAuth: () => void;
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
      
      const user = { id: '', username, email: '' };
      
      // 保存到localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, res.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
      
      set({ 
        user,
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
    // 清除localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      
      // 清除所有会话相关的localStorage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('conversation_')) {
          localStorage.removeItem(key);
        }
      });
    }
    
    // 清除其他store的状态
    useChatStore.getState().clearAllConversations();
    useCharactersStore.getState().clear();
    
    set({ user: null, token: null, error: undefined });
  },

  getUserAvatar: (username: string) => {
    return username.charAt(0).toUpperCase();
  },

  clearError: () => {
    set({ error: undefined });
  },

  initializeAuth: () => {
    if (typeof window === 'undefined') return;
    
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ user, token });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      // 清除损坏的数据
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
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
export const useAuthGetUserAvatar = () => useAuthStore(s => s.getUserAvatar);
export const useAuthInitializeAuth = () => useAuthStore(s => s.initializeAuth);
