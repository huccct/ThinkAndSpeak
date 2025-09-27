
export type ParseMode = 'json' | 'text' | 'blob' | 'arrayBuffer';

export class HttpError extends Error {
  status: number;
  statusText: string;
  body?: unknown;
  url?: string;
  constructor(status: number, statusText: string, message?: string, body?: unknown, url?: string) {
    super(message || `${status} ${statusText}`);
    this.name = 'HttpError';
    this.status = status;
    this.statusText = statusText;
    this.body = body;
    this.url = url;
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  timeoutMs?: number;
  parse?: ParseMode; 
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown; 
}

export interface HttpClientOptions {
  baseURL?: string; // default: NEXT_PUBLIC_API_BASE_URL || ''
  defaultHeaders?: Record<string, string>;
  timeoutMs?: number;
  getToken?: () => string | null; // 动态获取token的函数
}

function buildURL(baseURL: string, path: string, query?: RequestOptions['query']) {
  const url = new URL(path, baseURL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost'));
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function parseResponse(res: Response, mode: ParseMode = 'json') {
  if (mode === 'text') return res.text();
  if (mode === 'blob') return res.blob();
  if (mode === 'arrayBuffer') return res.arrayBuffer();
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

export function createHttpClient(opts: HttpClientOptions = {}) {
  const baseURL = opts.baseURL ?? '';
  const defaultTimeout = opts.timeoutMs ?? 30000;

  async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? defaultTimeout);

    try {
      // 动态获取token
      const token = opts.getToken?.();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
        ...(opts.defaultHeaders ?? {}),
        ...(options.headers as Record<string, string>),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const url = buildURL(baseURL, path, options.query);
      const { timeoutMs: _timeoutMs, parse: _parse, query: _query, body: customBody, ...rest } = options as any;
      const init: RequestInit = {
        method: options.method || 'GET',
        ...(rest as RequestInit),
        headers,
        signal: controller.signal,
      };

      if (customBody !== undefined) {
        if (customBody instanceof FormData) {
          delete (init.headers as Record<string, string>)['Content-Type'];
          init.body = customBody as any;
        } else if (typeof customBody === 'string' || customBody instanceof Blob) {
          init.body = customBody as any;
        } else {
          init.body = JSON.stringify(customBody);
        }
      }

      const res = await fetch(url, init);
      const parseMode = options.parse ?? 'json';
      const noBody = res.status === 204 || res.status === 205 || init.method === 'HEAD';
      const payload = noBody ? null : await parseResponse(res, parseMode);

      if (!res.ok) {
        throw new HttpError(
          res.status,
          res.statusText,
          typeof payload === 'string' ? payload : undefined,
          payload,
          url
        );
      }

      return payload as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    request,
    get: <T = unknown>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
    post: <T = unknown>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, { ...options, method: 'POST', body }),
    put: <T = unknown>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, { ...options, method: 'PUT', body }),
    patch: <T = unknown>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, { ...options, method: 'PATCH', body }),
    delete: <T = unknown>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'DELETE' }),
  };
}

export const http = createHttpClient();


