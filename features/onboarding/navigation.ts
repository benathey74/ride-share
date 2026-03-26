import { ROUTES } from "@/lib/constants/routes";
import type { OnboardingRole } from "./types";

export function pathAfterPlaces(role: OnboardingRole | null): string {
  if (role === "driver") {
    return ROUTES.onboarding.driver;
  }
  return ROUTES.onboarding.passenger;
}

/** After passenger step: driver setup or wrap-up. */
export function pathAfterPassenger(role: OnboardingRole | null): string {
  if (role === "driver" || role === "both") {
    return ROUTES.onboarding.driver;
  }
  return ROUTES.onboarding.finish;
}
