"use client";

import { useEffect, useState } from "react";
import { EvaluationReport, Submission } from "@yema/shared";
import { getSubmission, tryGetReport } from "../lib/api";
import { ReportView } from "./report-view";

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
        <div className="pill">Submission</div>
        <h2>Evaluation Status</h2>
        <p className="muted">{error}</p>
      </section>
    );
  }

  if (!submission || !report) {
    return (
      <section className="panel report-card">
        <div className="pill">Submission</div>
        <h2>Evaluation in Progress</h2>
        <p className="status">Current status: {submission?.status ?? "queued"}</p>
        <p className="muted">
          The submission has been stored and queued. This page is polling until the structured report is ready.
        </p>
      </section>
    );
  }

  return <ReportView submission={submission} report={report} />;
}
