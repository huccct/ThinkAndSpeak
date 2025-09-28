"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { asrService, ASRResult } from '@/lib/asr';

export interface RealtimeASRState {
  isRecording: boolean;
  isProcessing: boolean;
  isListening: boolean; // 是否正在监听（录音但不一定处理）
  result: ASRResult | null;
  error: string | null;
  audioLevel: number; // 音频音量级别 (0-1)
  speechDetected: boolean; // 是否检测到语音
}

export interface RealtimeASROptions {
  silenceThreshold: number; // 静音阈值（毫秒）
  speechThreshold: number; // 语音检测阈值
  chunkSize: number; // 音频块大小（毫秒）
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onAudioLevelChange?: (level: number) => void;
}

export function useRealtimeASR(options: Partial<RealtimeASROptions> = {}): RealtimeASRState & {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearResult: () => void;
  clearError: () => void;
} {
  const {
    silenceThreshold = 1500,
    speechThreshold = 0.01,
    chunkSize = 1000,
    onSpeechStart,
    onSpeechEnd,
    onAudioLevelChange,
  } = options;

  const [state, setState] = useState<RealtimeASRState>({
    isRecording: false,
    isProcessing: false,
    isListening: false,
    result: null,
    error: null,
    audioLevel: 0,
    speechDetected: false,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speechStartTimeRef = useRef<number | null>(null);
  const lastSpeechTimeRef = useRef<number>(0);

  // 音频分析
  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || !state.isRecording) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // 计算平均音量
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const average = sum / bufferLength / 255; // 归一化到 0-1

    setState(prev => ({ ...prev, audioLevel: average }));

    // 检测语音开始
    const isSpeech = average > speechThreshold;
    const now = Date.now();

    if (isSpeech && !state.speechDetected) {
      setState(prev => ({ ...prev, speechDetected: true }));
      speechStartTimeRef.current = now;
      lastSpeechTimeRef.current = now;
      onSpeechStart?.();
    } else if (isSpeech && state.speechDetected) {
      lastSpeechTimeRef.current = now;
    } else if (!isSpeech && state.speechDetected) {
      // 检测到静音，启动静音计时器
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      
      silenceTimerRef.current = setTimeout(() => {
        if (Date.now() - lastSpeechTimeRef.current >= silenceThreshold) {
          setState(prev => ({ ...prev, speechDetected: false }));
          onSpeechEnd?.();
          // 自动停止录音
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
        }
      }, silenceThreshold);
    }

    // 继续分析
    if (state.isRecording) {
      requestAnimationFrame(analyzeAudio);
    }
  }, [state.isRecording, state.speechDetected, speechThreshold, silenceThreshold, onSpeechStart, onSpeechEnd]);

  // 开始录音
  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ 
        ...prev, 
        isRecording: true, 
        isListening: true,
        error: null,
        result: null,
        audioLevel: 0,
        speechDetected: false,
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

      // 创建音频上下文用于分析
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      
      source.connect(analyser);
      analyserRef.current = analyser;

      // 创建MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

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
          setState(prev => ({ 
            ...prev, 
            isRecording: false, 
            isListening: false,
            isProcessing: true 
          }));

          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
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
          setState(prev => ({ 
            ...prev, 
            isRecording: false, 
            isListening: false,
            isProcessing: false, 
            error: error.message 
          }));
        }

        // 清理资源
        cleanup();
      };

      // 设置错误事件
      mediaRecorder.onerror = () => {
        setState(prev => ({ 
          ...prev, 
          isRecording: false, 
          isListening: false,
          isProcessing: false, 
          error: '录音过程中发生错误' 
        }));
        cleanup();
      };

      // 开始录音
      mediaRecorder.start(chunkSize);
      
      // 开始音频分析
      analyzeAudio();

    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isRecording: false, 
        isListening: false,
        error: error.message 
      }));
    }
  }, [chunkSize, analyzeAudio]);

  // 停止录音
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // 清理资源
  const cleanup = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
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
