"use client";

import { useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { OnboardingLoadingPlaceholder } from "@/features/onboarding/components/onboarding-loading-placeholder";
import { ROUTES } from "@/lib/constants/routes";

/** Single `router.replace(ROUTES.home)` with loading chrome — avoids redirect loops when `/home` is unguarded. */
export function ReplaceWithHomeShell({ message }: { message: string }) {
  const router = useRouter();
  const ran = useRef(false);

  useLayoutEffect(() => {
    if (ran.current) return;
    ran.current = true;
    router.replace(ROUTES.home);
  }, [router]);

  return (
    <OnboardingLoadingPlaceholder
      message={message}
      className="flex min-h-[50vh] flex-1 flex-col items-center justify-center gap-3 px-6 py-12"
    />
  );
}
