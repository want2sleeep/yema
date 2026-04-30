"use client";

import Link from "next/link";
import { EvaluationReport, Submission } from "@yema/shared";
import { formatSubmissionStatus } from "../lib/submission-status";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const textTranslationMap: Record<string, string> = {
  "This submission already forms a fairly complete page implementation and is ready for refinement.":
    "本次提交已经形成了较为完整的页面实现，可以继续做细节优化。",
  "This submission completes the base flow, but still needs fixes in structure or styling.":
    "本次提交已经跑通基础流程，但在结构、样式或稳定性上仍需继续修改。",
  "Evaluates functional completion from required structure, text and rule hits.":
    "根据必需结构、文本命中情况和规则命中情况评估功能完成度。",
  "Evaluates code quality from static checks and template compliance.":
    "根据静态分析、ESLint 与模板符合度评估代码质量。",
  "Evaluates browser rendering, DOM checks, text checks and screenshot evidence.":
    "根据浏览器渲染结果、DOM 检查、文本检查和截图证据评估页面表现。",
  "Evaluates file completeness and submission hygiene.":
    "根据文件完整性、运行稳定性和提交规范评估工程规范。",
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

function t(value: string) {
  return textTranslationMap[value] ?? value;
}

function resolveArtifactUrl(value?: string) {
  if (!value) {
    return value;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return new URL(value, API_BASE.replace(/\/api\/?$/, "/")).toString();
}

export function ReportView({ submission, report }: { submission: Submission; report: EvaluationReport }) {
  const isCompleted = submission.status === "completed";

  return (
    <section className="flex flex-col gap-6">
      <Card className="flex items-center justify-between p-8">
        <div>
          <Badge
            className={cn(
              "mb-3 font-bold uppercase",
              isCompleted ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"
            )}
            variant="secondary"
          >
            {formatSubmissionStatus(submission.status)}
          </Badge>
          <div className="my-4 text-6xl font-extrabold tracking-tight text-foreground">{report.totalScore}</div>
          <div className="text-sm font-medium text-muted-foreground">综合得分（百分制）</div>
        </div>
        <div className="flex gap-8">
          {[
            { label: "功能", value: report.dimensions.correctness.score },
            { label: "代码", value: report.dimensions.codeQuality.score },
            { label: "渲染", value: report.dimensions.uiRendering.score },
            { label: "规范", value: report.dimensions.engineering.score },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1 text-center">
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "功能完成度", dim: report.dimensions.correctness },
          { label: "代码质量", dim: report.dimensions.codeQuality },
          { label: "页面渲染", dim: report.dimensions.uiRendering },
          { label: "工程规范", dim: report.dimensions.engineering },
        ].map((item) => (
          <Card key={item.label} className="flex flex-col gap-3 p-6">
            <div className="flex items-center justify-between">
              <strong className="text-sm">{item.label}</strong>
              <span className="text-xs text-muted-foreground">
                {item.dim.score}/{item.dim.maxScore}
              </span>
            </div>
            <Progress value={(item.dim.score / item.dim.maxScore) * 100} />
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t(item.dim.summary)}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <CardHeader className="mb-4 p-0">
            <CardTitle className="text-lg font-bold">评测证据</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-0">
            {report.evidence.map((item) => (
              <div key={item.id} className="rounded-lg border bg-muted/20 p-4 transition-colors hover:bg-muted/30">
                <div className="mb-1 flex items-center justify-between">
                  <strong className="text-sm">{item.title}</strong>
                  <span className={cn("text-xs font-bold", item.scoreImpact < 0 ? "text-red-600" : "text-green-600")}>
                    {item.scoreImpact > 0 ? "+" : ""}
                    {item.scoreImpact}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="mb-4 p-0">
            <CardTitle className="text-lg font-bold">智能反馈</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-0">
            {report.llmFeedback ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-lg bg-blue-50 p-4">
                  <Badge
                    variant="secondary"
                    className="mb-2 bg-blue-100 text-[10px] font-bold uppercase text-blue-700 hover:bg-blue-200"
                  >
                    AI 总结
                  </Badge>
                  <p className="text-sm leading-relaxed text-blue-900">{report.llmFeedback.summary}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-green-50 p-4">
                    <div className="mb-2 text-xs font-bold text-green-700">优势</div>
                    <ul className="list-inside list-disc space-y-1 text-xs text-green-700/80">
                      {report.llmFeedback.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-4">
                    <div className="mb-2 text-xs font-bold text-amber-700">建议</div>
                    <ul className="list-inside list-disc space-y-1 text-xs text-amber-700/80">
                      {report.llmFeedback.weaknesses.map((weakness, index) => (
                        <li key={index}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                正在生成智能反馈...
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="p-6">
        <CardHeader className="mb-4 p-0">
          <CardTitle className="text-lg font-bold">渲染截图</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {report.artifacts?.screenshotUrl ? (
            <div className="my-4 overflow-hidden rounded-lg border bg-muted/20">
              <img
                src={resolveArtifactUrl(report.artifacts.screenshotUrl)}
                alt="提交页面渲染截图"
                className="mx-auto block h-auto max-w-full shadow-lg"
              />
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              暂无截图产物。
            </div>
          )}
          <div className="mt-8 flex justify-end">
            <Link
              href={`/problems/${report.problemId}`}
              className={buttonVariants({ size: "lg", className: "font-bold" })}
            >
              返回题目页
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
