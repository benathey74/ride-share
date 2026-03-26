import {
  ApiError,
  ApiNetworkError,
  assertApiConfigured,
  unwrapData,
  apiPostJsonWithoutAuth,
} from "@/lib/api/client";
import type { AuthAccount, IntendedRole } from "@/features/auth/types";

function parseJson(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/**
 * Current session user, or `null` if not signed in (401).
 */
export async function fetchAuthMe(): Promise<AuthAccount | null> {
  const base = assertApiConfigured();
  const url = `${base}/api/v1/auth/me`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
  } catch (cause) {
    const msg = cause instanceof Error ? cause.message : String(cause);
    throw new ApiNetworkError(`Could not reach ${base}. (${msg})`, { cause });
  }
  const text = await res.text();
  const json = parseJson(text);
  if (res.status === 401) {
    return null;
  }
  if (!res.ok) {
    const msg =
      (json as { message?: string } | null)?.message ??
      (typeof json === "object" && json !== null && "errors" in json
        ? "Validation failed"
        : res.statusText);
    throw new ApiError(msg || `Request failed (${res.status})`, res.status, json);
  }
  return unwrapData<AuthAccount>(json);
}

export async function fetchLogin(email: string, password: string): Promise<AuthAccount> {
  const json = await apiPostJsonWithoutAuth("/api/v1/auth/login", { email, password });
  return unwrapData<AuthAccount>(json);
}

export async function fetchRegister(
  email: string,
  password: string,
  intendedRole: IntendedRole,
): Promise<AuthAccount> {
  const json = await apiPostJsonWithoutAuth("/api/v1/auth/register", {
    email,
    password,
    intendedRole,
  });
  return unwrapData<AuthAccount>(json);
}

export async function fetchLogout(): Promise<void> {
  await apiPostJsonWithoutAuth("/api/v1/auth/logout", {});
}
