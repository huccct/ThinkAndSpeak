"use client";

import { useEffect, useMemo, useState, use, useRef, useCallback } from "react";
import Link from "next/link";
import { SkillToggle } from "@/lib/skills";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import {
  useCharacters,
  useCharactersLoad,
  useCharactersLoading,
  useCharactersError,
} from "@/modules/characters/characters.store";
import { useChatSendMessage, useChatGetConversation } from "@/modules/chat/chat.store";
import { useAuthToken, useAuthUser, useAuthInitializeAuth } from "@/modules/auth/auth.store";
import { UserAvatar } from "@/components/UserAvatar";
import { useTTS } from "@/hooks/useTTS";
import { useASR } from "@/hooks/useASR";
import { TTSPlayButton } from "@/components/TTSPlayButton";
import { VoiceRecordButton } from "@/components/VoiceRecordButton";

type Msg = { role: "user" | "assistant"; content: string; timestamp?: number };

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const list = useCharacters();
  const load = useCharactersLoad();
  const loading = useCharactersLoading();
  const error = useCharactersError();
  const ch = useMemo(() => list.find((c) => c.id === resolvedParams.id), [list, resolvedParams.id]);
  
  const sendMessage = useChatSendMessage();
  const getConversation = useChatGetConversation();
  const token = useAuthToken();
  const user = useAuthUser();
  const initializeAuth = useAuthInitializeAuth();
  

  // TTS功能
  const { 
    isPlaying: ttsPlaying, 
    isLoading: ttsLoading, 
    error: ttsError,
    currentText,
    speak, 
    stop: stopTTS, 
    clearError: clearTTSError 
  } = useTTS();

  // ASR功能
  const {
    isRecording: asrRecording,
    isProcessing: asrProcessing,
    result: asrResult,
    error: asrError,
    startRecording,
    stopRecording,
    clearResult: clearASRResult,
    clearError: clearASRError
  } = useASR();

  const [skills, setSkills] = useState<SkillToggle>({
    socratic: resolvedParams.id === "socrates",
    quotes: true,
    flashcards: true,
    memory: true,
  });
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (list.length === 0 && token) {
      load();
    }
  }, [list.length, load, token]);

  // 如果角色未找到且正在加载，显示加载状态
  if (loading && !ch) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white/40 border-t-white mx-auto mb-4"></div>
          <div className="text-white/60">加载角色信息中...</div>
        </div>
      </div>
    );
  }

  // 如果角色未找到且加载完成，显示错误
  if (!loading && !ch && !error) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">角色不存在</div>
          <Link
            href="/characters"
            className="px-4 py-2 border-2 border-white/30 rounded-none bg-transparent text-white hover:border-white/50 hover:bg-white/10 transition-colors"
          >
            返回角色列表
          </Link>
        </div>
      </div>
    );
  }

  // 如果加载出错
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">加载失败: {error}</div>
          <button
            onClick={() => load()}
            className="cursor-pointer px-4 py-2 border-2 border-white/30 rounded-none bg-transparent text-white hover:border-white/50 hover:bg-white/10 transition-colors mr-4"
          >
            重试
          </button>
          <Link
            href="/characters"
            className="cursor-pointer px-4 py-2 border-2 border-white/30 rounded-none bg-transparent text-white hover:border-white/50 hover:bg-white/10 transition-colors"
          >
            返回角色列表
          </Link>
        </div>
      </div>
    );
  }

  // 初始化会话ID并加载历史消息
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session');
      if (sessionId) {
        setConversationId(sessionId);
        console.log('会话ID已设置:', sessionId); // 调试日志
        
        // 加载会话历史消息
        loadConversationHistory(sessionId);
      }
    }
  }, []);

  // 加载会话历史消息
  const loadConversationHistory = async (conversationId: string) => {
        try {
          const historyMessages = await getConversation(conversationId);
          if (historyMessages.length > 0) {
            const convertedMessages: Msg[] = historyMessages.map(msg => ({
              role: msg.sender === 'USER' ? 'user' : 'assistant',
              content: msg.content,
              timestamp: convertCreatedAtToTimestamp(msg.createdAt),
            }));
            setMessages(convertedMessages);
          }
        } catch (error) {
          console.error('加载会话历史失败:', error);
        }
  };

  // 转换后端时间格式为时间戳
  const convertCreatedAtToTimestamp = (createdAt: number[]): number => {
    const [year, month, day, hour, minute, second] = createdAt;
    return new Date(year, month - 1, day, hour, minute, second).getTime();
  };

  useEffect(() => {
    // 只有在没有历史消息且没有会话ID时才显示欢迎消息
    if (messages.length === 0 && !conversationId) {
      const greet = `你好！${ch ? `我是${ch.name}。` : ""}${
        ch?.topics?.[0] || "有什么想聊的吗？"
      }`;
      setMessages([
        {
          role: "assistant",
          content: greet,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [ch, messages.length, conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 处理ASR结果
  useEffect(() => {
    if (asrResult?.text) {
      setInput(asrResult.text);
      clearASRResult();
    }
  }, [asrResult, clearASRResult]);


  async function handleSendText() {
    if (!input.trim() || sending || !ch) return;
    
    if (!conversationId) {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session');
        if (sessionId) {
          setConversationId(sessionId);
          console.log('重新获取会话ID:', sessionId);
        } else {
          console.error('没有找到会话ID');
          return;
        }
      } else {
        return;
      }
    }
    
    const userMsg: Msg = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    const messageText = input.trim();
    setInput("");
    setSending(true);
    
    try {
      const currentConversationId = conversationId || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('session') : null);
      if (!currentConversationId) {
        throw new Error('会话ID不可用');
      }
      const reply = await sendMessage(currentConversationId, messageText, ch.name);
      const assistantMsg: Msg = {
        role: "assistant",
        content: reply,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMsg: Msg = {
        role: "assistant",
        content: "抱歉，发送消息时出现错误，请稍后重试。",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
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
      <div className="mx-auto w-full max-w-4xl px-6 py-6">
        <header className="flex items-center justify-between border-b-2 border-white/30 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              返回
            </Link>
            {ch?.avatar && (
              <img
                src={ch.avatar}
                alt={ch.name}
                className="w-12 h-12 rounded-none border-2 border-white/40 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div>
              <h1 className="text-xl font-semibold uppercase tracking-wider">{ch?.name ?? "加载中"}</h1>
              <p className="text-sm text-white/60">
                {(ch?.topics || []).slice(0, 2).join(" · ")}
              </p>
            </div>
          </div>
          <Link href="/settings" className="text-sm text-white/70 hover:text-white transition-colors">
            Settings
          </Link>
        </header>

        <div className="mb-6 p-4 border-2 border-white/20 rounded-none bg-transparent">
          <div className="text-sm font-medium uppercase tracking-wide mb-3">技能开关</div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={skills.socratic}
                onCheckedChange={(checked) => setSkills({ ...skills, socratic: !!checked })}
                className="rounded-none border-2 border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-black"
              />
              Socratic 追问
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={skills.quotes}
                onCheckedChange={(checked) => setSkills({ ...skills, quotes: !!checked })}
                className="rounded-none border-2 border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-black"
              />
              金句提炼
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={skills.flashcards}
                onCheckedChange={(checked) => setSkills({ ...skills, flashcards: !!checked })}
                className="rounded-none border-2 border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-black"
              />
              学习卡片
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={skills.memory}
                onCheckedChange={(checked) => setSkills({ ...skills, memory: !!checked })}
                className="rounded-none border-2 border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-black"
              />
              会话记忆
            </label>
          </div>
        </div>

        <div className="flex-1 min-h-0 mb-6">
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-pixel">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3`}
              >
                {msg.role === "assistant" && ch?.avatar && (
                  <div className="flex-shrink-0 mt-1">
                    <img
                      src={ch.avatar}
                      alt={ch.name}
                      className="w-8 h-8 rounded-none border-2 border-white/40 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 border-2 rounded-none shadow-[4px_4px_0_0_#ffffff20] ${
                    msg.role === "user"
                      ? "border-white/40 bg-white/5"
                      : "border-white/30 bg-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm whitespace-pre-wrap flex-1">{msg.content}</div>
                    {msg.role === "assistant" && (
                      <TTSPlayButton
                        text={msg.content}
                        isPlaying={ttsPlaying && msg.content === currentText}
                        isLoading={ttsLoading && msg.content === currentText}
                        onPlay={(text) => speak(text)}
                        onStop={stopTTS}
                        size="sm"
                        className="cursor-pointer flex-shrink-0 mt-1"
                      />
                    )}
                  </div>
                  {msg.timestamp && (
                    <div className="text-xs text-white/40 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  )}
                </div>
                {msg.role === "user" && user && (
                  <div className="flex-shrink-0 mt-1">
                    <UserAvatar username={user.username} size="sm" />
                  </div>
                )}
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="border-2 border-white/30 bg-transparent rounded-none p-3 shadow-[4px_4px_0_0_#ffffff20]">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <div className="animate-pulse">●</div>
                    <div className="animate-pulse">●</div>
                    <div className="animate-pulse">●</div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t-2 border-white/20 pt-6">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendText();
                }
              }}
              placeholder="输入消息... (Shift+Enter 换行)"
              className="flex-1 border-2 border-white/40 rounded-none focus-visible:border-white focus-visible:ring-0 shadow-[4px_4px_0_0_#ffffff20] bg-black text-white placeholder:text-white/40"
              disabled={sending}
            />
            <VoiceRecordButton
              isRecording={asrRecording}
              isProcessing={asrProcessing}
              onStart={startRecording}
              onStop={stopRecording}
              disabled={sending}
            />
            <button
              onClick={handleSendText}
              disabled={!input.trim() || sending}
              className="cursor-pointer px-4 py-2 border-2 border-white/40 rounded-none bg-transparent text-white hover:border-white/60 hover:bg-white/10 transition-colors shadow-[4px_4px_0_0_#ffffff20] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              发送
            </button>
          </div>
          
          {/* 错误提示 */}
          {(asrError || ttsError) && (
            <div className="mt-2 text-xs text-red-400">
              {asrError && `语音识别错误: ${asrError}`}
              {ttsError && `语音播放失败: ${ttsError}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
