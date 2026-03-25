import { Injectable } from "@nestjs/common";
import { LlmFeedback, Problem, RenderCheckResult, StaticAnalysisResult, SubmissionFile } from "@yema/shared";

@Injectable()
export class LlmAnalysisService {
  async analyze(
    problem: Problem,
    files: SubmissionFile[],
    staticResult: StaticAnalysisResult,
    renderResult: RenderCheckResult,
  ): Promise<LlmFeedback> {
    const weaknesses = [...(staticResult.lintWarnings > 0 ? ["存在规则型静态检查未通过项。"] : [])];

    if (renderResult.missingSelectors.length > 0) {
      weaknesses.push(`Required selectors are still missing: ${renderResult.missingSelectors.join(", ")}`);
    }

    return {
      summary: `Feedback was generated from rule-based evidence for "${problem.title}" across ${files.length} submitted files.`,
      strengths: [
        "The base page structure is already present and ready for visual refinement.",
        "The submission follows the expected template-based file organization.",
      ],
      weaknesses:
        weaknesses.length > 0
          ? weaknesses
          : ["No high-risk issue was found in the current placeholder analysis. Keep polishing details and maintainability."],
      nextSteps: [
        "First make sure required selectors and required text are all present.",
        "Improve layout-related CSS such as centering, spacing and visual hierarchy.",
        "Replace this local feedback generator with an OpenAI-compatible provider in the next phase.",
      ],
      riskFlags: [],
    };
  }
}
