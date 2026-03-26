import Link from "next/link";
import { EvaluationReport, Submission } from "@yema/shared";

const categoryLabelMap = {
  static: "静态分析",
  render: "渲染分析",
  llm: "智能反馈",
  system: "系统",
} as const;

const statusLabelMap = {
  queued: "排队中",
  running: "评测中",
  completed: "已完成",
  failed: "已失败",
} as const;

const textTranslationMap: Record<string, string> = {
  "This submission already forms a fairly complete page implementation and is ready for refinement.":
    "本次提交已经完成了较为完整的页面实现，可以继续做细节优化。",
  "This submission completes the base flow, but still needs fixes in structure or styling.":
    "本次提交已经跑通基础流程，但在结构、样式或稳定性上仍需继续修改。",
  "Evaluates functional completion from required structure, text and rule hits.":
    "根据必需结构、文本命中情况和规则命中情况评估功能完成度。",
  "Evaluates code quality from static checks and template compliance.":
    "根据静态分析、ESLint 与模板符合度评估代码质量。",
  "Evaluates browser rendering, DOM checks, text checks and screenshot evidence.":
    "根据浏览器渲染结果、DOM 检查、文本检查和截图证据评估页面表现。",
  "Evaluates file completeness and submission hygiene.": "根据文件完整性、运行稳定性和提交规范评估工程规范。",
};

function t(value: string) {
  return textTranslationMap[value] ?? value;
}

export function ReportView({ submission, report }: { submission: Submission; report: EvaluationReport }) {
  return (
    <section className="grid">
      <article className="panel report-card">
        <div className="pill">提交报告</div>
        <h2>结构化评测报告</h2>
        <p className="status">当前状态：{statusLabelMap[submission.status]}</p>
        <div className="score">{report.totalScore} 分</div>
        <p className="muted">{t(report.summary)}</p>
        <div className="meta-grid">
          <div className="evidence-item">
            <h3>功能正确性</h3>
            <p>
              {report.dimensions.correctness.score} / {report.dimensions.correctness.maxScore}
            </p>
            <p className="muted">{t(report.dimensions.correctness.summary)}</p>
          </div>
          <div className="evidence-item">
            <h3>代码质量</h3>
            <p>
              {report.dimensions.codeQuality.score} / {report.dimensions.codeQuality.maxScore}
            </p>
            <p className="muted">{t(report.dimensions.codeQuality.summary)}</p>
          </div>
          <div className="evidence-item">
            <h3>页面渲染</h3>
            <p>
              {report.dimensions.uiRendering.score} / {report.dimensions.uiRendering.maxScore}
            </p>
            <p className="muted">{t(report.dimensions.uiRendering.summary)}</p>
          </div>
          <div className="evidence-item">
            <h3>工程规范</h3>
            <p>
              {report.dimensions.engineering.score} / {report.dimensions.engineering.maxScore}
            </p>
            <p className="muted">{t(report.dimensions.engineering.summary)}</p>
          </div>
        </div>
      </article>

      <article className="panel report-card">
        <h3>证据项</h3>
        <div className="evidence-list">
          {report.evidence.map((item) => (
            <div key={item.id} className="evidence-item">
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
              <p className="muted">
                类别：{categoryLabelMap[item.category]} | 分值影响：{item.scoreImpact}
              </p>
            </div>
          ))}
        </div>
      </article>

      <article className="panel report-card">
        <h3>渲染截图</h3>
        {report.artifacts?.screenshotUrl ? (
          <div className="render-artifact">
            <img src={report.artifacts.screenshotUrl} alt="提交页面渲染截图" className="render-image" />
          </div>
        ) : (
          <p className="muted">当前提交暂时还没有可用的截图产物。</p>
        )}
        {report.renderDetails ? (
          <div className="evidence-list">
            <div className="evidence-item">
              <strong>渲染状态</strong>
              <p>{report.renderDetails.renderOk ? "Playwright 检查通过" : "Playwright 发现渲染问题"}</p>
              <p className="muted">
                缺失选择器：
                {report.renderDetails.missingSelectors.length > 0
                  ? report.renderDetails.missingSelectors.join(", ")
                  : "无"}
              </p>
              <p className="muted">
                缺失文本：
                {report.renderDetails.missingTexts.length > 0
                  ? report.renderDetails.missingTexts.join(", ")
                  : "无"}
              </p>
            </div>
            <div className="evidence-item">
              <strong>浏览器诊断</strong>
              <p>{report.renderDetails.loadError ?? "页面已在 Chromium 中成功加载。"}</p>
              <p className="muted">
                控制台错误：
                {report.renderDetails.consoleErrors.length > 0
                  ? report.renderDetails.consoleErrors.join(" | ")
                  : "无"}
              </p>
            </div>
          </div>
        ) : null}
      </article>

      <article className="panel report-card">
        <h3>改进建议</h3>
        <div className="tips-list">
          {report.suggestions.map((tip) => (
            <div className="tip-item" key={tip}>
              {tip}
            </div>
          ))}
        </div>
        {report.llmFeedback ? (
          <>
            <h3>智能反馈摘要</h3>
            <p>{report.llmFeedback.summary}</p>
            <p className="muted">优点：{report.llmFeedback.strengths.join("；")}</p>
            <p className="muted">不足：{report.llmFeedback.weaknesses.join("；")}</p>
          </>
        ) : null}
        <Link href={`/problems/${report.problemId}`} className="button">
          返回作答页
        </Link>
      </article>
    </section>
  );
}
