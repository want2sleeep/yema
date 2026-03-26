import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "页码 - 前端智能判题系统",
  description: "基于大语言模型的前端在线判题系统 MVP",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="app-shell">
          <header className="page-header">
            <div>
              <div className="pill">本科毕设 MVP</div>
              <h1>页码：前端智能判题系统</h1>
              <p className="muted">面向前端作业场景，支持结构化评分、页面渲染分析与智能教学反馈。</p>
            </div>
            <div className="header-actions">
              <Link href="/submissions" className="button secondary">
                提交记录
              </Link>
              <Link href="/" className="button secondary">
                返回题目
              </Link>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
