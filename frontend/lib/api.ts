import { API_BASE } from "./config";

/**
 * Browser client for the Express API. The session lives in an httpOnly cookie
 * set by the API, so every request sends credentials and no token is ever
 * visible to page scripts (NFR-9).
 */

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fieldErrors: Record<string, string> = {}
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PageMeta;
  errors?: { path: string; message: string }[];
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {}
): Promise<{ data: T; message: string; meta?: PageMeta }> {
  const { json, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...rest,
      credentials: "include",
      headers: { ...(json !== undefined && { "Content-Type": "application/json" }), ...rest.headers },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Check your connection and try again.", 0);
  }

  const body = (await res.json().catch(() => null)) as Envelope<T> | null;
  if (!res.ok || !body?.success) {
    const fieldErrors: Record<string, string> = {};
    for (const e of body?.errors ?? []) fieldErrors[e.path.replace(/^(body|query|params)\./, "")] ??= e.message;
    throw new ApiError(body?.message ?? `Request failed (${res.status})`, res.status, fieldErrors);
  }
  return { data: body.data, message: body.message, meta: body.meta };
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path),
  post: <T>(path: string, json?: unknown) => apiRequest<T>(path, { method: "POST", json: json ?? {} }),
  patch: <T>(path: string, json: unknown) => apiRequest<T>(path, { method: "PATCH", json }),
  delete: <T>(path: string, json?: unknown) => apiRequest<T>(path, { method: "DELETE", json }),
  upload: <T>(path: string, form: FormData) => apiRequest<T>(path, { method: "POST", body: form }),
};
