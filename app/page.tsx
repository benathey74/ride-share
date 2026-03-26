"use client";

import { useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { OnboardingLoadingPlaceholder } from "@/features/onboarding/components/onboarding-loading-placeholder";
import { ROUTES } from "@/lib/constants/routes";

/**
 * Entry: always `/home` — Home shows Get started, API misconfiguration, or snapshot errors; deep links
 * to `/onboarding` remain available from there.
 */
export default function RootPage() {
  const router = useRouter();
  const lastHref = useRef<string | null>(null);

  useLayoutEffect(() => {
    const next = ROUTES.home;
    if (lastHref.current !== next) {
      lastHref.current = next;
      router.replace(next);
    }
  }, [router]);

  return <OnboardingLoadingPlaceholder message="Opening home…" />;
}
