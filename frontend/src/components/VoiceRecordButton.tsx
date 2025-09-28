"use client";

import { Mic, Square, Loader2 } from "lucide-react";

interface VoiceRecordButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
  className?: string;
}

export function VoiceRecordButton({
  isRecording,
  isProcessing,
  onStart,
  onStop,
  disabled = false,
  className = ""
}: VoiceRecordButtonProps) {
  const handleClick = () => {
    if (isRecording) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isProcessing}
      className={`relative px-4 py-2 border-2 rounded-none transition-all duration-200 shadow-[4px_4px_0_0_#ffffff20] disabled:opacity-50 disabled:cursor-not-allowed ${className} ${
        isRecording 
          ? 'border-red-400 bg-red-400/10 text-red-400 hover:border-red-300 scale-105' 
          : 'border-white/40 bg-transparent text-white hover:border-white/60 hover:bg-white/10 hover:scale-105'
      }`}
    >
      {isRecording && (
        <div className="absolute inset-0 border-2 border-red-400 rounded-none animate-ping"></div>
      )}
      
      <div className="relative z-10 flex items-center justify-center">
        {isRecording ? (
          <Square className="h-4 w-4" />
        ) : isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </div>
      
      {isRecording && (
        <div className="absolute inset-0 bg-red-400/20 rounded-none animate-pulse"></div>
      )}
    </button>
  );
}
