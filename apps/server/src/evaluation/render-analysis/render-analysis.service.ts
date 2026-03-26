import { Injectable } from "@nestjs/common";
import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { EvidenceItem, Problem, RenderCheckResult, SubmissionFile } from "@yema/shared";
import { RuntimeStorageService } from "../../storage/runtime-storage.service.js";

@Injectable()
export class RenderAnalysisService {
  constructor(private readonly runtimeStorageService: RuntimeStorageService) {}

  async analyze(problem: Problem, submissionId: string, files: SubmissionFile[]): Promise<RenderCheckResult> {
    const reportDir = await this.runtimeStorageService.ensureDir(`reports/${submissionId}`);
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
        consoleErrors: ["No HTML entry file was submitted for browser rendering."],
        missingSelectors: [...problem.config.requiredSelectors],
        matchedTexts: [],
        missingTexts: [...problem.config.requiredTexts],
        loadError: "Missing HTML entry file",
        evidence: [
          {
            id: "render-entry-missing",
            category: "render",
            title: "Browser render skipped",
            detail: "The submission does not contain an HTML entry file, so Playwright could not load the page.",
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
        loadError = error instanceof Error ? error.message : "Unknown Playwright load error";
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
        title: "Page failed to load in browser",
        detail: `Playwright could not load the generated page: ${loadError}`,
        severity: "error",
        scoreImpact: -16,
      });
      return evidence;
    }

    evidence.push({
      id: "render-dom-check",
      category: "render",
      title: missingSelectors.length === 0 ? "Required selectors rendered" : "Required selectors missing after render",
      detail:
        missingSelectors.length === 0
          ? "All required selectors were found in the browser-rendered DOM."
          : `Missing required selectors after render: ${missingSelectors.join(", ")}`,
      severity: missingSelectors.length === 0 ? "info" : "warning",
      scoreImpact: missingSelectors.length === 0 ? 10 : -10,
    });

    evidence.push({
      id: "render-text-check",
      category: "render",
      title: missingTexts.length === 0 ? "Required text rendered" : "Required text missing after render",
      detail:
        missingTexts.length === 0
          ? "All required text snippets appeared in the rendered page."
          : `Missing required text after render: ${missingTexts.join(", ")}`,
      severity: missingTexts.length === 0 ? "info" : "warning",
      scoreImpact: missingTexts.length === 0 ? 6 : -8,
    });

    if (consoleErrors.length > 0) {
      evidence.push({
        id: "render-console-errors",
        category: "render",
        title: "Browser console reported errors",
        detail: `Console errors during rendering: ${consoleErrors.join(" | ")}`,
        severity: "warning",
        scoreImpact: -6,
      });
    } else {
      evidence.push({
        id: "render-console-clean",
        category: "render",
        title: "Browser console stayed clean",
        detail: "No console or page errors were captured during browser rendering.",
        severity: "info",
        scoreImpact: 2,
      });
    }

    return evidence;
  }
}
