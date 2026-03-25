import Link from "next/link";
import { EvaluationReport, Submission } from "@yema/shared";

export function ReportView({ submission, report }: { submission: Submission; report: EvaluationReport }) {
  return (
    <section className="grid">
      <article className="panel report-card">
        <div className="pill">Submission</div>
        <h2>Structured Evaluation Report</h2>
        <p className="status">Current status: {submission.status}</p>
        <div className="score">{report.totalScore} pts</div>
        <p className="muted">{report.summary}</p>
        <div className="meta-grid">
          <div className="evidence-item">
            <h3>Correctness</h3>
            <p>
              {report.dimensions.correctness.score} / {report.dimensions.correctness.maxScore}
            </p>
            <p className="muted">{report.dimensions.correctness.summary}</p>
          </div>
          <div className="evidence-item">
            <h3>Code Quality</h3>
            <p>
              {report.dimensions.codeQuality.score} / {report.dimensions.codeQuality.maxScore}
            </p>
            <p className="muted">{report.dimensions.codeQuality.summary}</p>
          </div>
          <div className="evidence-item">
            <h3>UI Rendering</h3>
            <p>
              {report.dimensions.uiRendering.score} / {report.dimensions.uiRendering.maxScore}
            </p>
            <p className="muted">{report.dimensions.uiRendering.summary}</p>
          </div>
          <div className="evidence-item">
            <h3>Engineering</h3>
            <p>
              {report.dimensions.engineering.score} / {report.dimensions.engineering.maxScore}
            </p>
            <p className="muted">{report.dimensions.engineering.summary}</p>
          </div>
        </div>
      </article>

      <article className="panel report-card">
        <h3>Evidence</h3>
        <div className="evidence-list">
          {report.evidence.map((item) => (
            <div key={item.id} className="evidence-item">
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
              <p className="muted">
                Category: {item.category} | Score impact: {item.scoreImpact}
              </p>
            </div>
          ))}
        </div>
      </article>

      <article className="panel report-card">
        <h3>Render Snapshot</h3>
        {report.artifacts?.screenshotUrl ? (
          <div className="render-artifact">
            <img src={report.artifacts.screenshotUrl} alt="Rendered submission screenshot" className="render-image" />
          </div>
        ) : (
          <p className="muted">No screenshot artifact is available for this submission yet.</p>
        )}
        {report.renderDetails ? (
          <div className="evidence-list">
            <div className="evidence-item">
              <strong>Render status</strong>
              <p>{report.renderDetails.renderOk ? "Playwright checks passed" : "Playwright found render issues"}</p>
              <p className="muted">
                Missing selectors:{" "}
                {report.renderDetails.missingSelectors.length > 0
                  ? report.renderDetails.missingSelectors.join(", ")
                  : "None"}
              </p>
              <p className="muted">
                Missing text:{" "}
                {report.renderDetails.missingTexts.length > 0
                  ? report.renderDetails.missingTexts.join(", ")
                  : "None"}
              </p>
            </div>
            <div className="evidence-item">
              <strong>Browser diagnostics</strong>
              <p>{report.renderDetails.loadError ?? "Page loaded successfully in Chromium."}</p>
              <p className="muted">
                Console errors:{" "}
                {report.renderDetails.consoleErrors.length > 0
                  ? report.renderDetails.consoleErrors.join(" | ")
                  : "None"}
              </p>
            </div>
          </div>
        ) : null}
      </article>

      <article className="panel report-card">
        <h3>Suggestions</h3>
        <div className="tips-list">
          {report.suggestions.map((tip) => (
            <div className="tip-item" key={tip}>
              {tip}
            </div>
          ))}
        </div>
        {report.llmFeedback ? (
          <>
            <h3>LLM Summary</h3>
            <p>{report.llmFeedback.summary}</p>
            <p className="muted">Strengths: {report.llmFeedback.strengths.join("; ")}</p>
            <p className="muted">Weaknesses: {report.llmFeedback.weaknesses.join("; ")}</p>
          </>
        ) : null}
        <Link href={`/problems/${report.problemId}`} className="button">
          Back to Editor
        </Link>
      </article>
    </section>
  );
}
