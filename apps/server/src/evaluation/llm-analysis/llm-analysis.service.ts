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
    const weaknesses = [...(staticResult.lintWarnings > 0 ? ["静态分析中仍然存在警告项。"] : [])];
    if (staticResult.lintErrors > 0) {
      weaknesses.push("静态分析发现了 lint 错误，建议先修复后再继续优化。");
    }
    if (staticResult.missingFiles.length > 0) {
      weaknesses.push(`缺少必需源码文件：${staticResult.missingFiles.join(", ")}`);
    }
    if (staticResult.missingSelectors.length > 0) {
      weaknesses.push(`源码 AST 中缺少以下必需选择器：${staticResult.missingSelectors.join(", ")}`);
    }
    if (staticResult.missingTexts.length > 0) {
      weaknesses.push(`源码 AST 中缺少以下必需文本：${staticResult.missingTexts.join(", ")}`);
    }

    if (renderResult.missingSelectors.length > 0) {
      weaknesses.push(`渲染后仍缺少以下必需选择器：${renderResult.missingSelectors.join(", ")}`);
    }
    if (renderResult.missingTexts.length > 0) {
      weaknesses.push(`渲染后仍缺少以下必需文本：${renderResult.missingTexts.join(", ")}`);
    }
    if (renderResult.consoleErrors.length > 0) {
      weaknesses.push("页面渲染期间，浏览器控制台仍然报出运行时错误。");
    }
    if (renderResult.loadError) {
      weaknesses.push(`页面没有在 Playwright 中成功加载：${renderResult.loadError}`);
    }

    return {
      summary: `已基于“${problem.title}”的规则证据，为本次提交的 ${files.length} 个文件生成反馈。`,
      strengths: [
        "页面基础结构已经具备，可以继续做视觉与交互上的优化。",
        "当前提交基本符合模板化文件组织方式。",
      ],
      weaknesses:
        weaknesses.length > 0
          ? weaknesses
          : ["当前规则分析未发现高风险问题，可以继续完善细节与可维护性。"],
      nextSteps: [
        "先确保所有必需选择器和必需文本都已经完整出现。",
        "请先在浏览器中运行页面并清理控制台错误，再重新提交。",
        "继续优化布局相关样式，例如居中、间距和视觉层级。",
        "后续可以将当前本地反馈模块替换为 OpenAI Compatible 模型服务。",
      ],
      riskFlags: [],
    };
  }
}
