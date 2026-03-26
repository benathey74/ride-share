"use client";

import { useQueryClient } from "@tanstack/react-query";
import { FlaskConical } from "lucide-react";
import { useCallback, useState } from "react";
import { useAuthMeQuery } from "@/features/auth/hooks";
import { resolveDevIdentityHeader } from "@/lib/auth/active-user-id";
import {
  clearDevUserIdOverride,
  readDevUserIdOverride,
  writeDevUserIdOverride,
} from "@/lib/dev/dev-user-storage";
import { DEV_TEST_USER_PRESETS } from "@/lib/dev/dev-test-users";
import { cn } from "@/lib/utils";

type DevUserSwitcherProps = {
  /** Header chip vs full-width onboarding strip */
  layout: "compact" | "strip";
};

const ENV_SENTINEL = "__env__";

const DEV_HEADERS_ON = process.env.NEXT_PUBLIC_ALLOW_DEV_IDENTITY_HEADERS === "true";

export function DevUserSwitcher({ layout }: DevUserSwitcherProps) {
  const queryClient = useQueryClient();
  const { data: me } = useAuthMeQuery();
  const envDefault = process.env.NEXT_PUBLIC_DEV_USER_ID?.trim() || "1";

  const [selected, setSelected] = useState<string>(
    () => readDevUserIdOverride() ?? ENV_SENTINEL,
  );

  const { id: effectiveId } = resolveDevIdentityHeader();

  const applyAndRefresh = useCallback(
    (next: string) => {
      if (next === ENV_SENTINEL) {
        clearDevUserIdOverride();
      } else {
        writeDevUserIdOverride(next);
      }
      setSelected(next);
      void queryClient.invalidateQueries();
    },
    [queryClient],
  );

  if (process.env.NODE_ENV !== "development" || !DEV_HEADERS_ON) {
    return null;
  }

  const activeLabel =
    DEV_TEST_USER_PRESETS.find((p) => p.id === effectiveId)?.label ?? `User ${effectiveId}`;

  const sessionBlocksSwitcher = Boolean(me);

  if (layout === "strip") {
    return (
      <div
        className="flex shrink-0 flex-col gap-1 border-b border-amber-500/25 bg-amber-500/10 px-3 py-2"
        role="region"
        aria-label="Dev test user"
      >
        {sessionBlocksSwitcher ? (
          <p className="text-[10px] text-amber-900/90 dark:text-amber-100/90">
            <strong>Signed in</strong> — session cookie wins over <code className="text-[10px]">X-User-Id</code>.
            Sign out to use dev header impersonation.
          </p>
        ) : (
          <p className="text-[10px] text-amber-900/90 dark:text-amber-100/90">
            Optional dev impersonation via <code className="text-[10px]">X-User-Id</code> (no session).
            Enable with <code className="text-[10px]">NEXT_PUBLIC_ALLOW_DEV_IDENTITY_HEADERS=true</code>.
          </p>
        )}
        <div className="flex items-center gap-2">
          <FlaskConical className="h-3.5 w-3.5 shrink-0 text-amber-800 dark:text-amber-200" aria-hidden />
          <label className="flex min-w-0 flex-1 items-center gap-2 text-[11px] text-amber-950 dark:text-amber-50">
            <span className="shrink-0 font-semibold">Dev user</span>
            <select
              className="min-w-0 flex-1 rounded-lg border border-amber-600/30 bg-background/90 px-2 py-1 text-[11px] font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              value={selected}
              disabled={sessionBlocksSwitcher}
              title={
                sessionBlocksSwitcher
                  ? "Disabled while signed in"
                  : "Sets X-User-Id when no session"
              }
              onChange={(e) => applyAndRefresh(e.target.value)}
            >
              <option value={ENV_SENTINEL}>.env default ({envDefault})</option>
              {DEV_TEST_USER_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} · {p.label}
                </option>
              ))}
            </select>
          </label>
          <span className="hidden truncate text-[10px] text-amber-900/80 dark:text-amber-100/80 sm:inline">
            → {activeLabel}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex max-w-[min(200px,42vw)] flex-col items-end gap-0.5"
      role="region"
      aria-label="Dev test user"
    >
      {sessionBlocksSwitcher ? (
        <p className="max-w-[200px] text-right text-[9px] leading-tight text-amber-700 dark:text-amber-300">
          Session active — dev header inactive
        </p>
      ) : null}
      <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
        <FlaskConical className="h-3 w-3" aria-hidden />
        Dev
      </div>
      <select
        className={cn(
          "w-full max-w-[200px] rounded-lg border border-amber-500/35 bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-foreground",
          "dark:border-amber-400/30 dark:bg-amber-500/15",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        value={selected}
        disabled={sessionBlocksSwitcher}
        onChange={(e) => applyAndRefresh(e.target.value)}
        title={
          sessionBlocksSwitcher
            ? "Disabled while signed in"
            : `Optional X-User-Id: ${effectiveId}`
        }
      >
        <option value={ENV_SENTINEL}>.env ({envDefault})</option>
        {DEV_TEST_USER_PRESETS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.id} {p.label}
          </option>
        ))}
      </select>
    </div>
  );
}
