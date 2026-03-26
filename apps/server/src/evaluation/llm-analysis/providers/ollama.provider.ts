import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LlmFeedback } from "@yema/shared";
import { LlmAnalysisInput, LlmProvider } from "../llm.types.js";

type OllamaResponse = {
  response: string;
  thinking?: string;
};

@Injectable()
export class OllamaProvider implements LlmProvider {
  constructor(private readonly configService: ConfigService) {}

  async generateFeedback(input: LlmAnalysisInput): Promise<LlmFeedback> {
    const prompt = this.buildPrompt(input);
    const baseUrl = this.configService.get<string>("OLLAMA_BASE_URL") ?? "http://127.0.0.1:11434";
    const model = this.configService.get<string>("OLLAMA_MODEL") ?? "qwen3.5:4b";
    const timeoutConfig = this.configService.get<string>("OLLAMA_TIMEOUT_MS");
    let timeoutMs = Number(timeoutConfig ?? "15000");

    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
      timeoutMs = 15000;
    }

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), timeoutMs);

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        format: "json",
      }),
      signal: abortController.signal,
    }).finally(() => {
      clearTimeout(timeout);
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as OllamaResponse;
    const raw = payload.response?.trim() || payload.thinking?.trim();

    if (!raw) {
      throw new Error("Ollama returned no structured content");
    }

    return this.normalizeResponse(JSON.parse(this.stripCodeFences(raw)) as Partial<LlmFeedback>);
  }

  private normalizeResponse(payload: Partial<LlmFeedback>): LlmFeedback {
    return {
      summary: payload.summary ?? "Local Ollama provider returned no summary.",
      strengths: payload.strengths ?? [],
      weaknesses: payload.weaknesses ?? [],
      nextSteps: payload.nextSteps ?? [],
      riskFlags: payload.riskFlags ?? [],
    };
  }

  private buildPrompt(input: LlmAnalysisInput) {
    const codeSummary = input.files.map((file) => `${file.path}\n${file.content}`).join("\n\n");

    return [
      "你正在为一个前端在线判题系统生成结构化教学反馈。",
      "请返回严格 JSON，包含键：summary、strengths、weaknesses、nextSteps、riskFlags。",
      "所有字段内容请使用简体中文，不要输出 Markdown 代码块或额外解释。",
      "",
      `题目名称：${input.problem.title}`,
      `题目描述：${input.problem.description}`,
      `必需选择器：${input.problem.config.requiredSelectors.join(", ")}`,
      `必需文本：${input.problem.config.requiredTexts.join(", ")}`,
      "",
      `静态分析结果：${JSON.stringify(input.staticResult)}`,
      `渲染分析结果：${JSON.stringify({
        renderOk: input.renderResult.renderOk,
        consoleErrors: input.renderResult.consoleErrors,
        missingSelectors: input.renderResult.missingSelectors,
        missingTexts: input.renderResult.missingTexts,
        matchedTexts: input.renderResult.matchedTexts,
        loadError: input.renderResult.loadError,
      })}`,
      `证据项：${JSON.stringify(input.evidence)}`,
      `Lint 消息：${JSON.stringify(input.staticResult.lintMessages)}`,
      "",
      "学生提交文件：",
      codeSummary,
    ].join("\n");
  }

  private stripCodeFences(value: string) {
    return value.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "");
  }
}
