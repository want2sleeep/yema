import { Injectable } from "@nestjs/common";
import { ESLint, Linter } from "eslint";
import js from "@eslint/js";
import { parse, type DefaultTreeAdapterMap } from "parse5";
import {
  EvidenceItem,
  Problem,
  ProblemEvaluationRule,
  StaticAnalysisResult,
  SubmissionFile,
} from "@yema/shared";

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
    let htmlParsed = false;

    if (htmlFile) {
      try {
        const document = parse(htmlContent);
        htmlParsed = true;
        matchedSelectors = problem.config.requiredSelectors.filter((selector) => this.containsSelector(document, selector));
        missingSelectors = problem.config.requiredSelectors.filter((selector) => !matchedSelectors.includes(selector));
        matchedTexts = problem.config.requiredTexts.filter((text) => this.containsText(document, text));
        missingTexts = problem.config.requiredTexts.filter((text) => !matchedTexts.includes(text));
      } catch {
        syntaxOk = false;
        evidence.push({
          id: "static-html-parse-error",
          category: "static",
          dimension: "engineering",
          title: "HTML 解析失败",
          detail: "提交的 HTML 无法被解析为结构化文档树，后续静态结构检查已跳过。",
          severity: "error",
          scoreImpact: -12,
        });
      }
    }

    if (!htmlParsed) {
      matchedSelectors = [];
      missingSelectors = [];
      matchedTexts = [];
      missingTexts = [];
    }

    for (const rule of problem.config.evaluationRules.filter((item) => item.engine === "static")) {
      const result = this.evaluateStaticRule(rule, {
        files,
        cssContent,
        htmlParsed,
        matchedSelectors,
        matchedTexts,
      });

      if (!result) {
        continue;
      }

      evidence.push({
        id: rule.id,
        category: "static",
        dimension: rule.dimension,
        title: rule.title,
        detail: result.detail,
        severity: result.severity,
        scoreImpact: result.scoreImpact,
      });
    }

    if (!htmlParsed) {
      evidence.push({
        id: "static-html-checks-skipped",
        category: "static",
        dimension: "engineering",
        title: "HTML 结构检查已跳过",
        detail: htmlFile
          ? "由于 HTML 解析失败，源码中的选择器和文本检查未执行。"
          : "提交中缺少 HTML 文件，源码中的选择器和文本检查未执行。",
        severity: "warning",
        scoreImpact: -4,
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
            dimension: "codeQuality",
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
        dimension: "codeQuality",
        title: "未提供 JavaScript 检查目标",
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

  private evaluateStaticRule(
    rule: ProblemEvaluationRule,
    input: {
      files: SubmissionFile[];
      cssContent: string;
      htmlParsed: boolean;
      matchedSelectors: string[];
      matchedTexts: string[];
    },
  ) {
    if (rule.type === "file" && rule.target) {
      const passed = input.files.some((file) => file.path === rule.target);
      return this.buildRuleEvidence(rule, passed);
    }

    if (rule.type === "keyword") {
      const passed =
        rule.keywords !== undefined &&
        rule.keywords.length > 0 &&
        rule.keywords.every((keyword) => input.cssContent.includes(keyword));
      return this.buildRuleEvidence(rule, passed);
    }

    if (!input.htmlParsed) {
      return undefined;
    }

    if (rule.type === "selector" && rule.target) {
      return this.buildRuleEvidence(rule, input.matchedSelectors.includes(rule.target));
    }

    if (rule.type === "text" && rule.target) {
      return this.buildRuleEvidence(rule, input.matchedTexts.includes(rule.target));
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
