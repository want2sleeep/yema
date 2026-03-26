import { SubmissionStatus } from "@yema/shared";

const submissionStatusLabelMap: Record<SubmissionStatus, string> = {
  queued: "排队中",
  running: "评测中",
  completed: "已完成",
  failed: "已失败",
};

export function formatSubmissionStatus(status: SubmissionStatus) {
  return submissionStatusLabelMap[status];
}

