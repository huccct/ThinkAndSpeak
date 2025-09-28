"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  useCharacters, 
  useCharactersLoad,
  useCharactersLoading,
  useCharactersError 
} from "@/modules/characters/characters.store";
import { ArrowLeft } from "lucide-react";

type SessionMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

type Session = {
  id: string;
  characterId: string;
  title: string;
  lastMessage: string;
  messageCount: number;
  createdAt: number;
  updatedAt: number;
  duration: number; // in minutes
  messages: SessionMessage[];
};

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 使用角色store
  const characters = useCharacters();
  const loadCharacters = useCharactersLoad();
  const charactersLoading = useCharactersLoading();
  const charactersError = useCharactersError();

  useEffect(() => {
    loadSessions();
    // 初始化加载角色
    if (characters.length === 0) {
      loadCharacters();
    }
  }, [characters.length, loadCharacters]);

  function loadSessions() {
    try {
      const savedSessions = localStorage.getItem("think-speak-sessions");
      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions);
        // 按更新时间排序，最新的在前
        const sortedSessions = parsedSessions.sort((a: Session, b: Session) => b.updatedAt - a.updatedAt);
        setSessions(sortedSessions);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setLoading(false);
    }
  }

  function deleteSession(sessionId: string) {
    if (confirm("确定要删除这个会话吗？")) {
      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(updatedSessions);
      localStorage.setItem("think-speak-sessions", JSON.stringify(updatedSessions));
    }
  }

  function clearAllSessions() {
    if (confirm("确定要清空所有会话历史吗？此操作不可恢复。")) {
      setSessions([]);
      localStorage.removeItem("think-speak-sessions");
    }
  }

  function continueSession(session: Session) {
    // 保存会话数据到临时存储，聊天页面会读取
    localStorage.setItem("continue-session", JSON.stringify(session));
    router.push(`/chat/${session.characterId}?session=${session.id}`);
  }

  function formatTime(timestamp: number) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 24 * 60 * 60 * 1000) {
      // 今天
      return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      // 本周
      return date.toLocaleDateString("zh-CN", { weekday: "short", hour: "2-digit", minute: "2-digit" });
    } else {
      // 更早
      return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
    }
  }

  function formatDuration(minutes: number) {
    if (minutes < 1) return "< 1分钟";
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}小时${remainingMinutes > 0 ? remainingMinutes + "分钟" : ""}`;
  }

  if (loading) {
    return (
      <div
        className="min-h-screen bg-black text-white font-mono flex items-center justify-center"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 16px), repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 16px)",
          imageRendering: "pixelated",
        }}
      >
        <div className="text-center">
          <div className="text-lg font-semibold uppercase tracking-wider mb-2">加载中...</div>
          <div className="text-sm text-white/60">正在读取会话历史</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-black text-white font-mono"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 16px), repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 16px)",
        imageRendering: "pixelated",
      }}
    >
      <div className="mx-auto w-full max-w-5xl px-6 py-6">
        <header className="flex items-center justify-between border-b-2 border-white/30 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              返回
            </Link>
            <div>
              <h1 className="text-2xl font-semibold uppercase tracking-wider text-white">会话历史</h1>
              <p className="text-sm text-white/60">
                {sessions.length > 0 ? `共 ${sessions.length} 个会话` : "暂无会话记录"}
              </p>
            </div>
          </div>
          {sessions.length > 0 && (
            <button
              onClick={clearAllSessions}
              className="px-3 py-1 border border-white/30 rounded-none bg-transparent text-white/70 hover:border-white/50 hover:text-white transition-colors text-sm"
            >
              清空全部
            </button>
          )}
        </header>

        {sessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-6">
              <div className="text-4xl mb-4">💬</div>
              <div className="text-lg font-semibold text-white mb-2">暂无会话记录</div>
              <div className="text-sm text-white/60 mb-6">
                开始与角色对话后，会话记录将显示在这里
              </div>
            </div>
            <Link
              href="/"
              className="inline-block px-6 py-2 border-2 border-white/40 rounded-none bg-transparent text-white hover:border-white/60 hover:bg-white/10 transition-colors shadow-[4px_4px_0_0_#ffffff20]"
            >
              开始新对话
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const character = characters.find(c => c.id === session.characterId);
              if (!character) return null;

              return (
                <Card
                  key={session.id}
                  className="group bg-transparent border-2 border-white/20 hover:border-white/40 transition-colors shadow-[6px_6px_0_0_#ffffff20]"
                >
                  <CardHeader className="px-5 pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {character.avatar ? (
                          <img
                            src={character.avatar}
                            alt={character.name}
                            className="w-10 h-10 rounded-none border-2 border-white/30 object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-10 h-10 border-2 border-white/30 rounded-none bg-white/5 flex items-center justify-center text-lg ${character.avatar ? 'hidden' : ''}`}>
                          {character.name.charAt(0)}
                        </div>
                        <div>
                          <CardTitle className="text-white uppercase tracking-wide">
                            {character.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className="rounded-none border-2 border-white/30 text-white text-xs"
                            >
                              {session.messageCount} 条消息
                            </Badge>
                            <Badge
                              variant="outline"
                              className="rounded-none border-2 border-white/30 text-white text-xs"
                            >
                              {formatDuration(session.duration)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-white/60">
                          {formatTime(session.updatedAt)}
                        </div>
                        <div className="text-xs text-white/40 mt-1">
                          {new Date(session.createdAt).toLocaleDateString("zh-CN")}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <div className="mb-4">
                      <div className="text-sm text-white/80 line-clamp-2">
                        {session.lastMessage}
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => deleteSession(session.id)}
                        className="px-3 py-1 border border-white/30 rounded-none bg-transparent text-white/60 hover:border-red-400/50 hover:text-red-400 transition-colors text-sm"
                      >
                        删除
                      </button>
                      <button
                        onClick={() => continueSession(session)}
                        className="px-4 py-2 border-2 border-white/40 rounded-none bg-transparent text-white hover:border-white/60 hover:bg-white/10 transition-colors shadow-[3px_3px_0_0_#ffffff20]"
                      >
                        继续对话
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {sessions.length > 0 && (
          <section className="mt-12 p-4 border-2 border-white/20 rounded-none bg-transparent">
            <h2 className="text-lg font-semibold uppercase tracking-wide mb-4 text-white">统计信息</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border border-white/20 rounded-none">
                <div className="text-2xl font-bold text-white">{sessions.length}</div>
                <div className="text-sm text-white/60">总会话数</div>
              </div>
              <div className="text-center p-3 border border-white/20 rounded-none">
                <div className="text-2xl font-bold text-white">
                  {sessions.reduce((sum, s) => sum + s.messageCount, 0)}
                </div>
                <div className="text-sm text-white/60">总消息数</div>
              </div>
              <div className="text-center p-3 border border-white/20 rounded-none">
                <div className="text-2xl font-bold text-white">
                  {formatDuration(sessions.reduce((sum, s) => sum + s.duration, 0))}
                </div>
                <div className="text-sm text-white/60">总时长</div>
              </div>
              <div className="text-center p-3 border border-white/20 rounded-none">
                <div className="text-2xl font-bold text-white">
                  {new Set(sessions.map(s => s.characterId)).size}
                </div>
                <div className="text-sm text-white/60">互动角色</div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
