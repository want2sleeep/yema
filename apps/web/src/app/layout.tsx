import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SessionControls } from "../components/session-controls";
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
        <div className="app-shell">
          <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex shrink-0 items-center">
                <Image
                  src="/branding/yema-logo-with-words.png"
                  alt="Yema logo"
                  width={100}
                  height={32}
                  className="h-7 w-auto"
                  priority
                />
              </Link>
              <div className="hidden h-4 w-px bg-border md:block" />
              <p className="hidden whitespace-nowrap text-sm text-muted-foreground lg:block">
                面向前端练习场景的智能评测系统
              </p>
            </div>

            <nav className="flex items-center gap-1">
              <Link 
                href="/" 
                className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                题目列表
              </Link>
              <Link 
                href="/submissions" 
                className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                我的提交
              </Link>
              <div className="mx-3 h-4 w-px bg-border" />
              <SessionControls user={user} />
            </nav>
          </header>

          <main className="flex flex-col gap-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
