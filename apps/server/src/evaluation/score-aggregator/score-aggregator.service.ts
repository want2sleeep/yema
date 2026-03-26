import { Injectable } from "@nestjs/common";
import {
  EvaluationReport,
  LlmFeedback,
  Problem,
  RenderCheckResult,
  StaticAnalysisResult,
} from "@yema/shared";

@Injectable()
export class ScoreAggregatorService {
  aggregate(
    submissionId: string,
    problem: Problem,
    staticResult: StaticAnalysisResult,
    renderResult: RenderCheckResult,
    llmFeedback: LlmFeedback,
  ): EvaluationReport {
    const correctnessScore = Math.max(
      0,
      problem.config.weights.correctness -
        renderResult.missingSelectors.length * 8 -
        renderResult.missingTexts.length * 6 -
        (renderResult.loadError ? 12 : 0),
    );
    const codeQualityScore = Math.max(
      0,
      problem.config.weights.codeQuality -
        staticResult.lintWarnings * 4 -
        staticResult.lintErrors * 8 -
        staticResult.missingSelectors.length * 2,
    );
    const uiRenderingScore = Math.max(
      0,
      problem.config.weights.uiRendering -
        renderResult.missingSelectors.length * 6 -
        renderResult.missingTexts.length * 4 -
        renderResult.consoleErrors.length * 2 -
        (renderResult.loadError ? 10 : 0),
    );
    const engineeringScore = Math.max(
      0,
      problem.config.weights.engineering -
        (staticResult.syntaxOk ? 0 : 10) -
        staticResult.missingFiles.length * 6 -
        (renderResult.consoleErrors.length > 0 ? 4 : 0),
    );
    const totalScore = correctnessScore + codeQualityScore + uiRenderingScore + engineeringScore;

    return {
      submissionId,
      problemId: problem.id,
      totalScore,
      summary:
        totalScore >= 85
          ? "本次提交已经完成了较为完整的页面实现，可以继续做细节优化。"
          : "本次提交已经跑通基础流程，但在结构、样式或稳定性上仍需继续修改。",
      dimensions: {
        correctness: {
          score: correctnessScore,
          maxScore: problem.config.weights.correctness,
          summary: "根据必需结构、文本命中情况和规则命中情况评估功能完成度。",
        },
        codeQuality: {
          score: codeQualityScore,
          maxScore: problem.config.weights.codeQuality,
          summary: "根据静态分析、ESLint 与模板符合度评估代码质量。",
        },
        uiRendering: {
          score: uiRenderingScore,
          maxScore: problem.config.weights.uiRendering,
          summary: "根据浏览器渲染结果、DOM 检查、文本检查和截图证据评估页面表现。",
        },
        engineering: {
          score: engineeringScore,
          maxScore: problem.config.weights.engineering,
          summary: "根据文件完整性、运行稳定性和提交规范评估工程规范。",
        },
      },
      evidence: [...staticResult.evidence, ...renderResult.evidence],
      suggestions: llmFeedback.nextSteps,
      llmFeedback,
      artifacts: {
        screenshotUrl: renderResult.screenshotUrl,
      },
      renderDetails: {
        renderOk: renderResult.renderOk,
        consoleErrors: renderResult.consoleErrors,
        missingSelectors: renderResult.missingSelectors,
        matchedTexts: renderResult.matchedTexts,
        missingTexts: renderResult.missingTexts,
        loadError: renderResult.loadError,
      },
      generatedAt: new Date().toISOString(),
    };
  }
}
