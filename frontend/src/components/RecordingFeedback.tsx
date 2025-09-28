"use client";

import { useEffect, useRef } from 'react';

interface RecordingFeedbackProps {
  isRecording: boolean;
  className?: string;
}

export function RecordingFeedback({ isRecording, className = "" }: RecordingFeedbackProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  // 录音开始音效
  useEffect(() => {
    if (isRecording) {
      playStartSound();
    } else {
      stopSound();
    }

    return () => {
      stopSound();
    };
  }, [isRecording]);

  const playStartSound = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
      
    } catch (error) {
      console.log('无法播放音频提示:', error);
    }
  };

  const stopSound = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch (error) {
      }
      oscillatorRef.current = null;
    }
  };

  if (!isRecording) {
    return null;
  }

  return (
    <div className={`fixed top-20 right-4 pointer-events-none z-50 ${className}`}>
      {/* 极简录音指示器 */}
      <div className="bg-red-500 text-white px-2 py-1 rounded-none border border-red-400 text-xs font-mono">
        ● REC
      </div>
    </div>
  );
}
