export type SubmissionStatus = "queued" | "running" | "completed" | "failed";

export type EditableFile = {
  path: string;
  language: "html" | "css" | "javascript" | "typescript" | "json";
  content: string;
};

export type ProblemWeightConfig = {
  correctness: number;
  codeQuality: number;
  uiRendering: number;
  engineering: number;
};

export type ProblemScoreDimension = keyof ProblemWeightConfig;

export type ProblemRuleEngine = "static" | "render";

export type ProblemRuleType = "file" | "selector" | "text" | "keyword" | "console";

export type ProblemEvaluationRule = {
  id: string;
  title: string;
  description: string;
  engine: ProblemRuleEngine;
  type: ProblemRuleType;
  dimension: ProblemScoreDimension;
  target?: string;
  keywords?: string[];
  failureSeverity: "warning" | "error";
  failureScoreImpact: number;
  successMessage?: string;
  failureMessage?: string;
};

export type ProblemRenderConfig = {
  viewportWidth: number;
  viewportHeight: number;
  waitAfterLoadMs: number;
};

export type ProblemConfig = {
  editableFiles: EditableFile[];
  requirements: string[];
  requiredSelectors: string[];
  requiredTexts: string[];
  evaluationRules: ProblemEvaluationRule[];
  renderConfig: ProblemRenderConfig;
  weights: ProblemWeightConfig;
};

export type ProblemSummary = {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  shortDescription: string;
};

export type Problem = ProblemSummary & {
  description: string;
  templateFiles: EditableFile[];
  config: ProblemConfig;
};

export type SubmissionFile = {
  path: string;
  content: string;
};

export type Submission = {
  id: string;
  problemId: string;
  userId: string;
  status: SubmissionStatus;
  files: SubmissionFile[];
  createdAt: string;
  updatedAt: string;
};

export type SubmissionSummary = {
  id: string;
  problemId: string;
  problemTitle: string;
  userId: string;
  status: SubmissionStatus;
  totalScore?: number;
  reportSummary?: string;
  createdAt: string;
  updatedAt: string;
};

export type EvidenceItem = {
  id: string;
  category: "static" | "render" | "llm" | "system";
  dimension?: ProblemScoreDimension;
  title: string;
  detail: string;
  severity: "info" | "warning" | "error";
  scoreImpact: number;
};

export type DimensionScore = {
  score: number;
  maxScore: number;
  summary: string;
};

export type StaticAnalysisResult = {
  syntaxOk: boolean;
  lintWarnings: number;
  lintErrors: number;
  matchedSelectors: string[];
  missingSelectors: string[];
  matchedTexts: string[];
  missingTexts: string[];
  missingFiles: string[];
  lintMessages: string[];
  evidence: EvidenceItem[];
};

export type RenderCheckResult = {
  renderOk: boolean;
  screenshotPath?: string;
  screenshotUrl?: string;
  consoleErrors: string[];
  missingSelectors: string[];
  matchedTexts: string[];
  missingTexts: string[];
  loadError?: string;
  evidence: EvidenceItem[];
};

export type EvaluationArtifacts = {
  screenshotUrl?: string;
};

export type EvaluationRenderDetails = {
  renderOk: boolean;
  consoleErrors: string[];
  missingSelectors: string[];
  matchedTexts: string[];
  missingTexts: string[];
  loadError?: string;
};

export type LlmFeedback = {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  nextSteps: string[];
  riskFlags: string[];
};

export type EvaluationReport = {
  submissionId: string;
  problemId: string;
  totalScore: number;
  summary: string;
  dimensions: {
    correctness: DimensionScore;
    codeQuality: DimensionScore;
    uiRendering: DimensionScore;
    engineering: DimensionScore;
  };
  evidence: EvidenceItem[];
  suggestions: string[];
  llmFeedback?: LlmFeedback;
  artifacts?: EvaluationArtifacts;
  renderDetails?: EvaluationRenderDetails;
  generatedAt: string;
};

export type CreateSubmissionRequest = {
  problemId: string;
  userId: string;
  files: SubmissionFile[];
};
