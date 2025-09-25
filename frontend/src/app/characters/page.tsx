"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CHARACTERS } from "@/lib/characters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Category = "all" | "philosophy" | "mystery" | "fantasy";

const categories = [
  { id: "all", name: "全部", count: CHARACTERS.length },
  { id: "philosophy", name: "哲学", count: CHARACTERS.filter(c => c.id === "socrates").length },
  { id: "mystery", name: "推理", count: CHARACTERS.filter(c => c.id === "sherlock").length },
  { id: "fantasy", name: "奇幻", count: CHARACTERS.filter(c => c.id === "harry").length },
];

const getCategory = (characterId: string): Category => {
  switch (characterId) {
    case "socrates": return "philosophy";
    case "sherlock": return "mystery";
    case "harry": return "fantasy";
    default: return "all";
  }
};

export default function CharactersPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");

  const filteredCharacters = useMemo(() => {
    if (selectedCategory === "all") return CHARACTERS;
    return CHARACTERS.filter(char => getCategory(char.id) === selectedCategory);
  }, [selectedCategory]);

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
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCharacters.map((character) => (
              <Card
                key={character.id}
                className="group bg-transparent border-2 border-white/20 hover:border-white/40 transition-colors shadow-[6px_6px_0_0_#ffffff20]"
              >
                <CardHeader className="px-5 pb-0">
                  <CardTitle className="text-white uppercase tracking-wide">
                    {character.name}
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    {getCategory(character.id) === "philosophy" && "哲学思考 · 智慧对话"}
                    {getCategory(character.id) === "mystery" && "逻辑推理 · 案件分析"}
                    {getCategory(character.id) === "fantasy" && "魔法世界 · 冒险故事"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {character.sampleTopics.slice(0, 3).map((topic, i) => (
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
                    {character.id === "harry" && "年轻的魔法师，勇敢真诚，带你探索霍格沃茨的魔法世界。"}
                    {character.id === "socrates" && "古希腊哲学家，善用提问引导思考，助你探索智慧与真理。"}
                    {character.id === "sherlock" && "天才侦探，冷静理性，与你一起分析案件，训练观察力。"}
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

          {filteredCharacters.length === 0 && (
            <div className="text-center py-12">
              <div className="text-white/60 mb-4">暂无该分类的角色</div>
              <button
                onClick={() => setSelectedCategory("all")}
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
            {categories.slice(1).map((category) => (
              <div key={category.id} className="text-center p-3 border border-white/20 rounded-none">
                <div className="text-2xl font-bold text-white">{category.count}</div>
                <div className="text-sm text-white/60">{category.name}角色</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
