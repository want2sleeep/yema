import { Injectable } from "@nestjs/common";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import { EvidenceItem, Problem, RenderCheckResult, SubmissionFile } from "@yema/shared";
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
        consoleErrors: ["未提交 HTML 入口文件，无法进行浏览器渲染。"],
        missingSelectors: [...problem.config.requiredSelectors],
        matchedTexts: [],
        missingTexts: [...problem.config.requiredTexts],
        loadError: "缺少 HTML 入口文件",
        evidence: [
          {
            id: "render-entry-missing",
            category: "render",
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
          width: 1440,
          height: 960,
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
        await page.waitForTimeout(250);
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
    const evidence = this.buildEvidence(missingSelectors, missingTexts, allConsoleErrors, loadError);

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
        title: "页面加载失败",
        detail: `Playwright 无法加载生成后的页面：${loadError}`,
        severity: "error",
        scoreImpact: -16,
      });
      return evidence;
    }

    evidence.push({
      id: "render-dom-check",
      category: "render",
      title: missingSelectors.length === 0 ? "必需选择器已渲染" : "渲染后缺少必需选择器",
      detail:
        missingSelectors.length === 0
          ? "在浏览器渲染后的 DOM 中找到了所有必需选择器。"
          : `渲染后缺少以下必需选择器：${missingSelectors.join(", ")}`,
      severity: missingSelectors.length === 0 ? "info" : "warning",
      scoreImpact: missingSelectors.length === 0 ? 10 : -10,
    });

    evidence.push({
      id: "render-text-check",
      category: "render",
      title: missingTexts.length === 0 ? "必需文本已渲染" : "渲染后缺少必需文本",
      detail:
        missingTexts.length === 0
          ? "所有必需文本都已经出现在渲染后的页面中。"
          : `渲染后缺少以下必需文本：${missingTexts.join(", ")}`,
      severity: missingTexts.length === 0 ? "info" : "warning",
      scoreImpact: missingTexts.length === 0 ? 6 : -8,
    });

    if (consoleErrors.length > 0) {
      evidence.push({
        id: "render-console-errors",
        category: "render",
        title: "浏览器控制台存在错误",
        detail: `渲染期间捕获到以下控制台错误：${consoleErrors.join(" | ")}`,
        severity: "warning",
        scoreImpact: -6,
      });
    } else {
      evidence.push({
        id: "render-console-clean",
        category: "render",
        title: "浏览器控制台无异常",
        detail: "浏览器渲染期间未捕获到控制台错误或页面错误。",
        severity: "info",
        scoreImpact: 2,
      });
    }

    return evidence;
  }
}

