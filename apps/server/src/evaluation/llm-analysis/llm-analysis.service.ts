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
    const weaknesses = [...(staticResult.lintWarnings > 0 ? ["静态分析中仍存在警告项。"] : [])];

    if (staticResult.lintErrors > 0) {
      weaknesses.push("静态分析发现了 lint 错误，建议先修复再继续优化。");
    }
    if (staticResult.missingFiles.length > 0) {
      weaknesses.push(`缺少必需源文件：${staticResult.missingFiles.join(", ")}`);
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
      weaknesses.push("页面渲染期间，浏览器控制台仍然报出了运行时错误。");
    }
    if (renderResult.loadError) {
      weaknesses.push(`页面没有在 Playwright 中成功加载：${renderResult.loadError}`);
    }

    return {
      summary: `已基于“${problem.title}”的题目规则与证据，为本次提交的 ${files.length} 个文件生成反馈。`,
      strengths: [
        "当前提交已经具备基础的页面结构，可以继续优化视觉表现和交互细节。",
        "题目规则、渲染截图与静态分析证据已经形成一套可展示的评测链路。",
      ],
      weaknesses:
        weaknesses.length > 0
          ? weaknesses
          : ["当前规则分析未发现高风险问题，可以继续完善细节表现与可维护性。"],
      nextSteps: [
        "先对照题目页中的完成要求，确认关键结构、文本和按钮文案都已完整出现。",
        "在本地浏览器中检查页面效果，并优先清理控制台中的运行时错误。",
        "继续优化布局、间距和视觉层次，让页面更适合作为课堂作业展示样例。",
        "后续可以继续补充更细的题目规则，例如响应式检查、交互检查和多文件约束。",
      ],
      riskFlags: [],
    };
  }
}
