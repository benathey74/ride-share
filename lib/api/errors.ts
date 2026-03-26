/**
 * Thrown when `NEXT_PUBLIC_API_BASE_URL` is missing or empty at request time.
 */
export class ApiConfigurationError extends Error {
  constructor(message?: string) {
    super(
      message ??
        [
          "API base URL is not configured.",
          "",
          "Fix:",
          "1. In the frontend project root (same folder as package.json), create a file named .env.local",
          "2. Add: NEXT_PUBLIC_API_BASE_URL=http://localhost:3333",
          "3. Sign in at /login (email + password). Optional: NEXT_PUBLIC_ALLOW_DEV_IDENTITY_HEADERS=true + NEXT_PUBLIC_DEV_USER_ID for dev-only X-User-Id",
          "4. Restart the Next dev server (npm run dev) so env vars are picked up.",
        ].join("\n"),
    );
    this.name = "ApiConfigurationError";
  }
}

/** HTTP error response from the API (after a response was received). */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Network failure before a usable HTTP response (offline, wrong host, CORS, etc.). */
export class ApiNetworkError extends Error {
  constructor(
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "ApiNetworkError";
  }
}

export type ApiFailurePhase = "configuration" | "network" | "http" | "unknown";

export function getApiFailurePhase(error: unknown): ApiFailurePhase {
  if (error instanceof ApiConfigurationError) return "configuration";
  if (error instanceof ApiNetworkError) return "network";
  if (error instanceof ApiError) return "http";
  return "unknown";
}

/** User-facing title + body for passenger/home-style error cards. */
export function describeApiFailure(error: unknown): {
  title: string;
  description: string;
} {
  if (error instanceof ApiConfigurationError) {
    return {
      title: "API URL not configured",
      description: error.message,
    };
  }
  if (error instanceof ApiNetworkError) {
    return {
      title: "Cannot reach API",
      description:
        error.message ||
        "The request did not complete. Start the Adonis backend (default http://localhost:3333) and check NEXT_PUBLIC_API_BASE_URL.",
    };
  }
  if (error instanceof ApiError) {
    return {
      title: `API error (${error.status})`,
      description: error.message || "The server returned an error.",
    };
  }
  if (error instanceof Error) {
    return {
      title: "Something went wrong",
      description: error.message,
    };
  }
  return {
    title: "Something went wrong",
    description: "An unexpected error occurred.",
  };
}

export function isApiConfigurationError(e: unknown): e is ApiConfigurationError {
  return e instanceof ApiConfigurationError;
}

export function isApiNetworkError(e: unknown): e is ApiNetworkError {
  return e instanceof ApiNetworkError;
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

type VineLikeError = { field?: unknown; message?: unknown };

/**
 * Best-effort map of Adonis/Vine validation errors (422) for inline form fields.
 * Field keys match API payload keys (e.g. `originLabel`, `schedules`).
 */
export function parseApiValidationErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || error.status !== 422) {
    return {};
  }
  const body = error.body as Record<string, unknown> | undefined;
  const raw = body?.errors;
  if (!Array.isArray(raw)) {
    return {};
  }
  const out: Record<string, string> = {};
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const e = item as VineLikeError;
    const field = e.field != null ? String(e.field) : "";
    const message = e.message != null ? String(e.message) : "";
    if (field && message) {
      out[field] = message;
    }
  }
  return out;
}
