import { Injectable } from "@nestjs/common";
import { ESLint, Linter } from "eslint";
import js from "@eslint/js";
import { parse, type DefaultTreeAdapterMap } from "parse5";
import { EvidenceItem, Problem, StaticAnalysisResult, SubmissionFile } from "@yema/shared";

type HtmlNode = DefaultTreeAdapterMap["node"];
type HtmlParentNode = DefaultTreeAdapterMap["parentNode"];
type HtmlElement = DefaultTreeAdapterMap["element"];

@Injectable()
export class StaticAnalysisService {
  private readonly eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [
      js.configs.recommended as Linter.Config,
      {
        languageOptions: {
          ecmaVersion: "latest",
          sourceType: "module",
          globals: {
            console: "readonly",
            document: "readonly",
            window: "readonly",
          },
        },
        rules: {
          "no-unused-vars": ["warn", { args: "none" }],
          "no-undef": "error",
        },
      },
    ],
    ignore: false,
  });

  async analyze(problem: Problem, files: SubmissionFile[]): Promise<StaticAnalysisResult> {
    const htmlFile = files.find((file) => file.path.endsWith(".html"));
    const cssFile = files.find((file) => file.path.endsWith(".css"));
    const jsFiles = files.filter((file) => /\.(?:[cm]?js|jsx)$/.test(file.path));
    const evidence: EvidenceItem[] = [];
    const htmlContent = htmlFile?.content ?? "";
    const cssContent = cssFile?.content ?? "";
    const missingFiles = problem.config.editableFiles
      .map((file) => file.path)
      .filter((path) => !files.some((file) => file.path === path));

    let matchedSelectors: string[] = [];
    let missingSelectors = [...problem.config.requiredSelectors];
    let matchedTexts: string[] = [];
    let missingTexts = [...problem.config.requiredTexts];
    let syntaxOk = Boolean(htmlFile && cssFile);

    if (htmlFile) {
      try {
        const document = parse(htmlContent);
        matchedSelectors = problem.config.requiredSelectors.filter((selector) => this.containsSelector(document, selector));
        missingSelectors = problem.config.requiredSelectors.filter((selector) => !matchedSelectors.includes(selector));
        matchedTexts = problem.config.requiredTexts.filter((text) => this.containsText(document, text));
        missingTexts = problem.config.requiredTexts.filter((text) => !matchedTexts.includes(text));
      } catch {
        syntaxOk = false;
        evidence.push({
          id: "static-html-parse-error",
          category: "static",
          title: "HTML parse failed",
          detail: "The submitted HTML could not be traversed as a structured document tree.",
          severity: "error",
          scoreImpact: -12,
        });
      }
    }

    if (missingFiles.length > 0) {
      evidence.push({
        id: "static-missing-files",
        category: "static",
        title: "Required files are missing",
        detail: `Missing required editable files: ${missingFiles.join(", ")}`,
        severity: "error",
        scoreImpact: -12,
      });
    }

    if (missingTexts.length > 0) {
      evidence.push({
        id: "static-missing-text",
        category: "static",
        title: "Missing required text",
        detail: `The following text was not found in the parsed HTML tree: ${missingTexts.join(", ")}`,
        severity: "warning",
        scoreImpact: -8,
      });
    } else {
      evidence.push({
        id: "static-text-ok",
        category: "static",
        title: "Required text matched",
        detail: "All required phrases are present in the parsed HTML structure.",
        severity: "info",
        scoreImpact: 4,
      });
    }

    if (missingSelectors.length > 0) {
      evidence.push({
        id: "static-missing-selectors",
        category: "static",
        title: "Required selectors are missing in source",
        detail: `The following selectors were not found in the HTML AST: ${missingSelectors.join(", ")}`,
        severity: "warning",
        scoreImpact: -8,
      });
    } else {
      evidence.push({
        id: "static-selectors-ok",
        category: "static",
        title: "Required selectors found in source",
        detail: "The HTML AST already contains all required selectors before browser rendering.",
        severity: "info",
        scoreImpact: 4,
      });
    }

    if (!cssContent.includes("display")) {
      evidence.push({
        id: "static-style-weak",
        category: "static",
        title: "Weak layout styling",
        detail: "No common layout declaration was found in CSS, so the page may still look unfinished.",
        severity: "warning",
        scoreImpact: -6,
      });
    }

    const lintMessages: string[] = [];
    let lintWarnings = evidence.filter((item) => item.severity === "warning").length;
    let lintErrors = evidence.filter((item) => item.severity === "error").length;

    if (jsFiles.length > 0) {
      const lintResults = await Promise.all(
        jsFiles.map((file) =>
          this.eslint.lintText(file.content, {
            filePath: file.path,
            warnIgnored: false,
          }),
        ),
      );

      const normalizedResults = lintResults.flat();

      for (const result of normalizedResults) {
        for (const message of result.messages) {
          const normalized = `${result.filePath}: ${message.ruleId ?? "syntax"} - ${message.message}`;
          lintMessages.push(normalized);
          evidence.push({
            id: `static-lint-${lintMessages.length}`,
            category: "static",
            title: message.severity === 2 ? "ESLint error" : "ESLint warning",
            detail: normalized,
            severity: message.severity === 2 ? "error" : "warning",
            scoreImpact: message.severity === 2 ? -6 : -3,
          });
        }
      }

      lintWarnings += normalizedResults.reduce((sum, result) => sum + result.warningCount, 0);
      lintErrors += normalizedResults.reduce((sum, result) => sum + result.errorCount, 0);
    } else {
      evidence.push({
        id: "static-lint-skipped",
        category: "static",
        title: "No JavaScript lint target provided",
        detail: "This submission contains only HTML/CSS files, so ESLint checks were skipped.",
        severity: "info",
        scoreImpact: 0,
      });
    }

    return {
      syntaxOk,
      lintWarnings,
      lintErrors,
      matchedSelectors,
      missingSelectors,
      matchedTexts,
      missingTexts,
      missingFiles,
      lintMessages,
      evidence,
    };
  }

  private containsSelector(root: HtmlNode, selector: string) {
    return this.findElement(root, selector) !== undefined;
  }

  private containsText(root: HtmlNode, target: string) {
    let found = false;

    this.walk(root, (node) => {
      if (found || !("nodeName" in node)) {
        return;
      }

      if (node.nodeName === "#text" && "value" in node && typeof node.value === "string" && node.value.includes(target)) {
        found = true;
      }
    });

    return found;
  }

  private findElement(root: HtmlNode, selector: string) {
    let found: HtmlElement | undefined;

    this.walk(root, (node) => {
      if (found || !this.isElement(node)) {
        return;
      }

      if (this.matchesSelector(node, selector)) {
        found = node;
      }
    });

    return found;
  }

  private walk(node: HtmlNode, visitor: (node: HtmlNode) => void) {
    visitor(node);

    if (!("childNodes" in node) || !Array.isArray(node.childNodes)) {
      return;
    }

    for (const child of (node as HtmlParentNode).childNodes) {
      this.walk(child, visitor);
    }
  }

  private isElement(node: HtmlNode): node is HtmlElement {
    return "tagName" in node && Array.isArray((node as HtmlElement).attrs);
  }

  private matchesSelector(node: HtmlElement, selector: string) {
    if (selector.startsWith("#")) {
      return this.getAttribute(node, "id") === selector.slice(1);
    }

    if (selector.startsWith(".")) {
      const classValue = this.getAttribute(node, "class") ?? "";
      return classValue.split(/\s+/).includes(selector.slice(1));
    }

    return node.tagName === selector.toLowerCase();
  }

  private getAttribute(node: HtmlElement, name: string) {
    return node.attrs.find((attribute) => attribute.name === name)?.value;
  }
}
