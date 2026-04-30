import {
  AuthResponse,
  CreateSubmissionRequest,
  EvaluationReport,
  LoginRequest,
  Problem,
  ProblemSummary,
  RegisterRequest,
  Submission,
  SubmissionSummary,
} from "@yema/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

type RequestOptions = {
  cookieHeader?: string;
};

async function request<T>(path: string, init?: RequestInit, options?: RequestOptions): Promise<T> {
  const headers: Record<string, string> = {
    ...(options?.cookieHeader ? { Cookie: options.cookieHeader } : {}),
    ...((init?.headers as Record<string, string> | undefined) ?? {}),
  };

  if (init?.body !== undefined && !("Content-Type" in headers)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    cache: "no-store",
    credentials: "include",
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

export function getSubmissions(cookieHeader?: string) {
  return request<SubmissionSummary[]>("/submissions", undefined, { cookieHeader });
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

export function register(payload: RegisterRequest) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload: LoginRequest) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logout() {
  return request<{ ok: boolean }>("/auth/logout", {
    method: "POST",
  });
}

export function getCurrentUser(cookieHeader?: string) {
  return request<AuthResponse>("/auth/me", undefined, { cookieHeader });
}
