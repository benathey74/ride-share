"use client";

import { DevUserSwitcher } from "@/components/dev/dev-user-switcher";
import { OnboardingShell } from "@/features/onboarding/components/onboarding-shell";
import { OnboardingWizardProvider } from "@/features/onboarding/onboarding-wizard-context";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingShell>
      <DevUserSwitcher layout="strip" />
      <OnboardingWizardProvider>{children}</OnboardingWizardProvider>
    </OnboardingShell>
  );
}
