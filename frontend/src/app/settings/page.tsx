"use client";

import { useState } from "react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    defaultSkills: {
      socratic: false,
      quotes: true,
      flashcards: true,
      memory: true,
    },
    fallbacks: {
      webSpeechApi: true,
      localTts: false,
    },
  });


  function handleSave() {
    // TODO: 保存到 localStorage
    localStorage.setItem("think-speak-settings", JSON.stringify(settings));
    alert("设置已保存！刷新聊天页面以生效。");
  }

  function handleReset() {
    if (confirm("确定要重置所有设置吗？")) {
      setSettings({
        defaultSkills: {
          socratic: false,
          quotes: true,
          flashcards: true,
          memory: true,
        },
        fallbacks: {
          webSpeechApi: true,
          localTts: false,
        },
      });
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
            <div>
              <h1 className="text-xl font-semibold uppercase tracking-wider">设置</h1>
              <p className="text-sm text-white/60">配置应用偏好设置</p>
            </div>
          </div>
        </header>


        <section className="mb-8 p-4 border-2 border-white/20 rounded-none bg-transparent">
          <h2 className="text-lg font-semibold uppercase tracking-wide mb-4 text-white">默认技能</h2>
          <p className="text-sm text-white/60 mb-4">新会话的默认技能开关</p>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={settings.defaultSkills.socratic}
                onCheckedChange={(checked) => 
                  setSettings({ 
                    ...settings, 
                    defaultSkills: { ...settings.defaultSkills, socratic: !!checked }
                  })
                }
                className="rounded-none border-2 border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-black"
              />
              Socratic 追问
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={settings.defaultSkills.quotes}
                onCheckedChange={(checked) => 
                  setSettings({ 
                    ...settings, 
                    defaultSkills: { ...settings.defaultSkills, quotes: !!checked }
                  })
                }
                className="rounded-none border-2 border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-black"
              />
              金句提炼
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={settings.defaultSkills.flashcards}
                onCheckedChange={(checked) => 
                  setSettings({ 
                    ...settings, 
                    defaultSkills: { ...settings.defaultSkills, flashcards: !!checked }
                  })
                }
                className="rounded-none border-2 border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-black"
              />
              学习卡片
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={settings.defaultSkills.memory}
                onCheckedChange={(checked) => 
                  setSettings({ 
                    ...settings, 
                    defaultSkills: { ...settings.defaultSkills, memory: !!checked }
                  })
                }
                className="rounded-none border-2 border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-black"
              />
              会话记忆
            </label>
          </div>
        </section>

        <section className="mb-8 p-4 border-2 border-white/20 rounded-none bg-transparent">
          <h2 className="text-lg font-semibold uppercase tracking-wide mb-4 text-white">故障降级</h2>
          <p className="text-sm text-white/60 mb-4">当主要服务不可用时的备选方案</p>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <Checkbox
                checked={settings.fallbacks.webSpeechApi}
                onCheckedChange={(checked) => 
                  setSettings({ 
                    ...settings, 
                    fallbacks: { ...settings.fallbacks, webSpeechApi: !!checked }
                  })
                }
                className="rounded-none border-2 border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-black"
              />
              <div>
                <div className="font-medium">Web Speech API 回退</div>
                <div className="text-sm text-white/60">使用浏览器原生语音识别作为 ASR 备选</div>
              </div>
            </label>
            <label className="flex items-center gap-3">
              <Checkbox
                checked={settings.fallbacks.localTts}
                onCheckedChange={(checked) => 
                  setSettings({ 
                    ...settings, 
                    fallbacks: { ...settings.fallbacks, localTts: !!checked }
                  })
                }
                className="rounded-none border-2 border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-black"
              />
              <div>
                <div className="font-medium">本地 TTS 回退</div>
                <div className="text-sm text-white/60">使用浏览器原生语音合成作为 TTS 备选</div>
              </div>
            </label>
          </div>
        </section>


        <div className="flex gap-4 justify-end">
          <button
            onClick={handleReset}
            className="px-6 py-2 border-2 border-white/40 rounded-none bg-transparent text-white hover:border-white/60 hover:bg-white/10 transition-colors shadow-[4px_4px_0_0_#ffffff20]"
          >
            重置
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 border-2 border-white/40 rounded-none bg-transparent text-white hover:border-white/60 hover:bg-white/10 transition-colors shadow-[4px_4px_0_0_#ffffff20]"
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
}
