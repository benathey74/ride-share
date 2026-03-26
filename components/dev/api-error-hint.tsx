"use client";

import {
  describeApiFailure,
  getApiFailurePhase,
} from "@/lib/api/errors";
import { getApiBaseUrl } from "@/lib/api/client";
import { resolveActiveUserId } from "@/lib/auth/active-user-id";

const isDev = process.env.NODE_ENV === "development";

type ApiErrorHintProps = {
  error: unknown;
};

/**
 * Development-only: env + failure phase next to API error UIs.
 */
export function ApiErrorDevHint({ error }: ApiErrorHintProps) {
  if (!isDev) return null;

  const phase = getApiFailurePhase(error);
  const phaseLabel =
    phase === "configuration"
      ? "Failed before request (missing env)"
      : phase === "network"
        ? "Failed before response (network / CORS / offline)"
        : phase === "http"
          ? "Failed after response (HTTP error)"
          : "Unknown error type";

  const { title } = describeApiFailure(error);
  const base = getApiBaseUrl();
  const { id: userId, source } = resolveActiveUserId();
  const sourceLabel =
    source === "off"
      ? "X-User-Id not sent (use session cookie)"
      : source === "dev_override"
        ? "Dev menu override"
        : source === "env"
          ? "NEXT_PUBLIC_DEV_USER_ID"
          : "default (1)";

  return (
    <div className="mt-4 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-3 font-mono text-[10px] leading-relaxed text-amber-950 dark:text-amber-100">
      <p className="font-semibold text-amber-800 dark:text-amber-200">Dev</p>
      <p className="mt-1 text-muted-foreground">
        <span className="text-foreground/80">Phase:</span> {phaseLabel}
      </p>
      <p className="mt-1 break-all">
        <span className="text-foreground/80">NEXT_PUBLIC_API_BASE_URL:</span>{" "}
        {base ? base : "(empty — set in .env.local)"}
      </p>
      <p className="mt-1">
        <span className="text-foreground/80">X-User-Id (if sent):</span> {userId || "—"}
        <span className="block text-muted-foreground">
          <span className="text-foreground/80">Source:</span> {sourceLabel}
        </span>
      </p>
      <p className="mt-1 text-muted-foreground">
        <span className="text-foreground/80">Error:</span> {title}
      </p>
    </div>
  );
}
