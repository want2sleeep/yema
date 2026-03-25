import { Injectable } from "@nestjs/common";
import { Problem, RenderCheckResult, SubmissionFile } from "@yema/shared";
import { RuntimeStorageService } from "../../storage/runtime-storage.service.js";

@Injectable()
export class RenderAnalysisService {
  constructor(private readonly runtimeStorageService: RuntimeStorageService) {}

  async analyze(problem: Problem, submissionId: string, files: SubmissionFile[]): Promise<RenderCheckResult> {
    const htmlFile = files.find((file) => file.path.endsWith(".html"));
    const htmlContent = htmlFile?.content ?? "";
    const missingSelectors = problem.config.requiredSelectors.filter(
      (selector) => !this.containsSelector(htmlContent, selector),
    );
    const matchedTexts = problem.config.requiredTexts.filter((text) => htmlContent.includes(text));
    const screenshotPath = await this.runtimeStorageService.writeTextFile(
      `reports/${submissionId}`,
      "mock-screenshot.txt",
      "Playwright screenshot placeholder. Replace with real screenshot output in phase 2.",
    );

    return {
      renderOk: missingSelectors.length === 0,
      screenshotPath,
      consoleErrors: [],
      missingSelectors,
      matchedTexts,
      evidence: [
        {
          id: "render-check",
          category: "render",
          title: missingSelectors.length === 0 ? "Render structure matched" : "Render structure incomplete",
          detail:
            missingSelectors.length === 0
              ? "Rule-based render checks passed. Replace this stage with Playwright browser execution in phase 2."
              : `Missing required selectors: ${missingSelectors.join(", ")}`,
          severity: missingSelectors.length === 0 ? "info" : "warning",
          scoreImpact: missingSelectors.length === 0 ? 8 : -10,
        },
      ],
    };
  }

  private containsSelector(html: string, selector: string) {
    if (selector.startsWith("#")) {
      return html.includes(`id="${selector.slice(1)}"`);
    }

    if (selector.startsWith(".")) {
      return html.includes(`class="${selector.slice(1)}`) || html.includes(` ${selector.slice(1)}`);
    }

    return html.includes(`<${selector}`);
  }
}
