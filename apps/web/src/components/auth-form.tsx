"use client";

import { useState, useTransition } from "react";
import { ApiError, login, register } from "../lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type AuthMode = "login" | "register";

function formatAuthError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "邮箱或密码不正确。";
    }

    if (error.status === 409) {
      return "该邮箱已被注册。";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "认证失败，请稍后重试。";
}

export function AuthForm({ initialMode, returnTo }: { initialMode: AuthMode; returnTo: string }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        setError(null);

        if (mode === "login") {
          await login({
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
          });
        } else {
          await register({
            name: String(formData.get("name") ?? ""),
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
          });
        }

        window.location.href = returnTo;
      } catch (submitError) {
        setError(formatAuthError(submitError));
      }
    });
  }

  return (
    <div className="container mx-auto flex justify-center py-12 px-4 md:py-16">
      <Card className="w-full max-w-[520px] shadow-lg border-border">
        <CardHeader className="text-left space-y-2">
          <Badge variant="secondary" className="w-fit font-bold">账号</Badge>
          <CardTitle className="text-2xl font-bold">{mode === "login" ? "欢迎回来" : "创建页码账号"}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {mode === "login"
              ? "登录后即可提交代码并查看你的评测记录。"
              : "注册账号后可以保存提交记录、评测报告和练习进度。"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-2 mb-6">
            <Button
              variant={mode === "login" ? "secondary" : "ghost"}
              className={cn(mode === "login" && "bg-muted shadow-sm font-bold")}
              onClick={() => setMode("login")}
            >
              登录
            </Button>
            <Button
              variant={mode === "register" ? "secondary" : "ghost"}
              className={cn(mode === "register" && "bg-muted shadow-sm font-bold")}
              onClick={() => setMode("register")}
            >
              注册
            </Button>
          </div>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit(new FormData(event.currentTarget));
            }}
          >
            {mode === "register" ? (
              <div className="space-y-2">
                <Label htmlFor="name">昵称</Label>
                <Input id="name" name="name" type="text" minLength={2} required className="bg-muted/30 border-border focus-visible:ring-primary/20" />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required className="bg-muted/30 border-border focus-visible:ring-primary/20" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={8}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                className="bg-muted/30 border-border focus-visible:ring-primary/20"
              />
            </div>

            {error ? <p className="text-sm font-bold text-destructive animate-pulse">{error}</p> : null}

            <Button type="submit" className="w-full font-bold shadow-md hover:shadow-lg transition-all" disabled={isPending}>
              {mode === "login" ? (isPending ? "登录中..." : "登录") : isPending ? "注册中..." : "创建账号"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
