/**
 * 全局token管理工具
 */

const TOKEN_KEY = 'think-speak-token';

/**
 * 从localStorage获取token
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get token from localStorage:', error);
    return null;
  }
}

/**
 * 设置token到localStorage
 */
export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to set token to localStorage:', error);
  }
}

/**
 * 清除localStorage中的token
 */
export function clearStoredToken(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to clear token from localStorage:', error);
  }
}
