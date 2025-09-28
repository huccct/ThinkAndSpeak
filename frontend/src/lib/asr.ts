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
   * 转换音频格式为支持的格式
   */
  private async convertAudioFormat(audioBlob: Blob): Promise<Blob> {
    try {
      // 检查是否已经是支持的格式
      if (audioBlob.type === 'audio/wav' || audioBlob.type === 'audio/mp3' || audioBlob.type === 'audio/mpeg') {
        return audioBlob;
      }

      // 使用Web Audio API转换格式
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // 转换为WAV格式
      const wavBlob = await this.audioBufferToWav(audioBuffer);
      return wavBlob;
    } catch (error) {
      console.warn('音频格式转换失败，使用原始格式:', error);
      return audioBlob;
    }
  }

  /**
   * 将AudioBuffer转换为WAV格式
   */
  private async audioBufferToWav(audioBuffer: AudioBuffer): Promise<Blob> {
    const length = audioBuffer.length;
    const sampleRate = audioBuffer.sampleRate;
    const numberOfChannels = audioBuffer.numberOfChannels;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);

    // WAV文件头
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);

    // 写入音频数据
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  /**
   * 发送音频到Whisper API进行转写
   */
  async transcribeAudio(audioBlob: Blob): Promise<ASRResult> {
    try {
      // 转换音频格式
      const convertedBlob = await this.convertAudioFormat(audioBlob);
      
      const formData = new FormData();
      formData.append('file', convertedBlob, 'audio.wav');
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

/**
 * Web Speech API 备用方案
 */
class WebSpeechASRService {
  private recognition: any;

  constructor() {
    if (typeof window !== 'undefined') {
      this.recognition = new (window as any).webkitSpeechRecognition() || new (window as any).SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'zh-CN';
    }
  }

  async transcribeAudio(audioBlob: Blob): Promise<ASRResult> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('浏览器不支持语音识别'));
        return;
      }

      this.recognition.onresult = (event: any) => {
        const result = event.results[0][0];
        resolve({
          text: result.transcript,
          confidence: result.confidence,
          language: 'zh-CN'
        });
      };

      this.recognition.onerror = (event: any) => {
        reject(new Error(`语音识别错误: ${event.error}`));
      };

      this.recognition.start();
    });
  }
}

// 创建服务实例，优先使用OpenAI，降级到Web Speech API
export const asrService = process.env.NEXT_PUBLIC_OPENAI_API_KEY 
  ? new ASRService({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    })
  : new WebSpeechASRService();

export default ASRService;
