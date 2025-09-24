"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CHARACTERS } from "@/lib/characters";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return CHARACTERS;
    return CHARACTERS.filter(
      (c) => c.name.toLowerCase().includes(s) || c.id.includes(s)
    );
  }, [q]);

  // 初次加载短骨架
  useState(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  });

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
          <nav className="flex items-center gap-2">
            <Link href="/settings" className="text-sm text-white/70 hover:text-white">
              Settings
            </Link>
          </nav>
        </header>

        <section className="mt-12">
          <h1 className="text-2xl font-semibold uppercase tracking-wider">角色搜索</h1>
          <p className="mt-1 text-sm text-white/60">选择一个角色，开始语音对话。</p>
          <div className="mt-5">
            <div className="relative">
              <Input
                placeholder="搜索：哈利、苏格拉底、福尔摩斯…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-11 border-2 rounded-none border-white/40 text-white placeholder:text-white/40 focus-visible:border-white focus-visible:ring-0 shadow-[4px_4px_0_0_#ffffff20]"
              />
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/40 text-sm">
                ⌘K
              </div>
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
                : list.length > 0
              ? list.map((c) => (
                  <Card
                    key={c.id}
                    className="group bg-transparent border-2 rounded-none border-white/30 hover:border-white/60 transition-colors shadow-[6px_6px_0_0_#ffffff20]"
                  >
                    <CardHeader className="px-5 pb-0">
                      <CardTitle className="text-white uppercase tracking-wide">{c.name}</CardTitle>
                      <CardDescription className="text-white/60">
                        {c.sampleTopics.slice(0, 2).join(" · ")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                      <div className="flex flex-wrap gap-2">
                        {c.sampleTopics.map((t, i) => (
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
                        <Link
                          href={`/chat/${c.id}`}
                          className="block w-full rounded-none border-2 border-white/40 px-4 py-2 text-center text-sm text-white transition-colors hover:border-white/80 hover:bg-white/10 shadow-[4px_4px_0_0_#ffffff20]"
                        >
                          开始对话
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              : (
                  <div className="col-span-full text-center text-sm text-white/60">
                    未找到匹配角色，试试：
                    <span className="mx-2 rounded bg-white/5 px-2 py-1">哈利</span>
                    <span className="mx-2 rounded bg-white/5 px-2 py-1">苏格拉底</span>
                    <span className="mx-2 rounded bg-white/5 px-2 py-1">福尔摩斯</span>
                  </div>
                )}
          </div>
        </section>

        {!q && !loading && (
          <section className="mt-10">
            <h2 className="text-sm font-medium text-white/80 uppercase tracking-wider">快速开始</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {CHARACTERS.slice(0, 3).map((c) => (
                <Link key={c.id} href={`/chat/${c.id}`}>
                  <div className="group rounded-none border-2 border-white/30 p-4 hover:border-white/60 shadow-[4px_4px_0_0_#ffffff20]">
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="mt-1 text-xs text-white/60">
                      {c.sampleTopics[0]}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
