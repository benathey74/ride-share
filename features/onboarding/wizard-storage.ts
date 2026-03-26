import type { OnboardingRole } from "./types";

export const ONBOARDING_WIZARD_ROLE_STORAGE_KEY = "rides:onboarding-wizard-role";

const ROLES: readonly OnboardingRole[] = ["passenger", "driver", "both"];

function isWizardRole(raw: string | null): raw is OnboardingRole {
  return raw !== null && (ROLES as readonly string[]).includes(raw);
}

/** Read persisted wizard role (client-only). */
export function readStoredWizardRole(): OnboardingRole | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(ONBOARDING_WIZARD_ROLE_STORAGE_KEY);
  return isWizardRole(raw) ? raw : null;
}

export function writeStoredWizardRole(role: OnboardingRole): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ONBOARDING_WIZARD_ROLE_STORAGE_KEY, role);
}

export function clearStoredWizardRole(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ONBOARDING_WIZARD_ROLE_STORAGE_KEY);
}
