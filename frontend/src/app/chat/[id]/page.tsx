"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCharacter } from "@/lib/characters";
import { SkillToggle } from "@/lib/skills";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

type Msg = { role: "user" | "assistant"; content: string; timestamp?: number };

export default function ChatPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const ch = useMemo(() => getCharacter(params.id), [params.id]);
  const [skills, setSkills] = useState<SkillToggle>({
    socratic: params.id === "socrates",
    quotes: true,
    flashcards: true,
    memory: true,
  });
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: `你好！我是${ch?.name}。${ch?.sampleTopics[0] || "有什么想聊的吗？"}`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!ch) router.replace("/");
  }, [ch, router]);

  function handleSendText() {
    if (!input.trim() || sending) return;
    
    const userMsg: Msg = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setSending(true);
    
    // TODO: 实际 API 调用
    setTimeout(() => {
      const reply: Msg = {
        role: "assistant",
        content: "这是模拟回复，实际会调用 LLM API。",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, reply]);
      setSending(false);
    }, 1000);
  }

  function handleVoiceRecord() {
    if (recording) {
      setRecording(false);
      // TODO: 停止录音并发送 ASR
    } else {
      setRecording(true);
      // TODO: 开始录音
    }
  }

  if (!ch) return null;

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
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              ← 返回
            </Link>
            <div>
              <h1 className="text-xl font-semibold uppercase tracking-wider">{ch.name}</h1>
              <p className="text-sm text-white/60">{ch.sampleTopics.slice(0, 2).join(" · ")}</p>
            </div>
          </div>
         
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
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 border-2 rounded-none shadow-[4px_4px_0_0_#ffffff20] ${
                    msg.role === "user"
                      ? "border-white/40 bg-white/5"
                      : "border-white/30 bg-transparent"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                  {msg.timestamp && (
                    <div className="text-xs text-white/40 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  )}
                </div>
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
              className="flex-1 border-2 border-white/40 rounded-none focus-visible:border-white focus-visible:ring-0 shadow-[4px_4px_0_0_#ffffff20]"
              disabled={sending}
            />
            <button
              onClick={handleSendText}
              disabled={!input.trim() || sending}
              className="px-4 py-2 border-2 border-white/40 rounded-none bg-transparent text-white hover:border-white/60 hover:bg-white/10 transition-colors shadow-[4px_4px_0_0_#ffffff20] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              发送
            </button>
            <button
              onClick={handleVoiceRecord}
              className={`px-4 py-2 border-2 rounded-none bg-transparent text-white transition-colors shadow-[4px_4px_0_0_#ffffff20] ${
                recording
                  ? "border-red-400 bg-red-400/10"
                  : "border-white/40 hover:border-white/60 hover:bg-white/10"
              }`}
            >
              {recording ? "⏹" : "🎙"}
            </button>
          </div>
          <div className="mt-2 text-xs text-white/40">
            {recording ? "录音中..." : "按麦克风开始语音输入"}
          </div>
        </div>
      </div>
    </div>
  );
}
