import { createHttpClient } from '@/lib/http';
import type { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse } from './auth.types';

// 创建不带token的HTTP客户端（用于登录/注册）
const publicHttp = createHttpClient();

export const authApi = {
  /**
   * 用户注册
   */
  register: (payload: RegisterRequest) =>
    publicHttp.post<RegisterResponse>('/api/auth/register', payload),

  /**
   * 用户登录
   */
  login: (payload: LoginRequest) =>
    publicHttp.post<LoginResponse>('/api/auth/login', payload),
};
