"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useSharedNavItems } from "@/features/shared/hooks/use-shared-nav-items";

export function SharedWorkspaceShell({ children }: { children: ReactNode }) {
  const navItems = useSharedNavItems();

  return (
    <AppShell title="Workspace" navItems={navItems}>
      {children}
    </AppShell>
  );
}
