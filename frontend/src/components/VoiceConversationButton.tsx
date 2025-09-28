"use client";

import { Mic, MicOff, Phone, PhoneOff, Loader2, Volume2, VolumeX } from "lucide-react";
import { useState, useEffect } from 'react';

interface VoiceConversationButtonProps {
  isActive: boolean;
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  speechDetected: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
  className?: string;
}

export function VoiceConversationButton({
  isActive,
  isListening,
  isProcessing,
  isSpeaking,
  audioLevel,
  speechDetected,
  onStart,
  onStop,
  disabled = false,
  className = ""
}: VoiceConversationButtonProps) {
  const [pulseScale, setPulseScale] = useState(1);

  // 根据音频级别调整脉冲效果
  useEffect(() => {
    if (isListening && speechDetected) {
      const scale = 1 + (audioLevel * 0.3);
      setPulseScale(scale);
    } else {
      setPulseScale(1);
    }
  }, [audioLevel, speechDetected, isListening]);

  const handleClick = () => {
    if (isActive) {
      onStop();
    } else {
      onStart();
    }
  };

  const getButtonColor = () => {
    if (isActive && speechDetected) {
      return 'border-green-400 bg-green-400/20 text-green-400';
    } else if (isActive && isListening) {
      return 'border-blue-400 bg-blue-400/20 text-blue-400';
    } else if (isProcessing) {
      return 'border-yellow-400 bg-yellow-400/20 text-yellow-400';
    } else if (isSpeaking) {
      return 'border-purple-400 bg-purple-400/20 text-purple-400';
    } else {
      return 'border-white/40 bg-transparent text-white hover:border-white/60 hover:bg-white/10';
    }
  };

  const getIcon = () => {
    if (isProcessing) {
      return <Loader2 className="h-5 w-5 animate-spin" />;
    } else if (isSpeaking) {
      return <Volume2 className="h-5 w-5" />;
    } else if (isActive) {
      return <PhoneOff className="h-5 w-5" />;
    } else {
      return <Phone className="h-5 w-5" />;
    }
  };

  const getStatusText = () => {
    if (isProcessing) {
      return '处理中...';
    } else if (isSpeaking) {
      return 'AI正在说话';
    } else if (speechDetected) {
      return '检测到语音';
    } else if (isListening) {
      return '正在监听';
    } else if (isActive) {
      return '语音对话中';
    } else {
      return '开始语音对话';
    }
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <button
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={`relative px-6 py-3 border-2 rounded-none transition-all duration-200 shadow-[4px_4px_0_0_#ffffff20] disabled:opacity-50 disabled:cursor-not-allowed ${getButtonColor()}`}
        style={{
          transform: `scale(${pulseScale})`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        {/* 背景脉冲效果 */}
        {isActive && (speechDetected || isListening) && (
          <div 
            className="absolute inset-0 border-2 border-current rounded-none animate-ping opacity-30"
            style={{
              animationDuration: '1s',
              animationIterationCount: 'infinite',
            }}
          />
        )}
        
        {/* 音频级别可视化 */}
        {isListening && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-2 h-2 bg-current rounded-full opacity-50"
              style={{
                transform: `scale(${1 + audioLevel * 2})`,
                transition: 'transform 0.1s ease-out',
              }}
            />
          </div>
        )}
        
        <div className="relative z-10 flex items-center justify-center">
          {getIcon()}
        </div>
        
        {/* 语音检测指示器 */}
        {speechDetected && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        )}
      </button>
      
      {/* 状态文本 */}
      <div className="text-xs text-white/60 text-center min-h-[16px]">
        {getStatusText()}
      </div>
      
      {/* 音频级别条 */}
      {isListening && (
        <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-current transition-all duration-100"
            style={{
              width: `${audioLevel * 100}%`,
              backgroundColor: speechDetected ? '#10b981' : '#3b82f6',
            }}
          />
        </div>
      )}
    </div>
  );
}
