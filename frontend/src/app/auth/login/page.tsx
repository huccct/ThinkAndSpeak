"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useAuthLogin, useAuthLoading, useAuthError } from "@/modules/auth/auth.store";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [localError, setLocalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const login = useAuthLogin();
  const loading = useAuthLoading();
  const apiError = useAuthError();

  useEffect(() => {
    // 检查URL参数，显示注册成功消息
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('registered') === 'true') {
        setSuccessMessage("注册成功！请使用您的账户登录。");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    
    if (!formData.username.trim()) {
      setLocalError("请输入用户名");
      return;
    }
    
    if (!formData.password.trim()) {
      setLocalError("请输入密码");
      return;
    }
    
    try {
      await login(formData.username, formData.password);
      
      window.location.href = "/";
    } catch (error) {
      console.error("登录失败:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
      <div className="mx-auto w-full max-w-md px-6 py-10">
        <header className="mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
          <h1 className="text-2xl font-semibold uppercase tracking-wider">用户登录</h1>
          <p className="mt-1 text-sm text-white/60">登录您的 Think·Speak 账户</p>
        </header>

        <Card className="bg-transparent border-2 border-white/30 rounded-none shadow-[6px_6px_0_0_#ffffff20]">
          <CardHeader className="px-6 pb-0">
            <CardTitle className="text-white uppercase tracking-wide">登录</CardTitle>
            <CardDescription className="text-white/60">
              请输入您的用户名和密码
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {successMessage && (
              <div className="mb-4 p-3 border-2 border-green-400 bg-green-400/10 rounded-none text-green-400 text-sm">
                {successMessage}
              </div>
            )}
            
            {(localError || apiError) && (
              <div className="mb-4 p-3 border-2 border-red-400 bg-red-400/10 rounded-none text-red-400 text-sm">
                {localError || apiError}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                  用户名
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="输入您的用户名"
                  className="border-2 border-white/40 rounded-none focus-visible:border-white focus-visible:ring-0 shadow-[4px_4px_0_0_#ffffff20] bg-black text-white placeholder:text-white/40"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  密码
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="输入您的密码"
                  className="border-2 border-white/40 rounded-none focus-visible:border-white focus-visible:ring-0 shadow-[4px_4px_0_0_#ffffff20] bg-black text-white placeholder:text-white/40"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="cursor-pointer w-full rounded-none border-2 border-white bg-white text-black hover:bg-white/90 transition-colors shadow-[4px_4px_0_0_#ffffff20] disabled:opacity-50"
              >
                {loading ? "登录中..." : "登录"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-white/60">
                还没有账户？{" "}
                <Link href="/auth/register" className="text-white hover:text-white/80 transition-colors">
                  立即注册
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
