/**
 * Shared API DTO placeholders — replace when wiring the Adonis backend.
 */
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };
