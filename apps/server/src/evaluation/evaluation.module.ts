import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module.js";
import { ProblemsModule } from "../problems/problems.module.js";
import { RuntimeStorageService } from "../storage/runtime-storage.service.js";
import { StaticAnalysisService } from "./static-analysis/static-analysis.service.js";
import { RenderAnalysisService } from "./render-analysis/render-analysis.service.js";
import { LlmAnalysisService } from "./llm-analysis/llm-analysis.service.js";
import { OllamaProvider } from "./llm-analysis/providers/ollama.provider.js";
import { ScoreAggregatorService } from "./score-aggregator/score-aggregator.service.js";
import { EvaluationPipelineService } from "./pipeline/evaluation-pipeline.service.js";
import { EvaluationRunnerService } from "./pipeline/evaluation-runner.service.js";

@Module({
  imports: [ProblemsModule, DatabaseModule],
  providers: [
    StaticAnalysisService,
    RenderAnalysisService,
    LlmAnalysisService,
    OllamaProvider,
    ScoreAggregatorService,
    EvaluationPipelineService,
    EvaluationRunnerService,
    RuntimeStorageService,
  ],
  exports: [EvaluationPipelineService, EvaluationRunnerService],
})
export class EvaluationModule {}
