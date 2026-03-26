import { Injectable } from "@nestjs/common";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import {
  EvidenceItem,
  Problem,
  ProblemEvaluationRule,
  RenderCheckResult,
  SubmissionFile,
} from "@yema/shared";
import { RuntimeStorageService } from "../../storage/runtime-storage.service.js";

@Injectable()
export class RenderAnalysisService {
  constructor(private readonly runtimeStorageService: RuntimeStorageService) {}

  async analyze(problem: Problem, submissionId: string, files: SubmissionFile[]): Promise<RenderCheckResult> {
    const reportDir = await this.runtimeStorageService.ensureReportDir(submissionId);
    const screenshotFilename = "render.png";
    const screenshotPath = join(reportDir, screenshotFilename);
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    await this.runtimeStorageService.writeSubmissionFiles(submissionId, files);

    const workspaceDir = this.runtimeStorageService.getSubmissionWorkspaceDir(submissionId);
    const htmlFile = files.find((file) => file.path.endsWith(".html"));

    if (!htmlFile) {
      return {
        renderOk: false,
        consoleErrors: ["未提交 HTML 入口文件，无法执行浏览器渲染检查。"],
        missingSelectors: [...problem.config.requiredSelectors],
        matchedTexts: [],
        missingTexts: [...problem.config.requiredTexts],
        loadError: "缺少 HTML 入口文件",
        evidence: [
          {
            id: "render-entry-missing",
            category: "render",
            dimension: "engineering",
            title: "浏览器渲染已跳过",
            detail: "提交内容中没有 HTML 入口文件，因此 Playwright 无法加载页面。",
            severity: "error",
            scoreImpact: -18,
          },
        ],
      };
    }

    const entryPath = join(workspaceDir, htmlFile.path);
    const browser = await chromium.launch({ headless: true });
    let screenshotUrl: string | undefined;
    let loadError: string | undefined;
    let missingSelectors = [...problem.config.requiredSelectors];
    let matchedTexts: string[] = [];
    let missingTexts = [...problem.config.requiredTexts];

    try {
      const page = await browser.newPage({
        viewport: {
          width: problem.config.renderConfig.viewportWidth,
          height: problem.config.renderConfig.viewportHeight,
        },
      });

      page.on("console", (message) => {
        if (message.type() === "error") {
          consoleErrors.push(message.text());
        }
      });

      page.on("pageerror", (error) => {
        pageErrors.push(error.message);
      });

      try {
        await page.goto(pathToFileURL(entryPath).toString(), {
          waitUntil: "load",
          timeout: 5000,
        });
        await page.waitForTimeout(problem.config.renderConfig.waitAfterLoadMs);
        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
        });
        screenshotUrl = this.runtimeStorageService.getArtifactUrl(submissionId, screenshotFilename);

        const selectorChecks = await Promise.all(
          problem.config.requiredSelectors.map(async (selector) => ({
            selector,
            found: (await page.locator(selector).count()) > 0,
          })),
        );

        missingSelectors = selectorChecks.filter((item) => !item.found).map((item) => item.selector);

        const bodyText = (await page.locator("body").textContent()) ?? "";
        matchedTexts = problem.config.requiredTexts.filter((text) => bodyText.includes(text));
        missingTexts = problem.config.requiredTexts.filter((text) => !bodyText.includes(text));
      } catch (error) {
        loadError = error instanceof Error ? error.message : "未知的 Playwright 页面加载错误";
      } finally {
        await page.close();
      }
    } finally {
      await browser.close();
    }

    const allConsoleErrors = [...consoleErrors, ...pageErrors];
    const evidence = this.buildEvidence(problem, missingSelectors, missingTexts, allConsoleErrors, loadError);

    return {
      renderOk: !loadError && missingSelectors.length === 0 && missingTexts.length === 0,
      screenshotPath: screenshotUrl ? screenshotPath : undefined,
      screenshotUrl,
      consoleErrors: allConsoleErrors,
      missingSelectors,
      matchedTexts,
      missingTexts,
      loadError,
      evidence,
    };
  }

  private buildEvidence(
    problem: Problem,
    missingSelectors: string[],
    missingTexts: string[],
    consoleErrors: string[],
    loadError?: string,
  ): EvidenceItem[] {
    const evidence: EvidenceItem[] = [];

    if (loadError) {
      evidence.push({
        id: "render-load-failed",
        category: "render",
        dimension: "uiRendering",
        title: "页面加载失败",
        detail: `Playwright 无法加载生成后的页面：${loadError}`,
        severity: "error",
        scoreImpact: -16,
      });
      return evidence;
    }

    for (const rule of problem.config.evaluationRules.filter((item) => item.engine === "render")) {
      const result = this.evaluateRenderRule(rule, {
        missingSelectors,
        missingTexts,
        consoleErrors,
      });

      if (!result) {
        continue;
      }

      evidence.push({
        id: rule.id,
        category: "render",
        dimension: rule.dimension,
        title: rule.title,
        detail: result.detail,
        severity: result.severity,
        scoreImpact: result.scoreImpact,
      });
    }

    evidence.push({
      id: "render-screenshot-generated",
      category: "render",
      dimension: "uiRendering",
      title: "已生成渲染截图",
      detail: "本次浏览器检查已生成页面截图，可用于答辩展示和人工复核。",
      severity: "info",
      scoreImpact: 0,
    });

    return evidence;
  }

  private evaluateRenderRule(
    rule: ProblemEvaluationRule,
    input: {
      missingSelectors: string[];
      missingTexts: string[];
      consoleErrors: string[];
    },
  ) {
    if (rule.type === "selector" && rule.target) {
      return this.buildRuleEvidence(rule, !input.missingSelectors.includes(rule.target));
    }

    if (rule.type === "text" && rule.target) {
      return this.buildRuleEvidence(rule, !input.missingTexts.includes(rule.target));
    }

    if (rule.type === "console") {
      return this.buildRuleEvidence(rule, input.consoleErrors.length === 0);
    }

    return undefined;
  }

  private buildRuleEvidence(rule: ProblemEvaluationRule, passed: boolean) {
    return {
      detail: passed
        ? rule.successMessage ?? `${rule.description}：检查通过。`
        : rule.failureMessage ?? `${rule.description}：检查未通过。`,
      severity: passed ? ("info" as const) : rule.failureSeverity,
      scoreImpact: passed ? 0 : rule.failureScoreImpact,
    };
  }
}
