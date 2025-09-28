"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { 
  useCharacters, 
  useCharactersLoading, 
  useCharactersError, 
  useCharactersQuery,
  useCharactersLoad,
  useCharactersSetQuery 
} from "@/modules/characters/characters.store";

type Category = "all" | "philosophy" | "mystery" | "fantasy";

const categories = [
  { id: "all", name: "全部" },
  { id: "philosophy", name: "哲学" },
  { id: "mystery", name: "推理" },
  { id: "fantasy", name: "奇幻" },
];

const getCategory = (character: any): Category => {
  const topics = character.topics || [];
  const persona = character.persona || "";
  
  if (topics.some((t: string) => t.includes("哲学") || t.includes("思考")) || 
      persona.includes("苏格拉底") || persona.includes("哲学")) {
    return "philosophy";
  }
  if (topics.some((t: string) => t.includes("推理") || t.includes("侦探")) || 
      persona.includes("福尔摩斯") || persona.includes("推理")) {
    return "mystery";
  }
  if (topics.some((t: string) => t.includes("魔法") || t.includes("奇幻")) || 
      persona.includes("哈利") || persona.includes("魔法")) {
    return "fantasy";
  }
  return "all";
};

export default function CharactersPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  
  // 使用角色store
  const characters = useCharacters();
  const loading = useCharactersLoading();
  const error = useCharactersError();
  const query = useCharactersQuery();
  const loadCharacters = useCharactersLoad();
  const setQuery = useCharactersSetQuery();

  // 初始化加载角色
  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  const filteredCharacters = useMemo(() => {
    if (selectedCategory === "all") return characters;
    return characters.filter(char => getCategory(char) === selectedCategory);
  }, [characters, selectedCategory]);

  // 处理搜索
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    loadCharacters(searchQuery);
  };

  return (
    <div
      className="min-h-screen bg-black text-white font-mono"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 16px), repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 16px)",
        imageRendering: "pixelated",
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-6">
        <header className="flex items-center justify-between border-b-2 border-white/30 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              ← 返回
            </Link>
            <div>
              <h1 className="text-2xl font-semibold uppercase tracking-wider text-white">角色库</h1>
              <p className="text-sm text-white/60">选择你感兴趣的角色开始对话</p>
            </div>
          </div>
        </header>

        {/* 搜索框 */}
        <section className="mb-6 p-4 border-2 border-white/20 rounded-none bg-transparent">
          <h2 className="text-lg font-semibold uppercase tracking-wide mb-4 text-white">搜索角色</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="搜索角色名称或关键词..."
              className="pl-10 border-2 border-white/40 rounded-none focus-visible:border-white focus-visible:ring-0 shadow-[3px_3px_0_0_#ffffff20] bg-black text-white placeholder:text-white/40"
            />
          </div>
        </section>

        <section className="mb-8 p-4 border-2 border-white/20 rounded-none bg-transparent">
          <h2 className="text-lg font-semibold uppercase tracking-wide mb-4 text-white">分类筛选</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as Category)}
                className={`px-4 py-2 border-2 rounded-none transition-colors shadow-[3px_3px_0_0_#ffffff20] ${
                  selectedCategory === category.id
                    ? "border-white/60 bg-white/10 text-white"
                    : "border-white/30 bg-transparent text-white/70 hover:border-white/50 hover:text-white"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </section>

        <section>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-white/60" />
              <span className="ml-2 text-white/60">加载角色中...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="text-red-400 mb-4">加载失败: {error}</div>
              <button
                onClick={() => loadCharacters()}
                className="px-4 py-2 border-2 border-white/30 rounded-none bg-transparent text-white hover:border-white/50 hover:bg-white/10 transition-colors"
              >
                重试
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCharacters.map((character) => (
                <Card
                  key={character.id}
                  className="group bg-transparent border-2 border-white/20 hover:border-white/40 transition-colors shadow-[6px_6px_0_0_#ffffff20]"
                >
                  <CardHeader className="px-5 pb-0">
                    <div className="flex items-center gap-3">
                      {character.avatar && (
                        <img
                          src={character.avatar}
                          alt={character.name}
                          className="w-12 h-12 rounded-none border-2 border-white/40 object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div>
                        <CardTitle className="text-white uppercase tracking-wide">
                          {character.name}
                        </CardTitle>
                        <CardDescription className="text-white/60">
                          {getCategory(character) === "philosophy" && "哲学思考 · 智慧对话"}
                          {getCategory(character) === "mystery" && "逻辑推理 · 案件分析"}
                          {getCategory(character) === "fantasy" && "魔法世界 · 冒险故事"}
                          {getCategory(character) === "all" && "智能对话 · 角色扮演"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {character.topics.slice(0, 3).map((topic, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="rounded-none border-2 border-white/30 text-white hover:bg-white/10 text-xs"
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>

                    <div className="mb-4 text-sm text-white/70 leading-relaxed">
                      {character.persona ? 
                        character.persona.substring(0, 100) + (character.persona.length > 100 ? "..." : "") :
                        "一个有趣的AI角色，等待与你对话。"
                      }
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/characters/${character.id}`}
                        className="flex-1 px-3 py-2 border-2 border-white/30 rounded-none bg-transparent text-white hover:border-white/50 hover:bg-white/10 transition-colors text-center text-sm shadow-[3px_3px_0_0_#ffffff20]"
                      >
                        了解详情
                      </Link>
                      <Link
                        href={`/chat/${character.id}`}
                        className="flex-1 px-3 py-2 border-2 border-white/40 rounded-none bg-transparent text-white hover:border-white/60 hover:bg-white/10 transition-colors text-center text-sm shadow-[3px_3px_0_0_#ffffff20]"
                      >
                        开始对话
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && !error && filteredCharacters.length === 0 && (
            <div className="text-center py-12">
              <div className="text-white/60 mb-4">
                {query ? `没有找到包含"${query}"的角色` : "暂无该分类的角色"}
              </div>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setQuery("");
                  loadCharacters();
                }}
                className="px-4 py-2 border-2 border-white/30 rounded-none bg-transparent text-white hover:border-white/50 hover:bg-white/10 transition-colors"
              >
                查看所有角色
              </button>
            </div>
          )}
        </section>

        <section className="mt-12 p-4 border-2 border-white/20 rounded-none bg-transparent">
          <h2 className="text-lg font-semibold uppercase tracking-wide mb-4 text-white">角色统计</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => {
              const count = category.id === "all" 
                ? characters.length 
                : characters.filter(char => getCategory(char) === category.id).length;
              return (
                <div key={category.id} className="text-center p-3 border border-white/20 rounded-none">
                  <div className="text-2xl font-bold text-white">{count}</div>
                  <div className="text-sm text-white/60">{category.name}角色</div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
