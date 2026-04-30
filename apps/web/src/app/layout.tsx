import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SessionControls } from "../components/session-controls";
import { getOptionalSessionUser } from "../lib/auth";
import "./global.css";

export const metadata: Metadata = {
  title: "页码 - 前端智能判题系统",
  description: "面向前端练习场景的在线判题系统，支持账号登录、提交评测与结构化报告查看。",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getOptionalSessionUser();

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <div className="app-shell">
          <header className="page-header">
            <div className="brand-block">
              <Image
                src="/branding/yema-logo.png"
                alt="Yema logo"
                width={65}
                height={32.5}
                className="brand-logo-image"
                priority
              />
              <p className="muted brand-summary">
                面向前端练习场景，支持账号登录、代码提交、自动评测与结构化报告查看。
              </p>
            </div>
            <div className="header-actions">
              <Link href="/" className="button secondary">
                题目列表
              </Link>
              <SessionControls user={user} />
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
