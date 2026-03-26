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
import { describeApiFailure } from "@/lib/api/errors";
import { isApiConfigured } from "../api";
import { ROUTES } from "@/lib/constants/routes";
import { OnboardingBackRow } from "../components/onboarding-back-row";
import { OnboardingProgress } from "../components/onboarding-progress";
import { useOnboardingSnapshotQuery, usePutDriverProfileMutation } from "../hooks";
import { useOnboardingWizard } from "../onboarding-wizard-context";
import { driverFormDefaultsFromSnapshot } from "../lib/form-defaults";
import {
  onboardingDriverSchema,
  type OnboardingDriverValues,
} from "../schemas/driver-onboarding";

export function DriverOnboardingScreen() {
  const router = useRouter();
  const toast = useAppToast();
  const { wizardRole, wizardHydrated } = useOnboardingWizard();
  const configured = isApiConfigured();
  const { data, isPending, isError, error, refetch } = useOnboardingSnapshotQuery({
    enabled: configured,
  });
  const putDriver = usePutDriverProfileMutation();

  const form = useForm<OnboardingDriverValues>({
    resolver: zodResolver(onboardingDriverSchema),
    defaultValues: {
      vehicleMake: "",
      vehicleModel: "",
      vehicleColor: "",
      plateNumber: "",
      seatsTotal: 4,
      detourToleranceMinutes: 10,
      pickupRadiusMeters: 400,
      commuteNotes: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!data) return;
    form.reset(driverFormDefaultsFromSnapshot(data));
  }, [data, form]);

  useEffect(() => {
    if (!configured || isPending || !wizardHydrated) return;
    if (!wizardRole) {
      router.replace(ROUTES.onboarding.welcome);
      return;
    }
    if (wizardRole === "passenger") {
      router.replace(ROUTES.onboarding.passenger);
    }
  }, [configured, isPending, router, wizardHydrated, wizardRole]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await putDriver.mutateAsync({
        vehicleMake: values.vehicleMake.trim(),
        vehicleModel: values.vehicleModel.trim(),
        vehicleColor: values.vehicleColor.trim(),
        plateNumber: values.plateNumber.trim(),
        seatsTotal: values.seatsTotal,
        detourToleranceMinutes: values.detourToleranceMinutes,
        pickupRadiusMeters: values.pickupRadiusMeters,
        commuteNotes: values.commuteNotes.trim() || null,
      });
      toast({ message: "Driver profile saved. Complete setup on the next step.", variant: "success" });
      router.push(ROUTES.onboarding.finish);
    } catch (e) {
      toast({
        message: e instanceof Error ? e.message : "Could not save driver profile.",
        variant: "error",
      });
    }
  });

  if (!configured) {
    return (
      <div className="flex flex-1 flex-col px-4 py-5 md:px-5">
        <MobileHeader title="Driver profile" />
        <p className="mt-4 text-sm text-muted-foreground">Configure the API base URL to continue.</p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex flex-1 flex-col" aria-busy="true">
        <MobileHeader title="Driver profile" />
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
        <MobileHeader title="Driver profile" />
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

  if (wizardRole === "passenger") {
    return null;
  }

  const backHref =
    wizardRole === "both" ? ROUTES.onboarding.passenger : ROUTES.onboarding.places;

  return (
    <div className="flex flex-1 flex-col">
      <MobileHeader title="Driver profile" />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-5 md:px-5">
        <OnboardingProgress wizardRole={wizardRole} />
        <OnboardingBackRow
          backHref={backHref}
          title="Vehicle & corridor prefs"
          description="Submitted to your workspace for approval. You can update and resubmit if rejected."
        />

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-base">Vehicle</CardTitle>
              <CardDescription>What riders will look for at pickup.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="ob-make">Make</Label>
                <Input
                  id="ob-make"
                  className="rounded-2xl"
                  disabled={putDriver.isPending}
                  {...form.register("vehicleMake")}
                />
                {form.formState.errors.vehicleMake ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.vehicleMake.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="ob-model">Model</Label>
                <Input
                  id="ob-model"
                  className="rounded-2xl"
                  disabled={putDriver.isPending}
                  {...form.register("vehicleModel")}
                />
                {form.formState.errors.vehicleModel ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.vehicleModel.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ob-color">Color</Label>
                <Input
                  id="ob-color"
                  className="rounded-2xl"
                  disabled={putDriver.isPending}
                  {...form.register("vehicleColor")}
                />
                {form.formState.errors.vehicleColor ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.vehicleColor.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ob-plate">Plate</Label>
                <Input
                  id="ob-plate"
                  className="rounded-2xl"
                  disabled={putDriver.isPending}
                  {...form.register("plateNumber")}
                />
                {form.formState.errors.plateNumber ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.plateNumber.message}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-base">Capacity & pickup</CardTitle>
              <CardDescription>Aligned with live route creation limits.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="ob-seats">Seats offered</Label>
                <Input
                  id="ob-seats"
                  type="number"
                  min={1}
                  max={20}
                  className="rounded-2xl"
                  disabled={putDriver.isPending}
                  {...form.register("seatsTotal", { valueAsNumber: true })}
                />
                {form.formState.errors.seatsTotal ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.seatsTotal.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ob-detour">Detour ± (minutes)</Label>
                <Input
                  id="ob-detour"
                  type="number"
                  min={0}
                  max={120}
                  className="rounded-2xl"
                  disabled={putDriver.isPending}
                  {...form.register("detourToleranceMinutes", { valueAsNumber: true })}
                />
                {form.formState.errors.detourToleranceMinutes ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.detourToleranceMinutes.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ob-radius">Pickup radius (m)</Label>
                <Input
                  id="ob-radius"
                  type="number"
                  min={50}
                  max={5000}
                  className="rounded-2xl"
                  disabled={putDriver.isPending}
                  {...form.register("pickupRadiusMeters", { valueAsNumber: true })}
                />
                {form.formState.errors.pickupRadiusMeters ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.pickupRadiusMeters.message}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-base">Commute notes</CardTitle>
              <CardDescription>Optional context for admins.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-[96px] rounded-2xl"
                placeholder="Usual highway, HOV lane, campus gate…"
                disabled={putDriver.isPending}
                {...form.register("commuteNotes")}
              />
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="h-12 w-full rounded-2xl text-base"
            disabled={putDriver.isPending}
          >
            {putDriver.isPending ? "Saving…" : "Continue"}
          </Button>
        </form>

        <PrivacyNotice />
      </div>
    </div>
  );
}
