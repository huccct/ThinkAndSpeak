"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRealtimeASR } from './useRealtimeASR';
import { useTTS } from './useTTS';

export interface VoiceConversationState {
  isActive: boolean; // 是否处于语音对话模式
  isListening: boolean; // 是否正在监听
  isProcessing: boolean; // 是否正在处理
  isSpeaking: boolean; // AI是否正在说话
  currentMessage: string | null; // 当前识别的消息
  lastRequestId: string | null; // 最后一次请求ID，用于去重
  audioLevel: number; // 音频音量级别 (0-1)
  speechDetected: boolean; // 是否检测到语音
}

export interface VoiceConversationOptions {
  autoSendThreshold: number; // 自动发送阈值（毫秒）
  silenceThreshold: number; // 静音阈值（毫秒）
  minMessageLength: number; // 最小消息长度
  onMessageSent?: (message: string) => void; // 消息发送回调
  onReplyReceived?: (reply: string) => void; // 回复接收回调
  sendMessageApi?: (message: string) => Promise<string>; // 发送消息的API函数
  conversationId?: string; // 会话ID
  characterName?: string; // 角色名称
}

export function useVoiceConversation(options: Partial<VoiceConversationOptions> = {}) {
  const {
    autoSendThreshold = 2000,
    silenceThreshold = 1500,
    minMessageLength = 3,
    onMessageSent,
    onReplyReceived,
    sendMessageApi,
    conversationId,
    characterName
  } = options;

  const [state, setState] = useState<VoiceConversationState>({
    isActive: false,
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    currentMessage: null,
    lastRequestId: null,
    audioLevel: 0,
    speechDetected: false,
  });

  // 使用实时ASR和TTS hooks
  const asr = useRealtimeASR({
    silenceThreshold,
    speechThreshold: 0.01,
    chunkSize: 1000,
    onSpeechStart: () => {
      setState(prev => ({ ...prev, speechDetected: true }));
    },
    onSpeechEnd: () => {
      setState(prev => ({ ...prev, speechDetected: false }));
    },
    onAudioLevelChange: (level) => {
      setState(prev => ({ ...prev, audioLevel: level }));
    },
  });
  const tts = useTTS();

  // 定时器引用
  const autoSendTimerRef = useRef<NodeJS.Timeout | null>(null);
  const requestIdRef = useRef<string>(generateRequestId());

  // 生成唯一请求ID
  function generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 清除所有定时器
  const clearAllTimers = useCallback(() => {
    if (autoSendTimerRef.current) {
      clearTimeout(autoSendTimerRef.current);
      autoSendTimerRef.current = null;
    }
  }, []);

  // 开始语音对话
  const startConversation = useCallback(async () => {
    if (state.isActive) return;

    try {
      setState(prev => ({ ...prev, isActive: true }));
      await asr.startRecording();
    } catch (error) {
      console.error('启动语音对话失败:', error);
      setState(prev => ({ ...prev, isActive: false }));
    }
  }, [state.isActive, asr]);

  // 停止语音对话
  const stopConversation = useCallback(() => {
    setState(prev => ({ ...prev, isActive: false }));
    clearAllTimers();
    
    if (asr.isRecording) {
      asr.stopRecording();
    }
    if (tts.isPlaying) {
      tts.stop();
    }
  }, [asr, tts, clearAllTimers]);

  // 处理语音识别结果
  const handleASRResult = useCallback(async (text: string) => {
    if (!text.trim() || text.length < minMessageLength) {
      return;
    }

    setState(prev => ({ ...prev, currentMessage: text }));
    
    // 清除之前的定时器
    clearAllTimers();

    // 设置自动发送定时器
    autoSendTimerRef.current = setTimeout(async () => {
      await sendMessage(text);
    }, autoSendThreshold);

  }, [minMessageLength, autoSendThreshold, clearAllTimers]);

  // 发送消息并获取回复
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || state.isProcessing) return;

    const currentRequestId = generateRequestId();
    requestIdRef.current = currentRequestId;

    setState(prev => ({ 
      ...prev, 
      isProcessing: true,
      currentMessage: null,
      lastRequestId: currentRequestId
    }));

    try {
      // 调用消息发送回调
      onMessageSent?.(message);

      let reply: string;
      
      if (sendMessageApi) {
        try {
          // 使用提供的API函数
          reply = await sendMessageApi(message);
        } catch (error: any) {
          console.error('发送消息API失败:', error);
          // 如果API调用失败，返回友好的错误信息
          reply = '抱歉，现在无法连接到服务器，请稍后再试。';
        }
      } else {
        // 模拟回复（用于测试）
        reply = await simulateAIResponse(message);
      }
      
      // 检查请求是否仍然有效（没有被新的请求覆盖）
      if (requestIdRef.current === currentRequestId) {
        setState(prev => ({ ...prev, isProcessing: false }));
        
        // 播放AI回复
        if (reply) {
          onReplyReceived?.(reply);
          await tts.speak(reply);
          setState(prev => ({ ...prev, isSpeaking: true }));
        }
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [state.isProcessing, onMessageSent, onReplyReceived, tts, sendMessageApi]);

  // 模拟AI回复（实际使用时需要替换为真实的API调用）
  const simulateAIResponse = async (message: string): Promise<string> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // 简单的回复逻辑
    if (message.includes('你好') || message.includes('hello')) {
      return '你好！很高兴与你对话。';
    } else if (message.includes('再见') || message.includes('bye')) {
      return '再见！期待下次与你交流。';
    } else {
      return `我听到了你说："${message}"。这是一个很有趣的话题，请告诉我更多。`;
    }
  };

  // 监听ASR结果变化
  useEffect(() => {
    if (asr.result?.text && state.isActive) {
      handleASRResult(asr.result.text);
      asr.clearResult();
    }
  }, [asr.result, state.isActive, handleASRResult, asr]);

  // 监听ASR录音状态
  useEffect(() => {
    if (state.isActive) {
      setState(prev => ({ 
        ...prev, 
        isListening: asr.isRecording || asr.isListening,
        isProcessing: asr.isProcessing 
      }));
    }
  }, [asr.isRecording, asr.isListening, asr.isProcessing, state.isActive]);

  // 监听TTS播放状态
  useEffect(() => {
    setState(prev => ({ ...prev, isSpeaking: tts.isPlaying }));
  }, [tts.isPlaying]);

  // 监听ASR错误
  useEffect(() => {
    if (asr.error && state.isActive) {
      console.error('语音识别错误:', asr.error);
      // 可以选择自动重试或显示错误信息
    }
  }, [asr.error, state.isActive]);

  // 监听TTS错误
  useEffect(() => {
    if (tts.error && state.isActive) {
      console.error('语音合成错误:', tts.error);
    }
  }, [tts.error, state.isActive]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return {
    // 状态
    ...state,
    
    // ASR相关状态
    asrError: asr.error,
    asrIsProcessing: asr.isProcessing,
    
    // TTS相关状态
    ttsError: tts.error,
    ttsIsLoading: tts.isLoading,
    
    // 控制方法
    startConversation,
    stopConversation,
    
    // 清理方法
    clearErrors: () => {
      asr.clearError();
      tts.clearError();
    },
    
    // 手动发送当前消息
    sendCurrentMessage: () => {
      if (state.currentMessage) {
        clearAllTimers();
        sendMessage(state.currentMessage);
      }
    },
  };
}
