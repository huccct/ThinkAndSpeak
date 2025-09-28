"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCharacters,
  useCharactersLoading,
  useCharactersError,
  useCharactersQuery,
  useCharactersLoad,
  useCharactersSetQuery,
} from "@/modules/characters/characters.store";
import { useChatCreateConversation, useChatGetExistingConversationId, useChatSaveConversationId } from "@/modules/chat/chat.store";
import { useAuthToken, useAuthUser, useAuthLogout, useAuthInitializeAuth } from "@/modules/auth/auth.store";
import { UserAvatar } from "@/components/UserAvatar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const list = useCharacters();
  const loading = useCharactersLoading();
  const error = useCharactersError();
  const q = useCharactersQuery();
  const load = useCharactersLoad();
  const setQuery = useCharactersSetQuery();
  
  const createConversation = useChatCreateConversation();
  const getExistingConversationId = useChatGetExistingConversationId();
  const saveConversationId = useChatSaveConversationId();
  const token = useAuthToken();
  const user = useAuthUser();
  const logout = useAuthLogout();
  const initializeAuth = useAuthInitializeAuth();

  useEffect(() => {
    // 初始化认证状态
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (token) {
      load(q);
    }
  }, [load, q, token]);

  return (
    <div
      className="min-h-screen bg-black text-white"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 16px), repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 16px)",
        imageRendering: "pixelated",
      }}
    >
      <div className="mx-auto w-full max-w-5xl px-6 py-10 font-mono">
        <header className="flex items-center justify-between">
          <div className="text-lg font-semibold tracking-tight uppercase">Think·Speak</div>
          <nav className="flex items-center gap-4">
            <Link href="/characters" className="text-sm text-white/70 hover:text-white">
              角色库
            </Link>
            <Link href="/sessions" className="text-sm text-white/70 hover:text-white">
              会话历史
            </Link>
        <div className="flex items-center gap-2 ml-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <UserAvatar username={user.username} size="sm" />
                <span className="text-sm text-white/80">{user.username}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  toast.success("已退出登录", {
                    description: "感谢使用 Think·Speak",
                    duration: 2000,
                  });
                  // 延迟刷新页面，让用户看到退出提示
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                }}
                className="px-3 py-1 border-2 border-white/40 rounded-none bg-transparent text-white hover:border-white/60 hover:bg-white/10 transition-colors shadow-[2px_2px_0_0_#ffffff20] text-sm cursor-pointer"
              >
                退出
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-3 py-1 border-2 border-white/40 rounded-none bg-transparent text-white hover:border-white/60 hover:bg-white/10 transition-colors shadow-[2px_2px_0_0_#ffffff20] text-sm"
              >
                登录
              </Link>
              <Link
                href="/auth/register"
                className="px-3 py-1 border-2 border-white rounded-none bg-white text-black hover:bg-white/90 transition-colors shadow-[2px_2px_0_0_#ffffff20] text-sm"
              >
                注册
              </Link>
            </>
          )}
        </div>
          </nav>
        </header>

        <section className="mt-12">
          <h1 className="text-2xl font-semibold uppercase tracking-wider">角色搜索</h1>
          <p className="mt-1 text-sm text-white/60">选择一个角色，开始语音对话。</p>
          <div className="mt-5">
            <div className="relative">
              <Input
                placeholder="搜索角色关键字…"
                value={q}
                onChange={(e) => setQuery(e.target.value)}
                className="h-11 border-2 rounded-none border-white/40 text-white placeholder:text-white/40 focus-visible:border-white focus-visible:ring-0 shadow-[4px_4px_0_0_#ffffff20] bg-black"
              />
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/40 text-sm">
                ⌘K
              </div>
            </div>
            <div className="mt-3">
              <button
                onClick={() => load()}
                className="cursor-pointer px-3 py-2 border-2 border-white/40 rounded-none bg-transparent text-white hover:border-white/60 hover:bg-white/10 transition-colors shadow-[4px_4px_0_0_#ffffff20]"
              >搜索</button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="bg-transparent border border-white/10">
                    <CardHeader className="px-5 pb-0">
                      <Skeleton className="h-5 w-40 bg-white/10" />
                      <Skeleton className="mt-2 h-4 w-56 bg-white/10" />
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16 rounded bg-white/10" />
                        <Skeleton className="h-6 w-24 rounded bg-white/10" />
                      </div>
                      <Skeleton className="mt-4 h-9 w-full rounded bg-white/10" />
                    </CardContent>
                  </Card>
                ))
                : error ? (
                  <div className="col-span-full text-center text-sm text-red-400">{error}</div>
                ) : list.length > 0
              ? list.map((c) => (
                  <Card
                    key={c.id}
                    className="group bg-transparent border-2 rounded-none border-white/30 hover:border-white/60 transition-colors shadow-[6px_6px_0_0_#ffffff20]"
                  >
                    <CardHeader className="px-5 pb-0">
                      <div className="flex items-center gap-3">
                        {c.avatar && (
                          <img
                            src={c.avatar}
                            alt={c.name}
                            className="w-12 h-12 rounded-none border-2 border-white/40 object-cover flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <div>
                          <CardTitle className="text-white uppercase tracking-wide">{c.name}</CardTitle>
                          <CardDescription className="text-white/60">
                            {c.topics.slice(0, 2).join(" · ")}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                      <div className="flex flex-wrap gap-2">
                        {c.topics.map((t, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="rounded-none border-2 border-white/30 text-white hover:bg-white/10 shadow-[3px_3px_0_0_#ffffff20]"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-4">
                      <button
                        onClick={async () => {
                          try {
                            setCreatingId(c.id);
                            
                            // 先检查是否已有该角色的会话
                            let conversationId = getExistingConversationId(c.id);
                            
                            if (!conversationId) {
                              // 如果没有现有会话，创建新的
                              conversationId = await createConversation(c.id);
                              saveConversationId(c.id, conversationId);
                            }
                            
                            router.push(`/chat/${c.id}?session=${conversationId}`);
                          } catch (e) {
                            console.error(e);
                          } finally {
                            setCreatingId(null);
                          }
                        }}
                        disabled={creatingId === c.id}
                        className="cursor-pointer w-full rounded-none border-2 border-white/40 px-4 py-2 text-center text-sm text-white transition-colors hover:border-white/80 hover:bg-white/10 shadow-[4px_4px_0_0_#ffffff20] disabled:opacity-50"
                      >
                        {creatingId === c.id ? "创建会话中…" : "开始对话"}
                      </button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              : (
                  <div className="col-span-full text-center text-sm text-white/60">
                    未找到匹配角色
                  </div>
                )}
          </div>
        </section>

      </div>
    </div>
  );
}