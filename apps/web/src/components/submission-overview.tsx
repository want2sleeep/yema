import Link from "next/link";
import { SubmissionStatus, SubmissionSummary } from "@yema/shared";

const statusLabelMap: Record<SubmissionStatus, string> = {
  queued: "排队中",
  running: "评测中",
  completed: "已完成",
  failed: "已失败",
};

const summaryTranslationMap: Record<string, string> = {
  "This submission already forms a fairly complete page implementation and is ready for refinement.":
    "本次提交已经完成了较为完整的页面实现，可以继续做细节优化。",
  "This submission completes the base flow, but still needs fixes in structure or styling.":
    "本次提交已经跑通基础流程，但在结构、样式或稳定性上仍需继续修改。",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function translateSummary(value?: string) {
  if (!value) {
    return value;
  }

  return summaryTranslationMap[value] ?? value;
}

export function SubmissionOverview({ submissions }: { submissions: SubmissionSummary[] }) {
  return (
    <section className="grid">
      <article className="panel report-card">
        <div className="pill">提交记录</div>
        <h2>评测总览</h2>
        <p className="muted">参考 OJ 的提交列表视图，集中展示最近提交的状态、分数、时间和详细报告入口。</p>
      </article>

      <article className="panel report-card">
        <div className="submission-list">
          {submissions.map((submission) => (
            <div className="submission-item" key={submission.id}>
              <div className="submission-main">
                <div className="submission-header">
                  <div>
                    <strong>{submission.problemTitle}</strong>
                    <p className="muted">提交编号：{submission.id}</p>
                  </div>
                  <span className={`status-badge status-${submission.status}`}>{statusLabelMap[submission.status]}</span>
                </div>
                <p className="muted">用户：{submission.userId}</p>
                <p className="muted">提交时间：{formatDate(submission.createdAt)}</p>
                <p className="muted">
                  总分：{typeof submission.totalScore === "number" ? `${submission.totalScore} 分` : "待生成"}
                </p>
                <p>{translateSummary(submission.reportSummary) ?? "报告尚未生成，系统仍在排队或评测中。"}</p>
              </div>

              <div className="submission-actions">
                <Link href={`/submissions/${submission.id}/report`} className="button">
                  查看报告
                </Link>
                <Link href={`/problems/${submission.problemId}`} className="button secondary">
                  返回题目
                </Link>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
