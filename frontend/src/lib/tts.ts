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

// 当前使用的音色配置
export const VOICE_PRESETS = {
  current: {
    'yoZ06aMxZJJ28mfd3POQ': { name: 'Sam', gender: 'male', language: 'zh', description: '温和、亲切的男性声音' },
  }
};

// 角色音色映射 - 统一使用Sam音色
export const CHARACTER_VOICES = {
  'socrates': 'yoZ06aMxZJJ28mfd3POQ', // Sam - 温和、亲切的男音
  'harry': 'yoZ06aMxZJJ28mfd3POQ',   // Sam - 年轻、温和的男音
  'sherlock': 'yoZ06aMxZJJ28mfd3POQ', // Sam - 温和、亲切的男音
  'default': 'yoZ06aMxZJJ28mfd3POQ'   // Sam - 默认温和男音
};

export interface TTSResult {
  audioBlob: Blob;
  duration?: number;
}

class TTSService {
  private config: TTSConfig;

  constructor(config: TTSConfig) {
    this.config = {
      voiceId: 'yoZ06aMxZJJ28mfd3POQ', 
      modelId: 'eleven_multilingual_v2', 
      voiceSettings: {
        stability: 0.6,         // 降低稳定性，增加自然变化
        similarityBoost: 0.7,   // 降低相似度，增加个性化
        style: 0.4,            // 增加风格，让声音更生动
        useSpeakerBoost: true,  // 启用扬声器增强
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
   * 根据角色获取音色ID
   */
  getVoiceForCharacter(characterId: string): string {
    return CHARACTER_VOICES[characterId as keyof typeof CHARACTER_VOICES] || CHARACTER_VOICES.default;
  }

  /**
   * 获取音色预设信息
   */
  getVoicePreset(voiceId: string) {
    for (const category of Object.values(VOICE_PRESETS)) {
      if (category[voiceId as keyof typeof category]) {
        return category[voiceId as keyof typeof category];
      }
    }
    return null;
  }

  /**
   * 预处理文本，让语音更自然
   */
  private preprocessText(text: string): string {
    // 移除多余的标点符号
    let processed = text.trim()
      .replace(/[。，！？；：""''（）【】]/g, ' ') // 替换中文标点为空格
      .replace(/[.,!?;:"'()\[\]]/g, ' ') // 替换英文标点为空格
      .replace(/\s+/g, ' ') // 合并多个空格
      .trim();

    // 添加自然的停顿
    processed = processed
      .replace(/。/g, '. ') // 句号后添加停顿
      .replace(/，/g, ', ') // 逗号后添加停顿
      .replace(/！/g, '! ') // 感叹号后添加停顿
      .replace(/？/g, '? '); // 问号后添加停顿

    return processed;
  }

  /**
   * 文本转语音
   */
  async synthesizeSpeech(text: string, voiceId?: string, characterId?: string): Promise<TTSResult> {
    try {
      if (!text.trim()) {
        throw new Error('文本内容不能为空');
      }

      // 优先使用传入的voiceId，然后是角色对应的音色，最后是默认音色
      const selectedVoiceId = voiceId || (characterId ? this.getVoiceForCharacter(characterId) : this.config.voiceId);
      
      // 预处理文本，让语音更自然
      const preprocessedText = this.preprocessText(text);
      
      // 添加更自然的语音控制 - 使用SSML标签优化语速和语调
      const processedText = `<speak><prosody rate="0.85" pitch="+5%" volume="loud">${preprocessedText}</prosody></speak>`;
      
      const requestBody = {
        text: processedText,
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

  /**
   * 获取自然语音配置
   */
  getNaturalVoiceSettings() {
    return {
      stability: 0.5,         // 中等稳定性，允许自然变化
      similarityBoost: 0.6,   // 中等相似度，增加个性化
      style: 0.5,            // 中等风格，让声音更生动
      useSpeakerBoost: true,  // 启用扬声器增强
    };
  }

  /**
   * 获取专业语音配置
   */
  getProfessionalVoiceSettings() {
    return {
      stability: 0.8,         // 高稳定性，专业感
      similarityBoost: 0.9,   // 高相似度，保持一致性
      style: 0.2,            // 低风格，更正式
      useSpeakerBoost: true,  // 启用扬声器增强
    };
  }
}

// 创建默认实例
export const ttsService = new TTSService({
  apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '',
});

export default TTSService;
