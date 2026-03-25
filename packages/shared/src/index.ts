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

export type ProblemConfig = {
  editableFiles: EditableFile[];
  requiredSelectors: string[];
  requiredTexts: string[];
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

export type EvidenceItem = {
  id: string;
  category: "static" | "render" | "llm" | "system";
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
  screenshotPath?: string;
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
