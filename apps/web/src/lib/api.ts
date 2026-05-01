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

export type FavoriteProblemSummary = ProblemSummary & {
  isFavorite?: boolean;
};

type FavoriteListResponse =
  | FavoriteProblemSummary[]
  | { favorites: FavoriteProblemSummary[] }
  | { problems: FavoriteProblemSummary[] }
  | { items: FavoriteProblemSummary[] };

type FavoriteListEnvelope = {
  favorites?: unknown[];
  problems?: unknown[];
  items?: unknown[];
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

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export function getProblems() {
  return request<ProblemSummary[]>("/problems");
}

export function getProblem(id: string) {
  return request<Problem>(`/problems/${id}`);
}

function normalizeFavoriteProblem(problem: unknown): FavoriteProblemSummary | null {
  const candidate =
    problem && typeof problem === "object" && "problem" in problem
      ? (problem as { problem: unknown }).problem
      : problem;

  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const favorite = candidate as Partial<ProblemSummary>;
  const difficulty =
    favorite.difficulty === "easy" || favorite.difficulty === "medium" || favorite.difficulty === "hard"
      ? favorite.difficulty
      : null;

  if (!difficulty || typeof favorite.id !== "string" || typeof favorite.title !== "string") {
    return null;
  }

  return {
    id: favorite.id,
    title: favorite.title,
    difficulty,
    shortDescription: typeof favorite.shortDescription === "string" ? favorite.shortDescription : "",
    tags: Array.isArray(favorite.tags)
      ? favorite.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
    status:
      favorite.status === "solved" || favorite.status === "attempted" || favorite.status === "unstarted"
        ? favorite.status
        : undefined,
    isFavorite: true,
  };
}

function normalizeFavoriteProblems(payload: FavoriteListResponse): FavoriteProblemSummary[] {
  let items: unknown[] = [];

  if (Array.isArray(payload)) {
    items = payload;
  } else {
    const envelope = payload as FavoriteListEnvelope;

    if (Array.isArray(envelope.favorites)) {
      items = envelope.favorites;
    } else if (Array.isArray(envelope.problems)) {
      items = envelope.problems;
    } else if (Array.isArray(envelope.items)) {
      items = envelope.items;
    }
  }

  return items
    .map((problem: unknown) => normalizeFavoriteProblem(problem))
    .filter((problem): problem is FavoriteProblemSummary => problem !== null);
}

export async function getFavorites(cookieHeader?: string) {
  const payload = await request<FavoriteListResponse>("/favorites", undefined, { cookieHeader });
  return normalizeFavoriteProblems(payload);
}

export function addFavorite(problemId: string) {
  return request<void>(`/favorites/${problemId}`, {
    method: "POST",
  });
}

export function removeFavorite(problemId: string) {
  return request<void>(`/favorites/${problemId}`, {
    method: "DELETE",
  });
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
