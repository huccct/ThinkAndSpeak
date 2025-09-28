"use client";

import { Volume2, VolumeX, Loader2 } from "lucide-react";

interface TTSPlayButtonProps {
  text: string;
  isPlaying: boolean;
  isLoading: boolean;
  onPlay: (text: string) => void;
  onStop: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TTSPlayButton({
  text,
  isPlaying,
  isLoading,
  onPlay,
  onStop,
  disabled = false,
  size = "sm",
  className = ""
}: TTSPlayButtonProps) {
  const handleClick = () => {
    if (isPlaying || isLoading) {
      onStop();
    } else {
      onPlay(text);
    }
  };

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-10 h-10"
  };

  const iconSizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || !text.trim()}
      className={`flex items-center justify-center border-2 rounded-none transition-all duration-200 shadow-[2px_2px_0_0_#ffffff20] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 ${sizeClasses[size]} ${className} ${
        isPlaying 
          ? 'border-red-400 bg-red-400/10 text-red-400 hover:border-red-300' 
          : 'border-white/40 bg-transparent text-white/60 hover:border-white/60 hover:bg-white/10 hover:text-white'
      }`}
      title={isPlaying ? "停止播放" : "播放语音"}
    >
      {isLoading ? (
        <Loader2 className={`${iconSizeClasses[size]} animate-spin`} />
      ) : isPlaying ? (
        <VolumeX className={iconSizeClasses[size]} />
      ) : (
        <Volume2 className={iconSizeClasses[size]} />
      )}
    </button>
  );
}
