"use client";

import { useEffect, useState } from "react";
import { EvaluationReport, Submission } from "@yema/shared";
import { getSubmission, tryGetReport } from "../lib/api";
import { ReportView } from "./report-view";

const statusLabelMap = {
  queued: "排队中",
  running: "评测中",
  completed: "已完成",
  failed: "已失败",
} as const;

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

        if (currentSubmission.status === "completed") {
          const currentReport = await tryGetReport(submissionId);

          if (!cancelled) {
            setReport(currentReport);
          }

          return;
        }

        if (currentSubmission.status === "failed") {
          setError("Evaluation failed. Please review the backend logs and try again.");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load submission");
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
        <p className="status">当前状态：{statusLabelMap[submission?.status ?? "queued"]}</p>
        <p className="muted">
          提交已经保存并进入评测队列，页面会持续轮询，直到结构化报告生成完成。
        </p>
      </section>
    );
  }

  return <ReportView submission={submission} report={report} />;
}
