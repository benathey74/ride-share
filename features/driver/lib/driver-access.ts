import { ROUTES } from "@/lib/constants/routes";
import type { OnboardingRole, OnboardingSnapshot } from "@/features/onboarding/types";
import { writeStoredWizardRole } from "@/features/onboarding/wizard-storage";

/** Query on `/home` when user hits driver-only routes without a driver profile. */
export const DRIVER_ACCESS_QUERY_KEY = "driver_access" as const;
export const DRIVER_ACCESS_NEED_PROFILE = "need_profile" as const;

/** Query on `/onboarding/finish` when redirected from driver-only areas. */
export const DRIVER_GATE_QUERY_KEY = "driver_gate" as const;

export type DriverGateQueryValue = "pending" | "rejected" | "revoked";

export type DriverAccessCategory =
  | "loading"
  | "onboarding_incomplete"
  | "approved_driver"
  | "pending_approval"
  | "rejected"
  | "revoked"
  | "passenger_only_no_driver_profile";

/**
 * Classifies the member’s driver state from the onboarding snapshot (same payload as GET /me/onboarding).
 */
export function getDriverAccessCategory(snapshot: OnboardingSnapshot | null | undefined): DriverAccessCategory {
  if (snapshot == null) return "loading";
  if (!snapshot.account.onboardingCompletedAt) return "onboarding_incomplete";
  if (!snapshot.driver) return "passenger_only_no_driver_profile";
  const s = snapshot.driver.approvalStatus;
  if (s === "approved") return "approved_driver";
  if (s === "rejected") return "rejected";
  if (s === "revoked") return "revoked";
  return "pending_approval";
}

/** Finish step with `?driver_gate=` for status messaging (nav + guard redirects). */
export function buildFinishDriverGateHref(gate: DriverGateQueryValue): string {
  const q = new URLSearchParams({ [DRIVER_GATE_QUERY_KEY]: gate });
  return `${ROUTES.onboarding.finish}?${q.toString()}`;
}

function gateFromApprovalStatus(status: string | undefined): DriverGateQueryValue {
  if (status === "rejected") return "rejected";
  if (status === "revoked") return "revoked";
  return "pending";
}

export type DriverOnlyAreaDecision =
  | { action: "allow" }
  | {
      action: "redirect";
      href: string;
      /** When set, written to session before navigate so /onboarding/finish can render driver gate UI. */
      wizardRole?: OnboardingRole;
    };

/**
 * Whether the current user may use driver-only app surfaces (dashboard, routes, trip requests queue).
 */
export function getDriverOnlyAreaDecision(snapshot: OnboardingSnapshot): DriverOnlyAreaDecision {
  if (snapshot.driver?.approvalStatus === "approved") {
    return { action: "allow" };
  }

  if (!snapshot.account.onboardingCompletedAt) {
    return { action: "redirect", href: ROUTES.home };
  }

  if (!snapshot.driver) {
    const q = new URLSearchParams({
      [DRIVER_ACCESS_QUERY_KEY]: DRIVER_ACCESS_NEED_PROFILE,
    });
    return { action: "redirect", href: `${ROUTES.home}?${q.toString()}` };
  }

  const gate = gateFromApprovalStatus(snapshot.driver.approvalStatus);
  const wizardRole: OnboardingRole = snapshot.account.canRide ? "both" : "driver";

  return {
    action: "redirect",
    href: buildFinishDriverGateHref(gate),
    wizardRole,
  };
}

function persistWizardRoleFromSnapshot(snapshot: OnboardingSnapshot): void {
  writeStoredWizardRole(snapshot.account.canRide ? "both" : "driver");
}

export type SharedDriveNavPresentation = {
  href: string;
  label: string;
  badge?: string;
  onBeforeNavigate?: () => void;
};

/**
 * Drive tab target for the shared (workspace) shell — aligns with {@link getDriverOnlyAreaDecision} without hitting guarded routes first.
 */
export function getSharedDriveNavPresentation(
  snapshot: OnboardingSnapshot | null | undefined,
  opts: {
    apiConfigured: boolean;
    isSnapshotPending: boolean;
    isSnapshotError?: boolean;
  },
): SharedDriveNavPresentation {
  if (!opts.apiConfigured) {
    return { href: ROUTES.home, label: "Drive" };
  }
  if (opts.isSnapshotError) {
    return { href: ROUTES.home, label: "Drive", badge: "Setup" };
  }
  if (opts.isSnapshotPending && snapshot == null) {
    return { href: ROUTES.driverDashboard, label: "Drive" };
  }
  if (snapshot == null) {
    return { href: ROUTES.home, label: "Drive", badge: "Setup" };
  }

  const cat = getDriverAccessCategory(snapshot);
  const persist = () => persistWizardRoleFromSnapshot(snapshot);

  switch (cat) {
    case "approved_driver":
      return { href: ROUTES.driverDashboard, label: "Drive" };
    case "pending_approval":
      return {
        href: buildFinishDriverGateHref("pending"),
        label: "Drive",
        badge: "Wait",
        onBeforeNavigate: persist,
      };
    case "rejected":
      return {
        href: buildFinishDriverGateHref("rejected"),
        label: "Drive",
        badge: "Fix",
        onBeforeNavigate: persist,
      };
    case "revoked":
      return {
        href: buildFinishDriverGateHref("revoked"),
        label: "Drive",
        badge: "Off",
        onBeforeNavigate: persist,
      };
    case "passenger_only_no_driver_profile":
      return {
        href: ROUTES.onboarding.driver,
        label: "Offer",
        badge: "New",
        onBeforeNavigate: persist,
      };
    case "onboarding_incomplete":
      return { href: ROUTES.home, label: "Drive", badge: "Setup" };
    default:
      return { href: ROUTES.driverDashboard, label: "Drive" };
  }
}
