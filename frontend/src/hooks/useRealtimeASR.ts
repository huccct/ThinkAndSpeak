"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { asrService, ASRResult } from '@/lib/asr';

export interface ASRState {
  isRecording: boolean;
  isProcessing: boolean;
  result: ASRResult | null;
  error: string | null;
}

export function useASR(): ASRState & {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearResult: () => void;
  clearError: () => void;
} {
  const [state, setState] = useState<ASRState>({
    isRecording: false,
    isProcessing: false,
    result: null,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  // 开始录音
  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ 
        ...prev, 
        isRecording: true,
        error: null,
        result: null,
      }));

      // 获取音频流
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        }
      });

      streamRef.current = stream;

      // 创建MediaRecorder，优先使用支持的格式
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        const supportedTypes = ['audio/webm', 'audio/mp4', 'audio/wav', 'audio/ogg'];
        mimeType = supportedTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'audio/webm';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // 设置数据可用事件
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // 设置停止事件
      mediaRecorder.onstop = async () => {
        try {
          setState(prev => ({ ...prev, isRecording: false, isProcessing: true }));

          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          
          if (audioBlob.size === 0) {
            throw new Error('未检测到语音输入');
          }

          // 发送到ASR服务
          const result = await asrService.transcribeAudio(audioBlob);
          
          setState(prev => ({ 
            ...prev, 
            isProcessing: false, 
            result,
            error: null 
          }));

        } catch (error: any) {
          let errorMessage = error.message;
          
          if (error.message.includes('Invalid file format')) {
            errorMessage = '音频格式不支持，请尝试使用其他浏览器或检查麦克风设置';
          } else if (error.message.includes('network')) {
            errorMessage = '网络连接失败，请检查网络设置';
          } else if (error.message.includes('API key')) {
            errorMessage = 'API密钥配置错误，请联系管理员';
          }
          
          setState(prev => ({ 
            ...prev, 
            isRecording: false,
            isProcessing: false, 
            error: errorMessage 
          }));
        }

        cleanup();
      };

      // 设置错误事件
      mediaRecorder.onerror = () => {
        setState(prev => ({ 
          ...prev, 
          isRecording: false,
          isProcessing: false, 
          error: '录音过程中发生错误' 
        }));
        cleanup();
      };

      // 开始录音
      mediaRecorder.start();

    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isRecording: false,
        error: error.message 
      }));
    }
  }, []);

  // 停止录音
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // 清理资源
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
  }, []);

  // 清除结果
  const clearResult = useCallback(() => {
    setState(prev => ({ ...prev, result: null }));
  }, []);

  // 清除错误
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    ...state,
    startRecording,
    stopRecording,
    clearResult,
    clearError,
  };
}
