import { Injectable } from "@nestjs/common";
import { EvaluationReport, Problem, SubmissionFile } from "@yema/shared";
import { StaticAnalysisService } from "../static-analysis/static-analysis.service.js";
import { RenderAnalysisService } from "../render-analysis/render-analysis.service.js";
import { LlmAnalysisService } from "../llm-analysis/llm-analysis.service.js";
import { ScoreAggregatorService } from "../score-aggregator/score-aggregator.service.js";

@Injectable()
export class EvaluationPipelineService {
  constructor(
    private readonly staticAnalysisService: StaticAnalysisService,
    private readonly renderAnalysisService: RenderAnalysisService,
    private readonly llmAnalysisService: LlmAnalysisService,
    private readonly scoreAggregatorService: ScoreAggregatorService,
  ) {}

  async run(problem: Problem, submissionId: string, files: SubmissionFile[]): Promise<EvaluationReport> {
    const staticResult = this.staticAnalysisService.analyze(problem, files);
    const renderResult = await this.renderAnalysisService.analyze(problem, submissionId, files);
    const llmFeedback = await this.llmAnalysisService.analyze(problem, files, staticResult, renderResult);
    return this.scoreAggregatorService.aggregate(submissionId, problem, staticResult, renderResult, llmFeedback);
  }
}
