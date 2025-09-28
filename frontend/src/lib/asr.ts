/**
 * 语音识别服务
 * 使用OpenAI Whisper API进行语音转文字
 */

export interface ASRResult {
  text: string;
  confidence?: number;
  language?: string;
}

export interface ASRConfig {
  apiKey: string;
  model?: string;
  language?: string;
  temperature?: number;
}

class ASRService {
  private config: ASRConfig;

  constructor(config: ASRConfig) {
    this.config = {
      model: 'whisper-1',
      language: 'zh',
      temperature: 0.0,
      ...config,
    };
  }

  /**
   * 录制音频
   */
  async startRecording(): Promise<MediaRecorder> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      return mediaRecorder;
    } catch (error) {
      throw new Error('无法访问麦克风，请检查权限设置');
    }
  }

  /**
   * 录制音频到Blob
   */
  async recordAudio(duration: number = 5000): Promise<Blob> {
    return new Promise(async (resolve, reject) => {
      try {
        const mediaRecorder = await this.startRecording();
        const audioChunks: BlobPart[] = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          resolve(audioBlob);
          
          // 清理stream
          const stream = mediaRecorder.stream;
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.onerror = (error) => {
          reject(new Error('录音过程中发生错误'));
        };

        // 开始录制
        mediaRecorder.start();
        
        // 设置录制时长
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        }, duration);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 发送音频到Whisper API进行转写
   */
  async transcribeAudio(audioBlob: Blob): Promise<ASRResult> {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', this.config.model!);
      formData.append('language', this.config.language!);
      formData.append('temperature', this.config.temperature!.toString());

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        text: result.text || '',
        language: result.language,
      };

    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('网络连接失败，请检查网络设置');
      }
      throw new Error(error.message || '语音识别失败');
    }
  }

  /**
   * 完整的语音识别流程
   */
  async recognizeSpeech(duration: number = 5000): Promise<ASRResult> {
    try {
      // 1. 录制音频
      const audioBlob = await this.recordAudio(duration);
      
      // 2. 检查音频大小
      if (audioBlob.size === 0) {
        throw new Error('未检测到语音输入');
      }

      // 3. 发送到Whisper转写
      const result = await this.transcribeAudio(audioBlob);
      
      return result;
    } catch (error: any) {
      throw error;
    }
  }
}

export const asrService = new ASRService({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
});

export default ASRService;
