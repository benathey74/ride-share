"use client";

import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";
import type { OnboardingRole } from "../types";
import { cn } from "@/lib/utils";

const STEP_ORDER = [
  ROUTES.onboarding.welcome,
  ROUTES.onboarding.profile,
  ROUTES.onboarding.places,
  ROUTES.onboarding.passenger,
  ROUTES.onboarding.driver,
  ROUTES.onboarding.finish,
] as const;

function stepsForRole(role: OnboardingRole | null): readonly string[] {
  if (role === "passenger") {
    return [
      ROUTES.onboarding.welcome,
      ROUTES.onboarding.profile,
      ROUTES.onboarding.places,
      ROUTES.onboarding.passenger,
      ROUTES.onboarding.finish,
    ];
  }
  if (role === "driver") {
    return [
      ROUTES.onboarding.welcome,
      ROUTES.onboarding.profile,
      ROUTES.onboarding.places,
      ROUTES.onboarding.driver,
      ROUTES.onboarding.finish,
    ];
  }
  return STEP_ORDER;
}

type OnboardingProgressProps = {
  wizardRole: OnboardingRole | null;
  className?: string;
};

export function OnboardingProgress({ wizardRole, className }: OnboardingProgressProps) {
  const pathname = usePathname() ?? "";
  const steps = stepsForRole(wizardRole);
  const idx = steps.findIndex((p) => pathname === p || pathname.startsWith(`${p}/`));
  const current = idx >= 0 ? idx + 1 : 0;

  if (!wizardRole || current === 0) {
    return null;
  }

  return (
    <p
      className={cn(
        "text-center text-xs font-medium uppercase tracking-wider text-muted-foreground",
        className,
      )}
    >
      Step {current} of {steps.length}
    </p>
  );
}
