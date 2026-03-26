import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";

/** Legacy URL — driver gate UI lives on `/onboarding/finish`. */
export default function OnboardingDriverPendingRedirectPage() {
  redirect(ROUTES.onboarding.finish);
}
