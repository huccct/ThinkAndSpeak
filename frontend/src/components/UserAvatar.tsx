"use client";

import { cn } from "@/lib/utils";

interface UserAvatarProps {
  username: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserAvatar({ username, size = "md", className }: UserAvatarProps) {
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm", 
    lg: "w-12 h-12 text-lg"
  };

  const initial = getInitial(username);

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-none border-2 border-white/40 bg-transparent text-white shadow-[2px_2px_0_0_#ffffff20] font-mono font-bold",
        sizeClasses[size],
        className
      )}
    >
      {initial}
    </div>
  );
}
