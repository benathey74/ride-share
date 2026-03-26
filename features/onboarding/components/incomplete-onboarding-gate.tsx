"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { isApiConfigured } from "@/features/onboarding/api";
import { OnboardingLoadingPlaceholder } from "@/features/onboarding/components/onboarding-loading-placeholder";
import { ReplaceWithHomeShell } from "@/features/onboarding/components/replace-with-home-shell";
import { useOnboardingSnapshotQuery } from "@/features/onboarding/hooks";
import { ROUTES } from "@/lib/constants/routes";

/**
 * Passenger shell: `/home` always renders (API missing, Get started, or full home). Other routes
 * need a configured API + snapshot; otherwise replace to `/home`. When the snapshot loads,
 * require `onboardingCompletedAt` — same redirect (no loop).
 */
export function IncompleteOnboardingGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const configured = isApiConfigured();
  const { data, isPending, isError } = useOnboardingSnapshotQuery({
    enabled: configured,
  });

  const onHome = pathname === ROUTES.home || pathname === `${ROUTES.home}/`;

  if (onHome) {
    return <>{children}</>;
  }

  if (!configured) {
    return <ReplaceWithHomeShell message="Opening home…" />;
  }

  if (isPending) {
    return (
      <OnboardingLoadingPlaceholder
        message="Checking setup…"
        className="flex min-h-[50vh] flex-1 flex-col items-center justify-center gap-3 px-6 py-12"
      />
    );
  }

  if (isError || !data) {
    return <ReplaceWithHomeShell message="Opening home…" />;
  }

  if (!data.account.onboardingCompletedAt) {
    return <ReplaceWithHomeShell message="Complete setup on Home first…" />;
  }

  return <>{children}</>;
}
