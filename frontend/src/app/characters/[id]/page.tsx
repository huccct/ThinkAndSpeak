"use client";

import { useEffect, useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SkillToggle } from "@/lib/skills";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  useCharacters, 
  useCharactersLoad,
  useCharactersLoading,
  useCharactersError 
} from "@/modules/characters/characters.store";

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

const getCharacterDetails = (character: any) => {
  if (!character) {
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

  const topics = character.topics || [];
  const persona = character.persona || "";
  
  // 根据角色数据动态生成详情
  const getCategoryFromCharacter = (char: any) => {
    if (topics.some((t: string) => t.includes("哲学") || t.includes("思考")) || 
        persona.includes("苏格拉底") || persona.includes("哲学")) {
      return "哲学";
    }
    if (topics.some((t: string) => t.includes("推理") || t.includes("侦探")) || 
        persona.includes("福尔摩斯") || persona.includes("推理")) {
      return "推理";
    }
    if (topics.some((t: string) => t.includes("魔法") || t.includes("奇幻")) || 
        persona.includes("哈利") || persona.includes("魔法")) {
      return "奇幻";
    }
    return "智能对话";
  };

  const getPersonalityFromPersona = (persona: string) => {
    if (persona.includes("勇敢") || persona.includes("年轻")) return "勇敢、真诚、年轻";
    if (persona.includes("智慧") || persona.includes("理性")) return "智慧、耐心、理性";
    if (persona.includes("冷静") || persona.includes("专注")) return "冷静、专注、理性";
    return "智能、友好、有趣";
  };

  const getSpeakingStyleFromPersona = (persona: string) => {
    if (persona.includes("口语化") || persona.includes("热情")) return "口语化、充满热情、偶尔紧张";
    if (persona.includes("反问") || persona.includes("引导")) return "温和、反问式、引导思考";
    if (persona.includes("简练") || persona.includes("逻辑")) return "简练、逻辑清晰、证据导向";
    return "自然、友好、富有表现力";
  };

  return {
    category: getCategoryFromCharacter(character),
    personality: getPersonalityFromPersona(persona),
    speakingStyle: getSpeakingStyleFromPersona(persona),
    background: persona || "一个有趣的AI角色，等待与你对话。",
    strengths: topics.slice(0, 4), // 使用前4个话题作为擅长领域
    topics: topics,
    sampleQuestions: [
      `你好，${character.name}！能介绍一下自己吗？`,
      `我想了解你的想法，能聊聊吗？`,
      `有什么有趣的话题想分享吗？`
    ]
  };
};

export default function CharacterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  
  // 使用角色store
  const characters = useCharacters();
  const loadCharacters = useCharactersLoad();
  const loading = useCharactersLoading();
  const error = useCharactersError();
  
  const ch = useMemo(() => characters.find((c) => c.id === resolvedParams.id), [characters, resolvedParams.id]);
  const [skills, setSkills] = useState<SkillToggle>(getRecommendedSkills(resolvedParams.id));
  
  const details = useMemo(() => getCharacterDetails(ch), [ch]);

  // 初始化加载角色
  useEffect(() => {
    if (characters.length === 0) {
      loadCharacters();
    }
  }, [characters.length, loadCharacters]);

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
            onClick={() => loadCharacters()}
            className="px-4 py-2 border-2 border-white/30 rounded-none bg-transparent text-white hover:border-white/50 hover:bg-white/10 transition-colors mr-4"
          >
            重试
          </button>
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
            <div className="flex items-center gap-4">
              {ch.avatar && (
                <img
                  src={ch.avatar}
                  alt={ch.name}
                  className="w-16 h-16 rounded-none border-2 border-white/40 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
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
