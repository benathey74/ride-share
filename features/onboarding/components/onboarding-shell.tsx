"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type OnboardingShellProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Mobile-first frame aligned with AppShell: same max width and desktop “phone” chrome, no bottom nav.
 */
export function OnboardingShell({ children, className }: OnboardingShellProps) {
  return (
    <div
      className={cn(
        "flex min-h-dvh w-full flex-col bg-background text-foreground",
        "md:bg-[radial-gradient(ellipse_85%_55%_at_50%_-8%,rgba(20,184,166,0.14),transparent),radial-gradient(ellipse_70%_45%_at_100%_40%,rgba(59,130,246,0.09),transparent),radial-gradient(ellipse_50%_40%_at_0%_80%,rgba(245,158,11,0.06),transparent)]",
      )}
    >
      <div
        className={cn(
          "flex min-h-dvh flex-1 flex-col md:items-center md:justify-center md:px-6 md:py-8 lg:px-10 lg:py-10",
        )}
      >
        <div
          className={cn(
            "mx-auto flex w-full max-w-[440px] flex-1 flex-col overflow-hidden min-h-dvh",
            "md:min-h-0 md:h-[calc(100dvh-4rem)] md:max-h-[calc(100dvh-4rem)]",
            "md:rounded-[2rem] md:border md:border-border/90 md:bg-card md:shadow-shell-desktop md:ring-1 md:ring-slate-900/[0.05]",
            className,
          )}
        >
          <div className="flex min-h-dvh flex-1 flex-col md:min-h-0 md:h-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
