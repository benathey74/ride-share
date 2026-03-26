"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AdminIncompleteOnboardingGate } from "@/features/onboarding/components/admin-incomplete-onboarding-gate";
import { adminNavItems } from "@/lib/navigation/items";

export function AdminLayoutClient({ children }: { children: ReactNode }) {
  return (
    <AdminIncompleteOnboardingGate>
      <AppShell title="Admin" navItems={adminNavItems}>
        {children}
      </AppShell>
    </AdminIncompleteOnboardingGate>
  );
}
