import { readDevUserIdOverride } from "@/lib/dev/dev-user-storage";

const DEV_HEADER_ENABLED = process.env.NEXT_PUBLIC_ALLOW_DEV_IDENTITY_HEADERS === "true";

export type DevIdentitySource = "dev_override" | "env" | "default" | "off";

/**
 * Optional `X-User-Id` for local tooling only. Requires
 * `NEXT_PUBLIC_ALLOW_DEV_IDENTITY_HEADERS=true` in `.env.local`.
 * Normal flows use the API session cookie instead.
 */
export function resolveDevIdentityHeader(): { id: string; source: DevIdentitySource } {
  if (!DEV_HEADER_ENABLED) {
    return { id: "", source: "off" };
  }
  const override = readDevUserIdOverride();
  if (override != null) {
    return { id: override, source: "dev_override" };
  }
  const env = process.env.NEXT_PUBLIC_DEV_USER_ID?.trim();
  if (env) {
    return { id: env, source: "env" };
  }
  return { id: "1", source: "default" };
}

/** Returns an id to send as `X-User-Id`, or `null` when dev headers are disabled. */
export function getOptionalDevUserIdHeader(): string | null {
  const { id, source } = resolveDevIdentityHeader();
  if (source === "off" || !id) {
    return null;
  }
  return id;
}

/** @deprecated Use `getOptionalDevUserIdHeader` — session identity is cookie-based. */
export function getActiveUserIdHeader(): string {
  return getOptionalDevUserIdHeader() ?? "";
}

/** @deprecated No localStorage session; use `useAuthMeQuery` / `fetchAuthMe`. */
export function isSessionLoginActive(): boolean {
  return false;
}

/** Dev header resolution for diagnostics (same as {@link resolveDevIdentityHeader}). */
export function resolveActiveUserId(): { id: string; source: DevIdentitySource } {
  return resolveDevIdentityHeader();
}

export type ActiveUserIdSource = DevIdentitySource;
