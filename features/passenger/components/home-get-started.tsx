"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car, CarFront, Users } from "lucide-react";
import { SectionHeader } from "@/components/layout/section-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PrivacyNotice } from "@/features/shared/components/privacy-notice";
import { writeStoredWizardRole } from "@/features/onboarding/wizard-storage";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import type { OnboardingRole } from "@/features/onboarding/types";

const choices: {
  role: OnboardingRole;
  title: string;
  description: string;
  icon: typeof CarFront;
}[] = [
  {
    role: "passenger",
    title: "Find a ride",
    description: "Find rides near you — search routes and request a seat.",
    icon: CarFront,
  },
  {
    role: "driver",
    title: "Offer a ride",
    description: "Set up to publish corridors and fill your seats.",
    icon: Car,
  },
  {
    role: "both",
    title: "Both",
    description: "Ride some days and drive others — full workspace access.",
    icon: Users,
  },
];

export function PassengerHomeGetStarted() {
  const router = useRouter();

  const beginOnboarding = (role: OnboardingRole) => {
    writeStoredWizardRole(role);
    router.push(ROUTES.onboarding.profile);
  };

  return (
    <div className="space-y-6 md:space-y-7">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-teal-600 to-secondary p-6 text-primary-foreground shadow-soft-lg">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/80">Get started</p>
        <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight">
          Set up your profile
          <br />
          to use Rides
        </h2>
        <p className="mt-3 max-w-[300px] text-sm leading-relaxed text-white/90">
          One quick registration-style flow saves your workspace identity. Then you can find rides
          near you or offer seats — your choice below.
        </p>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="Choose how you’ll begin"
          description="This only steers the first-time steps — you can ride and drive later regardless."
        />
        <div className="grid gap-3">
          {choices.map(({ role, title, description, icon: Icon }) => (
            <button
              key={role}
              type="button"
              onClick={() => beginOnboarding(role)}
              className={cn(
                "rounded-3xl border-2 border-border/80 bg-card p-4 text-left transition-colors",
                "hover:border-primary/40 hover:bg-primary/[0.03]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              )}
            >
              <div className="flex gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-foreground">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <Card className="rounded-3xl border-dashed border-primary/25">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Prefer the full welcome screen?</CardTitle>
          <CardDescription className="text-left">
            Same choices, plus skip options and workspace notes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="secondary" className="w-full rounded-2xl">
            <Link href={ROUTES.onboarding.welcome}>Open full setup</Link>
          </Button>
        </CardContent>
      </Card>

      <PrivacyNotice />
    </div>
  );
}
