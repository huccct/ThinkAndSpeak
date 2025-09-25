import { apiClient } from './client';
import { mockAPI } from './mock';
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

// 环境配置
const USE_MOCK_API = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

// API 服务适配器
export class APIService {
  private useMock: boolean;

  constructor(useMock = USE_MOCK_API) {
    this.useMock = useMock;
  }

  // 文本对话
  async sendMessage(data: ChatRequest): Promise<ChatResponse> {
    if (this.useMock) {
      return mockAPI.chat(data);
    }
    return apiClient.sendMessage(data);
  }

  // 语音转文本
  async speechToText(audioBlob: Blob, language = 'zh-CN'): Promise<ASRResponse> {
    if (this.useMock) {
      // 将 Blob 转换为 base64（简化处理）
      const base64 = await this.blobToBase64(audioBlob);
      return mockAPI.asr({
        audio_data: base64,
        audio_format: audioBlob.type || 'webm',
        language,
      });
    }
    return apiClient.speechToText(audioBlob, language);
  }

  // 文本转语音
  async textToSpeech(
    text: string,
    characterId: string,
    voiceSettings?: any
  ): Promise<TTSResponse> {
    if (this.useMock) {
      return mockAPI.tts({
        text,
        character_id: characterId,
        voice_settings: voiceSettings || {
          voice_id: 'default',
          speed: 1.0,
          pitch: 1.0,
        },
      });
    }
    return apiClient.textToSpeech(text, characterId, voiceSettings);
  }

  // 获取角色列表
  async getCharacters(): Promise<CharactersResponse> {
    if (this.useMock) {
      return mockAPI.getCharacters();
    }
    return apiClient.getCharacters();
  }

  // 获取会话列表
  async getSessions(
    userId?: string,
    limit = 20,
    offset = 0
  ): Promise<SessionsResponse> {
    if (this.useMock) {
      return mockAPI.getSessions();
    }
    return apiClient.getSessions(userId, limit, offset);
  }

  // 获取会话详情
  async getSession(sessionId: string): Promise<SessionDetailResponse> {
    if (this.useMock) {
      return mockAPI.getSession(sessionId);
    }
    return apiClient.getSession(sessionId);
  }

  // 删除会话
  async deleteSession(sessionId: string): Promise<void> {
    if (this.useMock) {
      return mockAPI.deleteSession(sessionId);
    }
    return apiClient.deleteSession(sessionId);
  }

  // 获取用户设置
  async getSettings(userId?: string): Promise<SettingsResponse> {
    if (this.useMock) {
      return mockAPI.getSettings();
    }
    return apiClient.getSettings(userId);
  }

  // 更新用户设置
  async updateSettings(
    settings: Partial<UserSettings>,
    userId?: string
  ): Promise<SettingsResponse> {
    if (this.useMock) {
      return mockAPI.updateSettings(settings);
    }
    return apiClient.updateSettings(settings, userId);
  }

  // 工具方法：Blob转Base64
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // 切换API模式
  setMockMode(useMock: boolean) {
    this.useMock = useMock;
  }

  // 获取当前模式
  getMockMode(): boolean {
    return this.useMock;
  }
}

// 创建全局API服务实例
export const apiService = new APIService();

// 导出类型和客户端
export { apiClient } from './client';
export { mockAPI } from './mock';

export * from './mock';
export * from '@/lib/types';
export * from '@/lib/types';
