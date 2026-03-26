const DEV_HINTS_KEY = "rideShare.devHintsEnabled";

export function isDevBuild(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Dev-only debug hints are opt-in even in development builds.
 * This keeps MVP testing feeling like a real product by default.
 */
export function readDevHintsEnabled(): boolean {
  if (!isDevBuild()) return false;
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DEV_HINTS_KEY) === "true";
  } catch {
    return false;
  }
}

export function writeDevHintsEnabled(next: boolean) {
  if (!isDevBuild()) return;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DEV_HINTS_KEY, next ? "true" : "false");
  } catch {
    // ignore storage failures (private mode etc.)
  }
}

