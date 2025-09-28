"use client";

import { useState } from "react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    model: "gpt-4o-mini",
    ttsVoice: "alloy",
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
    preferences: {
      responseSpeed: "balanced", // fast, balanced, quality
      costOptimization: true,
    },
  });

  const modelOptions = [
    { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "快速响应，成本低" },
    { id: "gpt-4o", name: "GPT-4o", description: "高质量，速度适中" },
    { id: "claude-3-haiku", name: "Claude 3 Haiku", description: "极速响应" },
  ];

  const voiceOptions = [
    { id: "alloy", name: "Alloy", description: "中性，清晰" },
    { id: "verse", name: "Verse", description: "温暖，友好" },
    { id: "nova", name: "Nova", description: "年轻，活泼" },
    { id: "shimmer", name: "Shimmer", description: "优雅，成熟" },
  ];

  function handleSave() {
    // TODO: 保存到 localStorage
    localStorage.setItem("think-speak-settings", JSON.stringify(settings));
    alert("设置已保存！刷新聊天页面以生效。");
  }

  function handleReset() {
    if (confirm("确定要重置所有设置吗？")) {
      setSettings({
        model: "gpt-4o-mini",
        ttsVoice: "alloy",
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
        preferences: {
          responseSpeed: "balanced",
          costOptimization: true,
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
              <p className="text-sm text-white/60">配置模型、语音与偏好</p>
            </div>
          </div>
        </header>

        <Card className="mb-8 border-2 border-white/20 rounded-none bg-transparent">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-lg font-semibold uppercase tracking-wide text-white">模型选择</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <RadioGroup value={settings.model} onValueChange={(value) => setSettings({ ...settings, model: value })}>
              {modelOptions.map((model) => (
                <div key={model.id} className="flex items-start gap-3 p-3 border border-white/20 rounded-none hover:border-white/40 transition-colors">
                  <RadioGroupItem value={model.id} className="mt-1 rounded-none border-2 border-white/40 data-[state=checked]:bg-white data-[state=checked]:border-white" />
                  <div className="flex-1">
                    <div className="font-medium text-white">{model.name}</div>
                    <div className="text-sm text-white/60">{model.description}</div>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card className="mb-8 border-2 border-white/20 rounded-none bg-transparent">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-lg font-semibold uppercase tracking-wide text-white">语音选择</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <RadioGroup value={settings.ttsVoice} onValueChange={(value) => setSettings({ ...settings, ttsVoice: value })} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {voiceOptions.map((voice) => (
                <div key={voice.id} className="flex items-start gap-3 p-3 border border-white/20 rounded-none hover:border-white/40 transition-colors">
                  <RadioGroupItem value={voice.id} className="mt-1 rounded-none border-2 border-white/40 data-[state=checked]:bg-white data-[state=checked]:border-white" />
                  <div className="flex-1">
                    <div className="font-medium text-white">{voice.name}</div>
                    <div className="text-sm text-white/60">{voice.description}</div>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

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

        <section className="mb-8 p-4 border-2 border-white/20 rounded-none bg-transparent">
          <h2 className="text-lg font-semibold uppercase tracking-wide mb-4 text-white">性能偏好</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">响应速度</label>
              <RadioGroup value={settings.preferences.responseSpeed} onValueChange={(value) => setSettings({ 
                ...settings, 
                preferences: { ...settings.preferences, responseSpeed: value }
              })} className="flex gap-3">
                {[
                  { id: "fast", name: "快速", description: "优先速度，可能影响质量" },
                  { id: "balanced", name: "平衡", description: "速度与质量兼顾" },
                  { id: "quality", name: "质量", description: "优先质量，可能较慢" },
                ].map((option) => (
                  <div key={option.id} className="flex items-center gap-2 p-2 border border-white/20 rounded-none hover:border-white/40 transition-colors">
                    <RadioGroupItem value={option.id} className="rounded-none border-2 border-white/40 data-[state=checked]:bg-white data-[state=checked]:border-white" />
                    <div>
                      <div className="text-sm font-medium text-white">{option.name}</div>
                      <div className="text-xs text-white/60">{option.description}</div>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <label className="flex items-center gap-3">
              <Checkbox
                checked={settings.preferences.costOptimization}
                onCheckedChange={(checked) => 
                  setSettings({ 
                    ...settings, 
                    preferences: { ...settings.preferences, costOptimization: !!checked }
                  })
                }
                className="rounded-none border-2 border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-black"
              />
              <div>
                <div className="font-medium">成本优化</div>
                <div className="text-sm text-white/60">自动选择成本更低的模型和参数</div>
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
