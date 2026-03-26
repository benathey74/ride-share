/** localStorage key for dev-only X-User-Id override (development builds only). */
export const DEV_USER_OVERRIDE_STORAGE_KEY = "rides:dev-user-id-override";

function isDevBrowser(): boolean {
  return typeof window !== "undefined" && process.env.NODE_ENV === "development";
}

/** Numeric string or null if unset / invalid / not dev. */
export function readDevUserIdOverride(): string | null {
  if (!isDevBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(DEV_USER_OVERRIDE_STORAGE_KEY);
    if (raw == null) return null;
    const t = raw.trim();
    return /^\d+$/.test(t) ? t : null;
  } catch {
    return null;
  }
}

export function writeDevUserIdOverride(id: string): void {
  if (!isDevBrowser()) return;
  try {
    window.localStorage.setItem(DEV_USER_OVERRIDE_STORAGE_KEY, id.trim());
  } catch {
    /* ignore quota / private mode */
  }
}

/** Remove override so `NEXT_PUBLIC_DEV_USER_ID` applies again. */
export function clearDevUserIdOverride(): void {
  if (!isDevBrowser()) return;
  try {
    window.localStorage.removeItem(DEV_USER_OVERRIDE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
