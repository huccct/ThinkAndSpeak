/**
 * 文本转语音服务
 * 使用ElevenLabs API进行语音合成
 */

export interface TTSConfig {
  apiKey: string;
  voiceId?: string;
  modelId?: string;
  voiceSettings?: {
    stability: number;
    similarityBoost: number;
    style?: number;
    useSpeakerBoost?: boolean;
  };
}

export interface TTSResult {
  audioBlob: Blob;
  duration?: number;
}

class TTSService {
  private config: TTSConfig;

  constructor(config: TTSConfig) {
    this.config = {
      voiceId: '21m00Tcm4TlvDq8ikWAM', // 默认女性声音
      modelId: 'eleven_monolingual_v1',
      voiceSettings: {
        stability: 0.5,
        similarityBoost: 0.5,
        useSpeakerBoost: true,
      },
      ...config,
    };
  }

  /**
   * 获取可用的语音列表
   */
  async getVoices(): Promise<any[]> {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': this.config.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`获取语音列表失败: ${response.status}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error: any) {
      throw new Error(`获取语音列表失败: ${error.message}`);
    }
  }

  /**
   * 文本转语音
   */
  async synthesizeSpeech(text: string, voiceId?: string): Promise<TTSResult> {
    try {
      if (!text.trim()) {
        throw new Error('文本内容不能为空');
      }

      const selectedVoiceId = voiceId || this.config.voiceId;
      
      const requestBody = {
        text: text.trim(),
        model_id: this.config.modelId,
        voice_settings: this.config.voiceSettings,
      };

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.config.apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail?.message || `TTS合成失败: ${response.status}`);
      }

      const audioBlob = await response.blob();
      
      if (audioBlob.size === 0) {
        throw new Error('生成的音频文件为空');
      }

      return {
        audioBlob,
      };

    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('网络连接失败，请检查网络设置');
      }
      throw new Error(error.message || '语音合成失败');
    }
  }

  /**
   * 播放音频
   */
  async playAudio(audioBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        
        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          reject(new Error('音频播放失败'));
        };
        
        audio.play().catch((error) => {
          URL.revokeObjectURL(audioUrl);
          reject(new Error(`无法播放音频: ${error.message}`));
        });
        
      } catch (error: any) {
        reject(new Error(`音频播放失败: ${error.message}`));
      }
    });
  }

  /**
   * 完整的语音合成和播放流程
   */
  async speak(text: string, voiceId?: string): Promise<void> {
    try {
      const result = await this.synthesizeSpeech(text, voiceId);
      await this.playAudio(result.audioBlob);
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<TTSConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// 创建默认实例
export const ttsService = new TTSService({
  apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '',
});

export default TTSService;
