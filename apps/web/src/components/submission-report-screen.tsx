"use client";

import { useEffect, useState } from "react";
import { EvaluationReport, Submission } from "@yema/shared";
import { ApiError, getSubmission, tryGetReport } from "../lib/api";
import { formatSubmissionStatus } from "../lib/submission-status";
import { ReportView } from "./report-view";

function formatLoadError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return "未找到对应的提交记录。";
    }

    if (error.status >= 500) {
      return "服务暂时不可用，请稍后重试。";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "加载提交记录失败，请稍后重试。";
}

export function SubmissionReportScreen({ submissionId }: { submissionId: string }) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const currentSubmission = await getSubmission(submissionId);

        if (cancelled) {
          return;
        }

        setSubmission(currentSubmission);
        setError(null);

        if (currentSubmission.status === "completed") {
          const currentReport = await tryGetReport(submissionId);

          if (!cancelled) {
            setReport(currentReport);
          }

          return;
        }

        if (currentSubmission.status === "failed") {
          setError("评测失败，请检查后端日志后重试。");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(formatLoadError(loadError));
        }
      }
    }

    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 1500);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [submissionId]);

  if (error) {
    return (
      <section className="panel report-card">
        <div className="pill">提交状态</div>
        <h2>评测异常</h2>
        <p className="muted">{error}</p>
      </section>
    );
  }

  if (!submission || !report) {
    return (
      <section className="panel report-card">
        <div className="pill">提交状态</div>
        <h2>评测进行中</h2>
        <p className="status">当前状态：{formatSubmissionStatus(submission?.status ?? "queued")}</p>
        <p className="muted">提交已经保存并进入评测队列，页面会持续轮询，直到结构化报告生成完成。</p>
      </section>
    );
  }

  return <ReportView submission={submission} report={report} />;
}

