"use client";

import { useState, useCallback, useRef } from 'react';
import { ttsService, TTSResult } from '@/lib/tts';

export interface TTSState {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  currentText: string | null;
}

export interface TTSReturn extends TTSState {
  speak: (text: string, voiceId?: string) => Promise<void>;
  stop: () => void;
  clearError: () => void;
}

export function useTTS(): TTSReturn {
  const [state, setState] = useState<TTSState>({
    isPlaying: false,
    isLoading: false,
    error: null,
    currentText: null,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentRequestRef = useRef<AbortController | null>(null);

  const speak = useCallback(async (text: string, voiceId?: string) => {
    try {
      // 如果正在播放，先停止
      if (state.isPlaying) {
        stop();
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null, 
        currentText: text 
      }));

      // 创建取消控制器
      currentRequestRef.current = new AbortController();

      const result = await ttsService.synthesizeSpeech(text, voiceId);
      
      // 检查是否被取消
      if (currentRequestRef.current?.signal.aborted) {
        return;
      }

      setState(prev => ({ ...prev, isLoading: false, isPlaying: true }));

      // 播放音频
      const audioUrl = URL.createObjectURL(result.audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // 音频播放完成
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setState(prev => ({ 
          ...prev, 
          isPlaying: false, 
          currentText: null 
        }));
        audioRef.current = null;
      };

      // 音频播放错误
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        setState(prev => ({ 
          ...prev, 
          isPlaying: false, 
          error: '音频播放失败',
          currentText: null 
        }));
        audioRef.current = null;
      };

      await audio.play();

    } catch (error: any) {
      // 如果是取消操作，不显示错误
      if (error.name === 'AbortError') {
        return;
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isPlaying: false,
        error: error.message,
        currentText: null 
      }));
    }
  }, [state.isPlaying]);

  const stop = useCallback(() => {
    // 取消当前请求
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
      currentRequestRef.current = null;
    }

    // 停止音频播放
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setState(prev => ({ 
      ...prev, 
      isPlaying: false, 
      isLoading: false,
      currentText: null 
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    speak,
    stop,
    clearError,
  };
}
