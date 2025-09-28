"use client";

import { useState, useCallback, useRef } from 'react';
import { asrService, ASRResult } from '@/lib/asr';

export interface ASRState {
  isRecording: boolean;
  isProcessing: boolean;
  result: ASRResult | null;
  error: string | null;
}

export interface ASRReturn extends ASRState {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearResult: () => void;
  clearError: () => void;
}

export function useASR(): ASRReturn {
  const [state, setState] = useState<ASRState>({
    isRecording: false,
    isProcessing: false,
    result: null,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isRecording: true, error: null }));

      const mediaRecorder = await asrService.startRecording();
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          setState(prev => ({ ...prev, isRecording: false, isProcessing: true }));

          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          if (audioBlob.size === 0) {
            throw new Error('未检测到语音输入');
          }

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
            isProcessing: false, 
            error: error.message 
          }));
        }

        // 清理stream
        if (mediaRecorderRef.current) {
          const stream = mediaRecorderRef.current.stream;
          stream.getTracks().forEach(track => track.stop());
          mediaRecorderRef.current = null;
        }
      };

      mediaRecorder.onerror = () => {
        setState(prev => ({ 
          ...prev, 
          isRecording: false, 
          isProcessing: false, 
          error: '录音过程中发生错误' 
        }));
      };

      mediaRecorder.start();

    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isRecording: false, 
        error: error.message 
      }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const clearResult = useCallback(() => {
    setState(prev => ({ ...prev, result: null }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    clearResult,
    clearError,
  };
}
