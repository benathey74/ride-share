"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car, CarFront, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { SectionHeader } from "@/components/layout/section-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiErrorDevHint } from "@/components/dev/api-error-hint";
import { PrivacyNotice } from "@/features/shared/components/privacy-notice";
import { useAppToast } from "@/features/shared/components/toast-provider";
import { describeApiFailure } from "@/lib/api/errors";
import { isApiConfigured } from "../api";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import {
  useCompleteOnboardingMutation,
  useOnboardingSnapshotQuery,
} from "../hooks";
import { useOnboardingWizard } from "../onboarding-wizard-context";
import { onboardingWelcomeSchema, type OnboardingWelcomeValues } from "../schemas/welcome";
import type { OnboardingRole } from "../types";

const roleCards: {
  role: OnboardingRole;
  title: string;
  description: string;
  icon: typeof CarFront;
}[] = [
  {
    role: "passenger",
    title: "Find a Ride",
    description: "Search routes, request seats, and ride with colleagues.",
    icon: CarFront,
  },
  {
    role: "driver",
    title: "Offer a Ride",
    description: "Publish corridors, manage requests, and fill your seats.",
    icon: Car,
  },
  {
    role: "both",
    title: "Both",
    description: "Ride some days and drive others — full workspace access.",
    icon: Users,
  },
];

export function WelcomeScreen() {
  const router = useRouter();
  const toast = useAppToast();
  const { setWizardRole } = useOnboardingWizard();
  const configured = isApiConfigured();
  const { data, isPending, isError, error, refetch } = useOnboardingSnapshotQuery({
    enabled: configured,
  });
  const skipMutation = useCompleteOnboardingMutation();

  const form = useForm<OnboardingWelcomeValues>({
    resolver: zodResolver(onboardingWelcomeSchema),
    defaultValues: { role: "passenger" },
  });

  const selected = form.watch("role");

  useEffect(() => {
    if (!configured || isPending || !data) return;
    if (data.account.onboardingCompletedAt) {
      router.replace(ROUTES.home);
    }
  }, [configured, data, isPending, router]);

  const onContinue = form.handleSubmit(async (values) => {
    setWizardRole(values.role);
    router.push(ROUTES.onboarding.profile);
  });

  if (!configured) {
    return (
      <div className="flex flex-1 flex-col gap-4 px-4 py-5 md:px-5">
        <Card className="rounded-3xl border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-base">API not configured</CardTitle>
            <CardDescription className="text-left">
              Set <code className="rounded bg-muted px-1">NEXT_PUBLIC_API_BASE_URL</code> in{" "}
              <code className="rounded bg-muted px-1">.env.local</code> so onboarding can load your
              profile from the server.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex flex-1 flex-col gap-4 px-4 py-5 md:px-5" aria-busy="true" aria-label="Loading">
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-center text-sm text-muted-foreground">Loading your workspace profile…</p>
        </div>
        <div className="h-36 animate-pulse rounded-[2rem] bg-muted/50" />
        <div className="h-44 animate-pulse rounded-3xl bg-muted/40" />
      </div>
    );
  }

  if (isError || !data) {
    const { title, description } = describeApiFailure(error);
    return (
      <div className="flex flex-1 flex-col gap-4 px-4 py-5 md:px-5">
        <Card className="rounded-3xl border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="whitespace-pre-wrap text-left">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" variant="secondary" className="rounded-2xl" onClick={() => refetch()}>
              Retry
            </Button>
            <ApiErrorDevHint error={error} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-5 md:px-5">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-teal-600 to-secondary p-6 text-primary-foreground shadow-soft-lg">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/80">Welcome</p>
        <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight">
          Set up Rides
          <br />
          for your workspace
        </h2>
        <p className="mt-3 max-w-[280px] text-sm leading-relaxed text-white/90">
          Your progress is saved to the server step by step. Dev identity uses the{" "}
          <code className="rounded bg-white/15 px-1 text-[11px]">X-User-Id</code> header until real auth
          ships.
        </p>
      </section>

      <SectionHeader
        title="How will you use Rides?"
        description="This only steers the steps you see — you can drive and ride later regardless."
      />

      <form className="space-y-4" onSubmit={onContinue} noValidate>
        <div className="grid gap-3">
          {roleCards.map(({ role, title, description, icon: Icon }) => {
            const active = selected === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => form.setValue("role", role, { shouldValidate: true })}
                className={cn(
                  "rounded-3xl border-2 p-4 text-left transition-colors",
                  active
                    ? "border-primary bg-primary/8 shadow-sm"
                    : "border-border/80 bg-card hover:border-primary/40",
                )}
              >
                <div className="flex gap-3">
                  <span
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                    )}
                  >
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <CardTitle className="text-base">{title}</CardTitle>
                    <CardDescription className="mt-1 text-left">{description}</CardDescription>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {form.formState.errors.role ? (
          <p className="text-xs text-destructive">{form.formState.errors.role.message}</p>
        ) : null}

        <Button type="submit" className="h-12 w-full rounded-2xl text-base">
          Continue
        </Button>
      </form>

      <PrivacyNotice />

      <Card className="rounded-3xl border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Need the app now?</CardTitle>
          <CardDescription className="text-left">
            Marks onboarding complete on the server. You still need a public alias (Profile) before
            other riders and drivers see you clearly — finish that when you can.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="secondary"
            className="w-full rounded-2xl"
            disabled={skipMutation.isPending}
            onClick={async () => {
              try {
                await skipMutation.mutateAsync();
                toast({ message: "Onboarding skipped — you can continue in the app.", variant: "success" });
                router.push(ROUTES.home);
              } catch (e) {
                toast({
                  message: e instanceof Error ? e.message : "Could not update profile.",
                  variant: "error",
                });
              }
            }}
          >
            {skipMutation.isPending ? "Saving…" : "Skip wizard for now"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
