import type { Metadata } from "next";
import { AppShell } from "../components/app-shell";
import { getOptionalSessionUser } from "../lib/auth";
import "./global.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "页码 - 前端智能判题系统",
  description: "面向前端练习场景的在线判题系统，支持账号登录、提交评测与结构化报告查看。",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getOptionalSessionUser();

  return (
    <html lang="zh-CN" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className="min-h-screen bg-background text-foreground">
        <AppShell user={user}>{children}</AppShell>
      </body>
    </html>
  );
}
