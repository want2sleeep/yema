import { Injectable } from "@nestjs/common";
import { LlmFeedback, Problem, RenderCheckResult, StaticAnalysisResult, SubmissionFile } from "@yema/shared";
import { LlmAnalysisInput } from "./llm.types.js";
import { OllamaProvider } from "./providers/ollama.provider.js";

@Injectable()
export class LlmAnalysisService {
  constructor(private readonly ollamaProvider: OllamaProvider) {}

  async analyze(
    problem: Problem,
    files: SubmissionFile[],
    staticResult: StaticAnalysisResult,
    renderResult: RenderCheckResult,
  ): Promise<LlmFeedback> {
    const input: LlmAnalysisInput = {
      problem,
      files,
      staticResult,
      renderResult,
      evidence: [...staticResult.evidence, ...renderResult.evidence],
    };

    try {
      return await this.ollamaProvider.generateFeedback(input);
    } catch {
      return this.buildFallbackFeedback(input);
    }
  }

  private buildFallbackFeedback(input: LlmAnalysisInput): LlmFeedback {
    const { problem, files, staticResult, renderResult } = input;
    const weaknesses = [...(staticResult.lintWarnings > 0 ? ["Rule-based static checks still have warnings."] : [])];

    if (renderResult.missingSelectors.length > 0) {
      weaknesses.push(`Required selectors are still missing: ${renderResult.missingSelectors.join(", ")}`);
    }
    if (renderResult.missingTexts.length > 0) {
      weaknesses.push(`Required text is still missing after render: ${renderResult.missingTexts.join(", ")}`);
    }
    if (renderResult.consoleErrors.length > 0) {
      weaknesses.push("The browser console still reports runtime errors during page rendering.");
    }
    if (renderResult.loadError) {
      weaknesses.push(`The page did not load successfully in Playwright: ${renderResult.loadError}`);
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
        "Run the page in a browser and clear any console errors before resubmitting.",
        "Improve layout-related CSS such as centering, spacing and visual hierarchy.",
        "Replace this local feedback generator with an OpenAI-compatible provider in the next phase.",
      ],
      riskFlags: [],
    };
  }
}
