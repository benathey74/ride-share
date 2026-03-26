import { getOptionalDevUserIdHeader } from "@/lib/auth/active-user-id";

/**
 * Attaches identity credentials to outbound API requests.
 *
 * **Primary:** Session cookie (`credentials: 'include'` on `apiFetch`) after `POST /api/v1/auth/login`.
 *
 * **Optional dev:** When `NEXT_PUBLIC_ALLOW_DEV_IDENTITY_HEADERS=true`, sends `X-User-Id` for local
 * impersonation (ignored by the API when a valid session exists).
 */
export function applyApiAuthHeaders(headers: Headers): void {
  const id = getOptionalDevUserIdHeader();
  if (id) {
    headers.set("X-User-Id", id);
  }
}
