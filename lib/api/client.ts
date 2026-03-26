/**
 * Browser-side HTTP client for the Adonis API.
 * Reads NEXT_PUBLIC_* from .env.local (Next.js injects at build/dev server start).
 */

import {
  ApiConfigurationError,
  ApiError,
  ApiNetworkError,
} from "@/lib/api/errors";
import { applyApiAuthHeaders } from "@/lib/api/auth-headers";

export { ApiConfigurationError, ApiError, ApiNetworkError } from "@/lib/api/errors";
export {
  getActiveUserIdHeader,
  getDevUserIdHeader,
  getOptionalDevUserIdHeader,
  isSessionLoginActive,
  resolveActiveUserId,
  resolveDevIdentityHeader,
} from "@/lib/api/dev-identity";

export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";
  return raw.replace(/\/$/, "");
}

export function assertApiConfigured(): string {
  const base = getApiBaseUrl();
  if (!base) {
    throw new ApiConfigurationError();
  }
  return base;
}

type ApiEnvelope = { data?: unknown };

function parseJson(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/**
 * Probe backend liveness without requiring API routes or auth wrappers.
 * Uses GET /health (plain JSON, not Adonis `data` envelope).
 */
export async function checkApiHealth(): Promise<
  | { ok: true }
  | {
      ok: false;
      reason: "not_configured" | "network" | "http";
      status?: number;
    }
> {
  const base = getApiBaseUrl();
  if (!base) {
    return { ok: false, reason: "not_configured" };
  }
  const url = `${base}/health`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      return { ok: false, reason: "http", status: res.status };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "network" };
  }
}

/**
 * Low-level JSON fetch with base URL, dev identity header, and JSON Accept.
 */
export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<unknown> {
  const base = assertApiConfigured();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  applyApiAuthHeaders(headers);
  if (
    init.body != null &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers,
      credentials: init.credentials ?? "include",
    });
  } catch (cause) {
    const msg = cause instanceof Error ? cause.message : String(cause);
    throw new ApiNetworkError(
      `Could not reach ${base}. Is the Adonis server running (e.g. port 3333)? (${msg})`,
      { cause },
    );
  }

  const text = await res.text();
  const json = parseJson(text);

  if (!res.ok) {
    const msg =
      (json as { message?: string } | null)?.message ??
      (typeof json === "object" && json !== null && "errors" in json
        ? "Validation failed"
        : res.statusText);
    throw new ApiError(msg || `Request failed (${res.status})`, res.status, json);
  }

  return json;
}

export function unwrapData<T>(json: unknown): T {
  if (!json || typeof json !== "object") {
    throw new ApiError("Invalid API response", 500, json);
  }
  const data = (json as ApiEnvelope).data;
  if (data === undefined) {
    throw new ApiError("API response missing data wrapper", 500, json);
  }
  return data as T;
}

export async function apiGetJson(path: string): Promise<unknown> {
  return apiFetch(path, { method: "GET" });
}

export async function apiPatchJson(path: string, body: unknown): Promise<unknown> {
  return apiFetch(path, {
    method: "PATCH",
    body: JSON.stringify(body ?? {}),
  });
}

export async function apiPutJson(path: string, body: unknown): Promise<unknown> {
  return apiFetch(path, {
    method: "PUT",
    body: JSON.stringify(body ?? {}),
  });
}

export async function apiPostJson(path: string, body: unknown): Promise<unknown> {
  return apiFetch(path, {
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });
}

/**
 * POST JSON without optional dev `X-User-Id` (auth register/login/logout).
 * Still sends cookies so session can be created or cleared.
 */
export async function apiPostJsonWithoutAuth(path: string, body: unknown): Promise<unknown> {
  const base = assertApiConfigured();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers();
  headers.set("Accept", "application/json");
  headers.set("Content-Type", "application/json");

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(body ?? {}),
    });
  } catch (cause) {
    const msg = cause instanceof Error ? cause.message : String(cause);
    throw new ApiNetworkError(
      `Could not reach ${base}. Is the Adonis server running (e.g. port 3333)? (${msg})`,
      { cause },
    );
  }

  const text = await res.text();
  const json = parseJson(text);

  if (!res.ok) {
    const msg =
      (json as { message?: string } | null)?.message ??
      (typeof json === "object" && json !== null && "errors" in json
        ? "Validation failed"
        : res.statusText);
    throw new ApiError(msg || `Request failed (${res.status})`, res.status, json);
  }

  return json;
}
