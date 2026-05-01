"use client";

import { useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { AuthUser, Problem, SubmissionFile } from "@yema/shared";
import { ApiError, createSubmission } from "../lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const difficultyLabelMap = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
} as const;

const difficultyColorMap = {
  easy: "text-green-600",
  medium: "text-amber-600",
  hard: "text-red-600",
} as const;

function formatSubmitError(error: unknown) {
  if (error instanceof ApiError && error.status === 401) {
    return "请先登录后再提交。";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "提交失败，请稍后重试。";
}

export function CodeWorkspace({ problem, currentUser }: { problem: Problem; currentUser: AuthUser | null }) {
  const router = useRouter();
  const initialFiles = useMemo<SubmissionFile[]>(
    () => problem.templateFiles.map((file) => ({ path: file.path, content: file.content })),
    [problem.templateFiles],
  );
  const [files, setFiles] = useState<SubmissionFile[]>(initialFiles);
  const [activePath, setActivePath] = useState<string>(initialFiles[0]?.path ?? "");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const activeFile = files.find((file) => file.path === activePath) ?? files[0];

  function updateFileContent(content: string | undefined) {
    if (!activeFile) {
      return;
    }

    setFiles((current) =>
      current.map((file) => (file.path === activeFile.path ? { ...file, content: content ?? "" } : file)),
    );
  }

  function handleSubmit() {
    if (!currentUser) {
      window.location.href = `/auth?mode=login&returnTo=/problems/${problem.id}`;
      return;
    }

    startTransition(async () => {
      try {
        setSubmitError(null);
        const result = await createSubmission({
          problemId: problem.id,
          files,
        });

        router.push(`/submissions/${result.submissionId}/report`);
      } catch (error) {
        setSubmitError(formatSubmitError(error));
      }
    });
  }

  return (
    <section className="container mx-auto grid h-[calc(100vh-160px)] min-h-[600px] grid-cols-[450px_1fr] gap-4 px-4 py-6 md:px-6">
      <aside className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
        <header className="flex items-center gap-3 border-b px-5 py-4">
          <span className={cn("text-sm font-bold", difficultyColorMap[problem.difficulty])}>
            {difficultyLabelMap[problem.difficulty]}
          </span>
          <span className="text-sm text-muted-foreground">题目 ID: {problem.id}</span>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          <h2 className="mt-0 text-xl font-bold">{problem.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{problem.description}</p>

          <h3 className="mb-3 mt-6 border-b pb-2 text-base font-bold">完成要求</h3>
          <ul className="list-inside list-disc space-y-1 text-sm leading-relaxed">
            {problem.config.requirements.map((item, index) => (
              <li key={`${index}-${item}`}>{item}</li>
            ))}
          </ul>

          <h3 className="mb-3 mt-6 border-b pb-2 text-base font-bold">评分维度</h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              { label: "功能完成度", weight: problem.config.weights.correctness },
              { label: "代码质量", weight: problem.config.weights.codeQuality },
              { label: "页面渲染", weight: problem.config.weights.uiRendering },
              { label: "工程规范", weight: problem.config.weights.engineering },
            ].map((dim) => (
              <div key={dim.label} className="rounded-lg border bg-muted/20 p-3 text-center transition-colors hover:bg-muted/30">
                <div className="text-[12px] text-muted-foreground">{dim.label}</div>
                <div className="font-bold">{dim.weight}x</div>
              </div>
            ))}
          </div>

          <h3 className="mb-3 mt-6 border-b pb-2 text-base font-bold">关键规则</h3>
          <ul className="space-y-2 text-[14px] leading-relaxed">
            {problem.config.evaluationRules.slice(0, 5).map((rule) => (
              <li key={rule.id}>
                <strong className="text-foreground">{rule.title}</strong>: <span className="text-muted-foreground">{rule.description}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-lg bg-muted/30 p-3 text-xs">
            <span className="text-muted-foreground">评测视口：{problem.config.renderConfig.viewportWidth} x {problem.config.renderConfig.viewportHeight}</span>
          </div>

          {!currentUser && (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <strong className="text-sm text-amber-800">需要登录</strong>
              <p className="mt-1 text-xs text-amber-700">登录后即可提交代码并查看详细报告。</p>
            </div>
          )}
        </div>
      </aside>

      <div className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
        <header className="flex items-center justify-between border-b bg-muted/20 px-3 py-2">
          <div className="flex gap-1">
            {files.map((file) => (
              <button
                key={file.path}
                type="button"
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  file.path === activePath 
                    ? "bg-background text-primary shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                onClick={() => setActivePath(file.path)}
              >
                {file.path}
              </button>
            ))}
          </div>
          {submitError && <span className="text-xs font-bold text-destructive">{submitError}</span>}
        </header>

        <div className="flex-1">
          {activeFile ? (
            <MonacoEditor
              height="100%"
              theme="vs-light"
              defaultLanguage={activeFile.path.endsWith(".css") ? "css" : "html"}
              language={activeFile.path.endsWith(".css") ? "css" : "html"}
              value={activeFile.content}
              onChange={updateFileContent}
              options={{
                fontSize: 14,
                lineHeight: 22,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16 },
                automaticLayout: true,
              }}
            />
          ) : null}
        </div>

        <footer className="flex justify-end gap-3 border-t bg-muted/20 px-5 py-3">
          <Button variant="outline" size="sm" className="font-bold" onClick={() => router.back()}>
            返回
          </Button>
          <Button size="sm" className="font-bold" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "提交中..." : "提交评测"}
          </Button>
        </footer>
      </div>
    </section>
  );
}
