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
      "You are generating structured teaching feedback for a frontend online judge.",
      "Return strict JSON with keys: summary, strengths, weaknesses, nextSteps, riskFlags.",
      "Do not include markdown fences or any extra text.",
      "",
      `Problem title: ${input.problem.title}`,
      `Problem description: ${input.problem.description}`,
      `Required selectors: ${input.problem.config.requiredSelectors.join(", ")}`,
      `Required texts: ${input.problem.config.requiredTexts.join(", ")}`,
      "",
      `Static result: ${JSON.stringify(input.staticResult)}`,
      `Render result: ${JSON.stringify({
        renderOk: input.renderResult.renderOk,
        consoleErrors: input.renderResult.consoleErrors,
        missingSelectors: input.renderResult.missingSelectors,
        missingTexts: input.renderResult.missingTexts,
        matchedTexts: input.renderResult.matchedTexts,
        loadError: input.renderResult.loadError,
      })}`,
      `Evidence: ${JSON.stringify(input.evidence)}`,
      `Lint messages: ${JSON.stringify(input.staticResult.lintMessages)}`,
      "",
      "Student files:",
      codeSummary,
    ].join("\n");
  }

  private stripCodeFences(value: string) {
    return value.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "");
  }
}
