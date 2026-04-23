import { Injectable } from "@nestjs/common";
import {
  EvaluationReport,
  EvidenceItem,
  LlmFeedback,
  Problem,
  ProblemScoreDimension,
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
    const evidence = [...staticResult.evidence, ...renderResult.evidence];
    const correctnessScore = this.calculateDimensionScore(problem, evidence, "correctness");
    const codeQualityScore = this.calculateDimensionScore(problem, evidence, "codeQuality");
    const uiRenderingScore = this.calculateDimensionScore(problem, evidence, "uiRendering");
    const engineeringScore = this.calculateDimensionScore(problem, evidence, "engineering");
    const totalScore = correctnessScore + codeQualityScore + uiRenderingScore + engineeringScore;

    return {
      submissionId,
      problemId: problem.id,
      totalScore,
      summary:
        totalScore >= 85
          ? "本次提交已经完成了较为完整的页面实现，可以继续打磨细节与表现力。"
          : "本次提交已经跑通基础流程，但题目规则覆盖、样式细节或运行稳定性仍需继续完善。",
      dimensions: {
        correctness: {
          score: correctnessScore,
          maxScore: problem.config.weights.correctness,
          summary: "根据题目要求中的关键结构、文本和功能性规则命中情况评估完成度。",
        },
        codeQuality: {
          score: codeQualityScore,
          maxScore: problem.config.weights.codeQuality,
          summary: "根据静态分析、样式声明与基础工程质量信号评估代码质量。",
        },
        uiRendering: {
          score: uiRenderingScore,
          maxScore: problem.config.weights.uiRendering,
          summary: "根据浏览器渲染结果、DOM 命中、文本展示与截图证据评估页面表现。",
        },
        engineering: {
          score: engineeringScore,
          maxScore: problem.config.weights.engineering,
          summary: "根据文件完整性、运行稳定性和评测可执行性评估工程规范。",
        },
      },
      evidence,
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

  private calculateDimensionScore(
    problem: Problem,
    evidence: EvidenceItem[],
    dimension: ProblemScoreDimension,
  ) {
    const maxScore = problem.config.weights[dimension];
    const deduction = evidence
      .filter((item) => item.dimension === dimension && item.scoreImpact < 0)
      .reduce((sum, item) => sum + Math.abs(item.scoreImpact), 0);

    return Math.max(0, maxScore - deduction);
  }
}
