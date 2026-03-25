import {
  EvidenceItem,
  LlmFeedback,
  Problem,
  RenderCheckResult,
  StaticAnalysisResult,
  SubmissionFile,
} from "@yema/shared";

export type LlmAnalysisInput = {
  problem: Problem;
  files: SubmissionFile[];
  staticResult: StaticAnalysisResult;
  renderResult: RenderCheckResult;
  evidence: EvidenceItem[];
};

export interface LlmProvider {
  generateFeedback(input: LlmAnalysisInput): Promise<LlmFeedback>;
}

