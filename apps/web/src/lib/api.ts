import {
  CreateSubmissionRequest,
  EvaluationReport,
  Problem,
  ProblemSummary,
  Submission,
  SubmissionSummary,
} from "@yema/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiError(response.status, `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getProblems() {
  return request<ProblemSummary[]>("/problems");
}

export function getProblem(id: string) {
  return request<Problem>(`/problems/${id}`);
}

export function createSubmission(payload: CreateSubmissionRequest) {
  return request<{ submissionId: string; status: Submission["status"] }>("/submissions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getSubmissions() {
  return request<SubmissionSummary[]>("/submissions");
}

export function getSubmission(id: string) {
  return request<Submission>(`/submissions/${id}`);
}

export function getReport(id: string) {
  return request<EvaluationReport>(`/submissions/${id}/report`);
}

export async function tryGetReport(id: string) {
  try {
    return await getReport(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}
