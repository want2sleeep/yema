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
          title: "HTML 解析失败",
          detail: "提交的 HTML 无法被解析为结构化文档树。",
          severity: "error",
          scoreImpact: -12,
        });
      }
    }

    if (missingFiles.length > 0) {
      evidence.push({
        id: "static-missing-files",
        category: "static",
        title: "缺少必需文件",
        detail: `缺少以下必需可编辑文件：${missingFiles.join(", ")}`,
        severity: "error",
        scoreImpact: -12,
      });
    }

    if (missingTexts.length > 0) {
      evidence.push({
        id: "static-missing-text",
        category: "static",
        title: "缺少必需文本",
        detail: `在 HTML 结构树中未找到以下必需文本：${missingTexts.join(", ")}`,
        severity: "warning",
        scoreImpact: -8,
      });
    } else {
      evidence.push({
        id: "static-text-ok",
        category: "static",
        title: "必需文本已命中",
        detail: "所有必需文本都已出现在解析后的 HTML 结构中。",
        severity: "info",
        scoreImpact: 4,
      });
    }

    if (missingSelectors.length > 0) {
      evidence.push({
        id: "static-missing-selectors",
        category: "static",
        title: "源码中缺少必需选择器",
        detail: `在 HTML AST 中未找到以下选择器：${missingSelectors.join(", ")}`,
        severity: "warning",
        scoreImpact: -8,
      });
    } else {
      evidence.push({
        id: "static-selectors-ok",
        category: "static",
        title: "源码中已包含必需选择器",
        detail: "在浏览器渲染之前，HTML AST 中已包含全部必需选择器。",
        severity: "info",
        scoreImpact: 4,
      });
    }

    if (!cssContent.includes("display")) {
      evidence.push({
        id: "static-style-weak",
        category: "static",
        title: "布局样式较弱",
        detail: "CSS 中缺少常见的布局声明，页面可能还不够完整。",
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
            title: message.severity === 2 ? "ESLint 错误" : "ESLint 警告",
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
        title: "未提供 JavaScript lint 目标",
        detail: "当前提交仅包含 HTML/CSS 文件，因此跳过了 ESLint 检查。",
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
