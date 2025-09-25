import type {
  ChatRequest,
  ChatResponse,
  ASRRequest,
  ASRResponse,
  TTSRequest,
  TTSResponse,
  CharactersResponse,
  SessionsResponse,
  SessionDetailResponse,
  SettingsResponse,
  UserSettings,
  Session,
  SessionDetail,
  Character,
} from '@/lib/types';

export class APIClient {
  private baseURL: string;
  private apiKey?: string;

  constructor(baseURL: string, apiKey?: string) {
    this.baseURL = baseURL.replace(/\/$/, ''); 
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // 文本对话
  async sendMessage(data: ChatRequest): Promise<ChatResponse> {
    return this.request<ChatResponse>('/api/v1/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 语音转文本
  async speechToText(audioBlob: Blob, language = 'zh-CN'): Promise<ASRResponse> {
    const audioData = await this.blobToBase64(audioBlob);
    const data: ASRRequest = {
      audio_data: audioData,
      audio_format: audioBlob.type || 'webm',
      language,
    };

    return this.request<ASRResponse>('/api/v1/asr', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 文本转语音
  async textToSpeech(
    text: string,
    characterId: string,
    voiceSettings?: any
  ): Promise<TTSResponse> {
    const data: TTSRequest = {
      text,
      character_id: characterId,
      voice_settings: voiceSettings || {
        voice_id: 'default',
        speed: 1.0,
        pitch: 1.0,
      },
    };

    return this.request<TTSResponse>('/api/v1/tts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 获取角色列表
  async getCharacters(): Promise<CharactersResponse> {
    return this.request<CharactersResponse>('/api/v1/characters');
  }

  // 获取会话列表
  async getSessions(
    userId?: string,
    limit = 20,
    offset = 0
  ): Promise<SessionsResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (userId) {
      params.append('user_id', userId);
    }

    return this.request<SessionsResponse>(`/api/v1/sessions?${params}`);
  }

  // 获取会话详情
  async getSession(sessionId: string): Promise<SessionDetailResponse> {
    return this.request<SessionDetailResponse>(`/api/v1/sessions/${sessionId}`);
  }

  // 删除会话
  async deleteSession(sessionId: string): Promise<void> {
    await this.request<void>(`/api/v1/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // 获取用户设置
  async getSettings(userId?: string): Promise<SettingsResponse> {
    const params = userId ? `?user_id=${userId}` : '';
    return this.request<SettingsResponse>(`/api/v1/settings${params}`);
  }

  // 更新用户设置
  async updateSettings(
    settings: Partial<UserSettings>,
    userId?: string
  ): Promise<SettingsResponse> {
    const data = userId ? { user_id: userId, ...settings } : settings;
    
    return this.request<SettingsResponse>('/api/v1/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // 工具方法：Blob转Base64
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // 移除data:audio/...;base64,前缀
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // 工具方法：Base64转Blob
  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }
}

// 创建默认API客户端实例
export const apiClient = new APIClient(
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
  process.env.NEXT_PUBLIC_API_KEY
);
