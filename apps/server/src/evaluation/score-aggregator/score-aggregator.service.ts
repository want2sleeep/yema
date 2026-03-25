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
      problem.config.weights.correctness - renderResult.missingSelectors.length * 8,
    );
    const codeQualityScore = Math.max(
      0,
      problem.config.weights.codeQuality - staticResult.lintWarnings * 4 - staticResult.lintErrors * 8,
    );
    const uiRenderingScore = Math.max(
      0,
      problem.config.weights.uiRendering - renderResult.missingSelectors.length * 6,
    );
    const engineeringScore = Math.max(
      0,
      problem.config.weights.engineering - (staticResult.syntaxOk ? 0 : 10),
    );
    const totalScore = correctnessScore + codeQualityScore + uiRenderingScore + engineeringScore;

    return {
      submissionId,
      problemId: problem.id,
      totalScore,
      summary:
        totalScore >= 85
          ? "This submission already forms a fairly complete page implementation and is ready for refinement."
          : "This submission completes the base flow, but still needs fixes in structure or styling.",
      dimensions: {
        correctness: {
          score: correctnessScore,
          maxScore: problem.config.weights.correctness,
          summary: "Evaluates functional completion from required structure, text and rule hits.",
        },
        codeQuality: {
          score: codeQualityScore,
          maxScore: problem.config.weights.codeQuality,
          summary: "Evaluates code quality from static checks and template compliance.",
        },
        uiRendering: {
          score: uiRenderingScore,
          maxScore: problem.config.weights.uiRendering,
          summary: "Evaluates page presentation from the current render-analysis stage.",
        },
        engineering: {
          score: engineeringScore,
          maxScore: problem.config.weights.engineering,
          summary: "Evaluates file completeness and submission hygiene.",
        },
      },
      evidence: [...staticResult.evidence, ...renderResult.evidence],
      suggestions: llmFeedback.nextSteps,
      llmFeedback,
      generatedAt: new Date().toISOString(),
    };
  }
}
