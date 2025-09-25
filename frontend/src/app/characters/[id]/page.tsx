"use client";

import { useEffect, useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCharacter } from "@/lib/characters";
import { SkillToggle } from "@/lib/skills";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Category = "philosophy" | "mystery" | "fantasy";

const getCategory = (characterId: string): Category => {
  switch (characterId) {
    case "socrates": return "philosophy";
    case "sherlock": return "mystery";
    case "harry": return "fantasy";
    default: return "philosophy";
  }
};

const getRecommendedSkills = (characterId: string): SkillToggle => {
  switch (characterId) {
    case "socrates":
      return { socratic: true, quotes: true, flashcards: true, memory: true };
    case "sherlock":
      return { socratic: false, quotes: true, flashcards: true, memory: true };
    case "harry":
      return { socratic: false, quotes: true, flashcards: false, memory: true };
    default:
      return { socratic: false, quotes: true, flashcards: true, memory: true };
  }
};

const getCharacterDetails = (characterId: string) => {
  switch (characterId) {
    case "harry":
      return {
        category: "奇幻",
        personality: "勇敢、真诚、年轻",
        speakingStyle: "口语化、充满热情、偶尔紧张",
        background: "霍格沃茨的年轻魔法师，经历过多次冒险，对朋友忠诚，面对困难时勇敢坚定。",
        strengths: ["面对恐惧", "团队合作", "魔法知识", "正义感"],
        topics: ["霍格沃茨生活", "魁地奇策略", "如何面对恐惧", "友谊的力量", "魔法的奥秘"],
        sampleQuestions: [
          "我最近很害怕考试，你是怎么克服恐惧的？",
          "能教我一些实用的魔法技巧吗？",
          "魁地奇比赛有什么策略？"
        ]
      };
    case "socrates":
      return {
        category: "哲学",
        personality: "智慧、耐心、理性",
        speakingStyle: "温和、反问式、引导思考",
        background: "古希腊哲学家，以产婆术闻名，通过提问引导人们发现真理，相信知识即美德。",
        strengths: ["逻辑思考", "深度提问", "智慧引导", "道德思辨"],
        topics: ["正义是什么", "如何过好审视的人生", "知识即美德吗", "真理的探索", "智慧的定义"],
        sampleQuestions: [
          "什么是真正的正义？",
          "如何判断一件事是否正确？",
          "知识真的能带来美德吗？"
        ]
      };
    case "sherlock":
      return {
        category: "推理",
        personality: "冷静、专注、理性",
        speakingStyle: "简练、逻辑清晰、证据导向",
        background: "天才侦探，擅长观察细节和逻辑推理，习惯通过证据和演绎法解决复杂案件。",
        strengths: ["观察力", "逻辑推理", "证据分析", "案件破解"],
        topics: ["推理训练", "观察力练习", "案件结构化分析", "逻辑思维", "细节观察"],
        sampleQuestions: [
          "如何训练观察力？",
          "分析案件有什么步骤？",
          "逻辑推理的关键是什么？"
        ]
      };
    default:
      return {
        category: "未知",
        personality: "待定",
        speakingStyle: "待定",
        background: "角色信息待完善。",
        strengths: [],
        topics: [],
        sampleQuestions: []
      };
  }
};

export default function CharacterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const ch = useMemo(() => getCharacter(resolvedParams.id), [resolvedParams.id]);
  const [skills, setSkills] = useState<SkillToggle>(getRecommendedSkills(resolvedParams.id));
  
  const details = useMemo(() => getCharacterDetails(resolvedParams.id), [resolvedParams.id]);

  useEffect(() => {
    if (!ch) router.replace("/");
  }, [ch, router]);

  function handleStartChat() {
    localStorage.setItem(`character-${resolvedParams.id}-skills`, JSON.stringify(skills));
    router.push(`/chat/${resolvedParams.id}`);
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
              href="/characters"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              ← 角色库
            </Link>
            <div>
              <h1 className="text-2xl font-semibold uppercase tracking-wider text-white">{ch.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="rounded-none border-2 border-white/30 text-white text-xs">
                  {details.category}
                </Badge>
                <span className="text-sm text-white/60">{details.personality}</span>
              </div>
            </div>
          </div>
        </header>

        <Card className="mb-8 border-2 border-white/20 rounded-none bg-transparent">
          <CardHeader className="px-5 pb-0">
            <CardTitle className="text-lg font-semibold uppercase tracking-wide text-white">角色介绍</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-white mb-2">背景故事</h3>
                <p className="text-sm text-white/70 leading-relaxed">{details.background}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white mb-2">说话风格</h3>
                <p className="text-sm text-white/70">{details.speakingStyle}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 border-white/20 rounded-none bg-transparent">
            <CardHeader className="px-5 pb-0">
              <CardTitle className="text-base font-semibold uppercase tracking-wide text-white">擅长领域</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex flex-wrap gap-2">
                {details.strengths.map((strength, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="rounded-none border-2 border-white/30 text-white hover:bg-white/10 text-xs"
                  >
                    {strength}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-white/20 rounded-none bg-transparent">
            <CardHeader className="px-5 pb-0">
              <CardTitle className="text-base font-semibold uppercase tracking-wide text-white">话题标签</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex flex-wrap gap-2">
                {details.topics.map((topic, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="rounded-none border-2 border-white/30 text-white hover:bg-white/10 text-xs"
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 border-2 border-white/20 rounded-none bg-transparent">
          <CardHeader className="px-5 pb-0">
            <CardTitle className="text-lg font-semibold uppercase tracking-wide text-white">示例问题</CardTitle>
            <CardDescription className="text-white/60">你可以这样开始对话</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="space-y-3">
              {details.sampleQuestions.map((question, i) => (
                <div
                  key={i}
                  className="p-3 border border-white/20 rounded-none bg-transparent hover:border-white/40 transition-colors"
                >
                  <p className="text-sm text-white/80">"{question}"</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border-2 border-white/20 rounded-none bg-transparent">
          <CardHeader className="px-5 pb-0">
            <CardTitle className="text-lg font-semibold uppercase tracking-wide text-white">推荐技能设置</CardTitle>
            <CardDescription className="text-white/60">针对该角色优化的技能组合</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={skills.socratic}
                    onCheckedChange={(checked) => setSkills({ ...skills, socratic: !!checked })}
                    className="rounded-none border-2 border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-black"
                  />
                  <span className="text-white">Socratic 追问</span>
                  <span className="text-xs text-white/60">({resolvedParams.id === "socrates" ? "推荐" : "可选"})</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={skills.quotes}
                    onCheckedChange={(checked) => setSkills({ ...skills, quotes: !!checked })}
                    className="rounded-none border-2 border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-black"
                  />
                  <span className="text-white">金句提炼</span>
                  <span className="text-xs text-white/60">(推荐)</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={skills.flashcards}
                    onCheckedChange={(checked) => setSkills({ ...skills, flashcards: !!checked })}
                    className="rounded-none border-2 border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-black"
                  />
                  <span className="text-white">学习卡片</span>
                  <span className="text-xs text-white/60">({resolvedParams.id === "harry" ? "可选" : "推荐"})</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={skills.memory}
                    onCheckedChange={(checked) => setSkills({ ...skills, memory: !!checked })}
                    className="rounded-none border-2 border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-black"
                  />
                  <span className="text-white">会话记忆</span>
                  <span className="text-xs text-white/60">(推荐)</span>
                </label>
              </div>
              <div className="text-xs text-white/60">
                💡 提示：Socratic 追问适合哲学讨论，学习卡片适合知识学习，金句提炼适合内容创作
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push("/characters")}
            className="px-6 py-2 border-2 border-white/40 rounded-none bg-transparent text-white hover:border-white/60 hover:bg-white/10 transition-colors shadow-[4px_4px_0_0_#ffffff20]"
          >
            返回角色库
          </button>
          <button
            onClick={handleStartChat}
            className="px-8 py-2 border-2 border-white/40 rounded-none bg-transparent text-white hover:border-white/60 hover:bg-white/10 transition-colors shadow-[4px_4px_0_0_#ffffff20] font-medium"
          >
            开始对话 →
          </button>
        </div>
      </div>
    </div>
  );
}
