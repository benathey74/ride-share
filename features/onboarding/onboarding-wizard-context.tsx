"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { OnboardingRole } from "./types";
import {
  clearStoredWizardRole,
  readStoredWizardRole,
  writeStoredWizardRole,
} from "./wizard-storage";

type OnboardingWizardContextValue = {
  wizardRole: OnboardingRole | null;
  /** False until sessionStorage has been read (avoid finish → welcome flash). */
  wizardHydrated: boolean;
  setWizardRole: (role: OnboardingRole) => void;
  clearWizardRole: () => void;
};

const OnboardingWizardContext = createContext<OnboardingWizardContextValue | null>(null);

export function OnboardingWizardProvider({ children }: { children: ReactNode }) {
  const [wizardRole, setWizardRoleState] = useState<OnboardingRole | null>(null);
  const [wizardHydrated, setWizardHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredWizardRole();
    if (stored) setWizardRoleState(stored);
    setWizardHydrated(true);
  }, []);

  const setWizardRole = useCallback((role: OnboardingRole) => {
    writeStoredWizardRole(role);
    setWizardRoleState(role);
  }, []);

  const clearWizardRole = useCallback(() => {
    clearStoredWizardRole();
    setWizardRoleState(null);
  }, []);

  const value = useMemo(
    () => ({ wizardRole, wizardHydrated, setWizardRole, clearWizardRole }),
    [wizardRole, wizardHydrated, setWizardRole, clearWizardRole],
  );

  return (
    <OnboardingWizardContext.Provider value={value}>{children}</OnboardingWizardContext.Provider>
  );
}

export function useOnboardingWizard() {
  const ctx = useContext(OnboardingWizardContext);
  if (!ctx) {
    throw new Error("useOnboardingWizard must be used within OnboardingWizardProvider");
  }
  return ctx;
}
