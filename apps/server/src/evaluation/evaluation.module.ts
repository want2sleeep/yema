import { Module } from "@nestjs/common";
import { ProblemsModule } from "../problems/problems.module.js";
import { RuntimeStorageService } from "../storage/runtime-storage.service.js";
import { StaticAnalysisService } from "./static-analysis/static-analysis.service.js";
import { RenderAnalysisService } from "./render-analysis/render-analysis.service.js";
import { LlmAnalysisService } from "./llm-analysis/llm-analysis.service.js";
import { ScoreAggregatorService } from "./score-aggregator/score-aggregator.service.js";
import { EvaluationPipelineService } from "./pipeline/evaluation-pipeline.service.js";

@Module({
  imports: [ProblemsModule],
  providers: [
    StaticAnalysisService,
    RenderAnalysisService,
    LlmAnalysisService,
    ScoreAggregatorService,
    EvaluationPipelineService,
    RuntimeStorageService,
  ],
  exports: [EvaluationPipelineService],
})
export class EvaluationModule {}

