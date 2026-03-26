import { AppShell } from "@/components/layout/app-shell";
import { IncompleteOnboardingGate } from "@/features/onboarding/components/incomplete-onboarding-gate";
import { passengerNavItems } from "@/lib/navigation/items";

export default function PassengerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <IncompleteOnboardingGate>
      <AppShell title="Rides" navItems={passengerNavItems}>
        {children}
      </AppShell>
    </IncompleteOnboardingGate>
  );
}
