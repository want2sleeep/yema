export const EVALUATION_QUEUE = "submission-evaluation";
export const EVALUATION_JOB = "submission:evaluate";

export type EvaluationJobPayload = {
  submissionId: string;
  problemId: string;
};

