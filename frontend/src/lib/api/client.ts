/**
 * API client for your Node.js / Express / MongoDB backend.
 *
 * Configure the base URL with the env var VITE_API_BASE_URL.
 * Example .env entry:
 *   VITE_API_BASE_URL=http://localhost:4000/api
 *
 * All requests use JSON. Auth uses a Bearer JWT stored in localStorage
 * under the key `auth_token`. Set/clear it via setAuthToken().
 */

const TOKEN_KEY = "auth_token";

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:3000/api";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

type ReqOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  query?: Record<string, string | number | boolean | undefined | null>;
  auth?: boolean; // attach JWT if available (default true)
  signal?: AbortSignal;
};

function buildQuery(q?: ReqOptions["query"]): string {
  if (!q) return "";
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) {
    if (v === undefined || v === null || v === "") continue;
    params.set(k, String(v));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

export async function apiFetch<T = any>(
  path: string,
  opts: ReqOptions = {},
): Promise<T> {
  const { method = "GET", body, query, auth = true, signal } = opts;

  const isFormData = body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  // Do NOT set Content-Type for FormData — the browser sets it automatically
  // with the correct multipart boundary.
  if (body !== undefined && !isFormData) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${path}${buildQuery(query)}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (e: any) {
    throw new ApiError(0, e?.message ?? "Network error");
  }

  const text = await res.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && (data.message || data.error)) ||
      `Request failed (${res.status})`;
    throw new ApiError(res.status, String(message), data);
  }

  // If we expected JSON but got an HTML string (e.g. from a dev server fallback)
  if (typeof data === "string" && data.trim().startsWith("<")) {
    throw new ApiError(res.status, "Expected JSON but received HTML", data);
  }

  return data as T;
}
