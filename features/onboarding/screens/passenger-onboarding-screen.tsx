"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MobileHeader } from "@/components/layout/mobile-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiErrorDevHint } from "@/components/dev/api-error-hint";
import { PrivacyNotice } from "@/features/shared/components/privacy-notice";
import { useAppToast } from "@/features/shared/components/toast-provider";
import { WEEKDAY_SHORT } from "@/features/driver/schemas/create-route-form";
import { describeApiFailure } from "@/lib/api/errors";
import { isApiConfigured } from "../api";
import { ROUTES } from "@/lib/constants/routes";
import { OnboardingBackRow } from "../components/onboarding-back-row";
import { OnboardingProgress } from "../components/onboarding-progress";
import { pathAfterPassenger } from "../navigation";
import { useOnboardingSnapshotQuery, usePutPassengerProfileMutation } from "../hooks";
import { useOnboardingWizard } from "../onboarding-wizard-context";
import { normalizeTimeHm, passengerFormDefaultsFromSnapshot } from "../lib/form-defaults";
import {
  onboardingPassengerSchema,
  type OnboardingPassengerValues,
} from "../schemas/passenger-onboarding";

export function PassengerOnboardingScreen() {
  const router = useRouter();
  const toast = useAppToast();
  const { wizardRole, wizardHydrated } = useOnboardingWizard();
  const configured = isApiConfigured();
  const { data, isPending, isError, error, refetch } = useOnboardingSnapshotQuery({
    enabled: configured,
  });
  const putPassenger = usePutPassengerProfileMutation();

  const form = useForm<OnboardingPassengerValues>({
    resolver: zodResolver(onboardingPassengerSchema),
    defaultValues: {
      commuteDays: [1, 2, 3, 4, 5],
      preferredMorningTime: "08:00",
      preferredEveningTime: "17:30",
      ridePreferences: "",
    },
    mode: "onBlur",
  });

  const selectedDays = form.watch("commuteDays") ?? [];

  useEffect(() => {
    if (!data) return;
    form.reset(passengerFormDefaultsFromSnapshot(data));
  }, [data, form]);

  useEffect(() => {
    if (!configured || isPending || !wizardHydrated) return;
    if (!wizardRole) {
      router.replace(ROUTES.onboarding.welcome);
      return;
    }
    if (wizardRole === "driver") {
      router.replace(ROUTES.onboarding.driver);
    }
  }, [configured, isPending, router, wizardHydrated, wizardRole]);

  useEffect(() => {
    if (!configured || isPending || !data) return;
    if (data.account.onboardingCompletedAt) {
      router.replace(ROUTES.home);
    }
  }, [configured, data, isPending, router]);

  const toggleDay = (day: number) => {
    const next = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day].sort((a, b) => a - b);
    form.setValue("commuteDays", next, { shouldValidate: true });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const morning = normalizeTimeHm(values.preferredMorningTime, "08:00");
    const evening = normalizeTimeHm(values.preferredEveningTime, "17:30");
    try {
      await putPassenger.mutateAsync({
        accessibilityNotes: null,
        usualCommuteDays: values.commuteDays,
        preferredMorningTime: morning,
        preferredEveningTime: evening,
        ridePreferences: values.ridePreferences.trim() || null,
      });
      toast({ message: "Rider preferences saved.", variant: "success" });
      router.push(pathAfterPassenger(wizardRole));
    } catch (e) {
      toast({
        message: e instanceof Error ? e.message : "Could not save preferences.",
        variant: "error",
      });
    }
  });

  if (!configured) {
    return (
      <div className="flex flex-1 flex-col px-4 py-5 md:px-5">
        <MobileHeader title="Riding preferences" />
        <p className="mt-4 text-sm text-muted-foreground">Configure the API base URL to continue.</p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex flex-1 flex-col" aria-busy="true">
        <MobileHeader title="Riding preferences" />
        <div className="flex flex-1 flex-col gap-4 px-4 py-5 md:px-5">
          <div className="h-64 animate-pulse rounded-3xl bg-muted/50" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    const { title, description } = describeApiFailure(error);
    return (
      <div className="flex flex-1 flex-col">
        <MobileHeader title="Riding preferences" />
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
      </div>
    );
  }

  if (wizardRole === "driver") {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <MobileHeader title="Riding preferences" />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-5 md:px-5">
        <OnboardingProgress wizardRole={wizardRole} />
        <OnboardingBackRow
          backHref={ROUTES.onboarding.places}
          title="Passenger habits"
          description="Helps pre-fill search and requests. Stored on your passenger profile."
        />

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-base">Usual commute days</CardTitle>
              <CardDescription>Which days you typically need a ride.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {WEEKDAY_SHORT.map((label, day) => (
                  <Button
                    key={label}
                    type="button"
                    size="sm"
                    variant={selectedDays.includes(day) ? "default" : "outline"}
                    className="rounded-xl px-3"
                    disabled={putPassenger.isPending}
                    onClick={() => toggleDay(day)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
              {form.formState.errors.commuteDays ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.commuteDays.message}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-base">Preferred times</CardTitle>
              <CardDescription>Typical morning and return windows (24h).</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ob-morning">Morning</Label>
                <Input
                  id="ob-morning"
                  type="time"
                  className="rounded-2xl"
                  disabled={putPassenger.isPending}
                  {...form.register("preferredMorningTime")}
                />
                {form.formState.errors.preferredMorningTime ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.preferredMorningTime.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ob-evening">Return / evening</Label>
                <Input
                  id="ob-evening"
                  type="time"
                  className="rounded-2xl"
                  disabled={putPassenger.isPending}
                  {...form.register("preferredEveningTime")}
                />
                {form.formState.errors.preferredEveningTime ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.preferredEveningTime.message}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-base">Ride preferences</CardTitle>
              <CardDescription>Quiet ride, temperature, music — shared only in context of trips later.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-[96px] rounded-2xl"
                placeholder="Optional"
                disabled={putPassenger.isPending}
                {...form.register("ridePreferences")}
              />
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="h-12 w-full rounded-2xl text-base"
            disabled={putPassenger.isPending}
          >
            {putPassenger.isPending
              ? "Saving…"
              : wizardRole === "both"
                ? "Continue"
                : "Continue to finish"}
          </Button>
        </form>

        <PrivacyNotice />
      </div>
    </div>
  );
}
