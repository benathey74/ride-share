"use client";

import { useMemo } from "react";
import { isApiConfigured } from "@/features/onboarding/api";
import { useOnboardingSnapshotQuery } from "@/features/onboarding/hooks";
import { getSharedDriveNavPresentation } from "@/features/driver/lib/driver-access";
import { ROUTES } from "@/lib/constants/routes";
import type { BottomNavItem } from "@/lib/navigation/types";

/**
 * Workspace shell bottom nav: Ride + dynamic Drive + Admin + Profile.
 */
export function useSharedNavItems(): BottomNavItem[] {
  const configured = isApiConfigured();
  const { data, isPending, isError } = useOnboardingSnapshotQuery({
    enabled: configured,
  });

  return useMemo(() => {
    const snapshotUnresolved = configured && isPending && data == null;

    let driveItem: BottomNavItem;
    if (snapshotUnresolved) {
      driveItem = {
        id: "nav-drive",
        href: ROUTES.home,
        label: "Drive",
        icon: "dashboard",
        driveSlot: true,
      };
    } else {
      const drive = getSharedDriveNavPresentation(data ?? null, {
        apiConfigured: configured,
        isSnapshotPending: false,
        isSnapshotError: isError,
      });
      driveItem = {
        id: "nav-drive",
        href: drive.href,
        label: drive.label,
        icon: "dashboard",
        badge: drive.badge,
        onBeforeNavigate: drive.onBeforeNavigate,
        driveSlot: true,
      };
    }

    return [
      { href: ROUTES.home, label: "Ride", icon: "home" },
      driveItem,
      { href: ROUTES.adminDashboard, label: "Admin", icon: "admin" },
      { href: ROUTES.profile, label: "Profile", icon: "profile" },
    ];
  }, [configured, data, isError, isPending]);
}
