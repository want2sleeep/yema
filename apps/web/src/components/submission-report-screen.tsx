"use client";

import { useEffect, useState, useMemo } from "react";
import { EvaluationReport, Submission } from "@yema/shared";
import { ApiError, getSubmission, tryGetReport } from "../lib/api";
import { formatSubmissionStatus } from "../lib/submission-status";
import { ReportView } from "./report-view";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Circle, AlertCircle, Sparkles, Code2, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

function formatLoadError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 404) return "未找到对应的提交记录。";
    if (error.status >= 500) return "服务暂时不可用，请稍后重试。";
  }
  return (error instanceof Error && error.message) ? error.message : "加载提交记录失败，请稍后重试。";
}

const EVALUATION_STEPS = [
  { id: "queued", label: "进入评测队列", icon: Circle },
  { id: "static", label: "静态语法扫描", icon: Code2 },
  { id: "render", label: "浏览器渲染检查", icon: Monitor },
  { id: "llm", label: "AI 智能行为分析", icon: Sparkles },
];

const WAIT_TIPS = [
  "小提示：语义化的 HTML 结构不仅有利于 SEO，还能让 AI 更容易读懂你的意图。",
  "正在唤醒 Chromium 浏览器进行视觉比对...",
  "正在由 LLM 审阅你的代码规范性...",
  "评测器正在检查你的 CSS 选择器是否符合要求...",
  "如果你使用了 Flexbox，别忘了检查 align-items 的表现。",
  "你知道吗？优秀的 UI 离不开合理的间距与层级感。",
];

export function SubmissionReportScreen({ submissionId }: { submissionId: string }) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tipIndex, setWaitTipIndex] = useState(0);

  // 模拟进度条
  const progressValue = useMemo(() => {
    if (!submission) return 5;
    if (submission.status === "queued") return 20;
    if (submission.status === "running") return 65;
    if (submission.status === "completed") return 100;
    return 0;
  }, [submission]);

  useEffect(() => {
    setSubmission(null);
    setReport(null);
    setError(null);
    setWaitTipIndex(0);
  }, [submissionId]);

  useEffect(() => {
    const isWaiting = !report && !error && submission?.status !== "failed";
    if (!isWaiting) {
      return;
    }

    const tipTimer = window.setInterval(() => {
      setWaitTipIndex((prev) => (prev + 1) % WAIT_TIPS.length);
    }, 4000);

    return () => window.clearInterval(tipTimer);
  }, [error, report, submission?.status]);

  useEffect(() => {
    let isActive = true;

    async function load() {
      try {
        const currentSubmission = await getSubmission(submissionId);
        if (!isActive) return;
        setSubmission(currentSubmission);
        setError(null);

        if (currentSubmission.status === "completed") {
          const currentReport = await tryGetReport(submissionId);
          if (!isActive) return;
          setReport(currentReport);
          return;
        }

        if (currentSubmission.status === "failed") {
          setError("评测系统在执行过程中遇到严重错误，请检查代码或重试。");
        }
      } catch (loadError) {
        if (!isActive) return;
        setError(formatLoadError(loadError));
      }
    }

    void load();
    if (report) {
      return () => {
        isActive = false;
      };
    }

    const timer = window.setInterval(() => {
      void load();
    }, 1500);
    return () => {
      isActive = false;
      window.clearInterval(timer);
    };
  }, [report, submissionId]);

  if (error) {
    return (
      <div className="flex justify-center py-12">
        <Card className="w-full max-w-2xl border-destructive/20 bg-destructive/5 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold text-destructive">评测异常</CardTitle>
            <CardDescription className="text-destructive/80 font-medium">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!submission || !report) {
    const currentStatus = submission?.status ?? "queued";
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 space-y-8">
        <Card className="w-full max-w-2xl shadow-xl border-border bg-card">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-between items-center mb-4">
              <Badge variant="outline" className="bg-muted text-muted-foreground border-border px-3 py-1">
                提交 ID: {submissionId.slice(0, 8)}
              </Badge>
              <div className="flex items-center gap-2 text-primary font-bold">
                <Loader2 className="h-4 w-4 animate-spin" />
                正在评测
              </div>
            </div>
            <CardTitle className="text-2xl font-black tracking-tight">系统正在深度审阅代码</CardTitle>
            <CardDescription className="text-base mt-2">
              系统正在通过多维度引擎对你的前端实现进行自动化打分
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-bold">
                <span>总体进度</span>
                <span className="text-primary">{progressValue}%</span>
              </div>
              <Progress value={progressValue} className="h-3 shadow-inner" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EVALUATION_STEPS.map((step) => {
                const isActive = (step.id === "queued" && currentStatus === "queued") || 
                                (step.id !== "queued" && currentStatus === "running");
                const isDone = (step.id === "queued" && currentStatus !== "queued");
                const Icon = step.icon;

                return (
                  <div 
                    key={step.id} 
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border transition-all duration-300",
                      isActive ? "bg-primary/5 border-primary/20 shadow-sm scale-[1.02]" : 
                      isDone ? "bg-green-50/50 border-green-100 opacity-80" : "bg-muted/30 border-transparent opacity-40"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      isActive ? "bg-primary text-primary-foreground animate-pulse" : 
                      isDone ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
                    )}>
                      {isDone ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <span className={cn(
                      "text-sm font-bold",
                      isActive ? "text-primary" : isDone ? "text-green-700" : "text-muted-foreground"
                    )}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="rounded-lg bg-blue-50/50 border border-blue-100 p-6 text-center transition-all duration-500 min-h-[100px] flex items-center justify-center">
              <p className="text-sm font-medium text-blue-700 leading-relaxed italic">
                “ {WAIT_TIPS[tipIndex]} ”
              </p>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-xs text-muted-foreground animate-pulse">
          页面将根据评测状态自动刷新，请勿关闭窗口...
        </p>
      </div>
    );
  }

  return <ReportView submission={submission} report={report} />;
}
