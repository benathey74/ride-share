"use client";

import { useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { isApiConfigured } from "@/features/onboarding/api";
import { OnboardingLoadingPlaceholder } from "@/features/onboarding/components/onboarding-loading-placeholder";
import { ReplaceWithHomeShell } from "@/features/onboarding/components/replace-with-home-shell";
import { useOnboardingSnapshotQuery } from "@/features/onboarding/hooks";
import { writeStoredWizardRole } from "@/features/onboarding/wizard-storage";
import { ROUTES } from "@/lib/constants/routes";
import { getDriverOnlyAreaDecision } from "../lib/driver-access";
import type { OnboardingRole } from "@/features/onboarding/types";

function DriverRedirectShell({
  href,
  wizardRole,
}: {
  href: string;
  wizardRole?: OnboardingRole;
}) {
  const router = useRouter();
  const ran = useRef(false);

  useLayoutEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (wizardRole) writeStoredWizardRole(wizardRole);
    router.replace(href);
  }, [href, router, wizardRole]);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <OnboardingLoadingPlaceholder
        message="Taking you to the right place…"
        className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12"
      />
    </div>
  );
}

/**
 * Wraps driver-only routes: approved drivers pass through; others redirect without loops.
 */
export function DriverAreaGate({ children }: { children: React.ReactNode }) {
  const configured = isApiConfigured();
  const { data, isPending, isError } = useOnboardingSnapshotQuery({
    enabled: configured,
  });

  if (!configured) {
    return <ReplaceWithHomeShell message="Opening home…" />;
  }

  if (isPending) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <OnboardingLoadingPlaceholder
          message="Verifying driver access…"
          className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12"
        />
      </div>
    );
  }

  if (isError || !data) {
    return <DriverRedirectShell href={ROUTES.home} />;
  }

  const decision = getDriverOnlyAreaDecision(data);
  if (decision.action === "allow") {
    return <>{children}</>;
  }

  return <DriverRedirectShell href={decision.href} wizardRole={decision.wizardRole} />;
}
