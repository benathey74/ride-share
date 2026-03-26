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
import { PassengerHomeHeroBanner } from "@/features/passenger/components/passenger-home-hero-banner";
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
    title: "I’m riding first",
    description: "Search driver corridors, request a seat, and track pickups — no driving setup yet.",
    icon: CarFront,
  },
  {
    role: "driver",
    title: "I’m driving first",
    description: "Add vehicle details for review, then publish routes and manage seat requests.",
    icon: Car,
  },
  {
    role: "both",
    title: "Both riding and driving",
    description: "Complete passenger and driver steps so you can switch anytime after approval.",
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
      <PassengerHomeHeroBanner>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary [text-shadow:0_1px_1px_rgba(255,255,255,0.92),0_0_6px_rgba(255,255,255,0.8)]">
          Get started
        </p>
        <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-primary [text-shadow:-1px_-1px_0_rgba(255,255,255,0.98),1px_-1px_0_rgba(255,255,255,0.98),-1px_1px_0_rgba(255,255,255,0.98),1px_1px_0_rgba(255,255,255,0.98),0_0_2px_rgba(255,255,255,0.75)]">
          Finish setup
          <br />
          to use the app
        </h2>
        <p className="mt-3 max-w-[300px] text-sm leading-relaxed text-primary [text-shadow:0_1px_1px_rgba(255,255,255,0.95),0_0_6px_rgba(255,255,255,0.88),0_0_16px_rgba(255,255,255,0.55)]">
          We’ll save your workspace profile in one short flow. Pick what you want to do first — you
          can always ride and drive later; this only sets the first screens.
        </p>
      </PassengerHomeHeroBanner>

      <section className="space-y-3">
        <SectionHeader
          title="What do you want to do first?"
          description="Pick the path that matches today — the other role stays available once onboarding is done."
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
          <CardTitle className="text-sm font-medium">Want the full welcome flow?</CardTitle>
          <CardDescription className="text-left">
            Same choices with extra context and skip options — useful if you’re unsure which to pick.
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
