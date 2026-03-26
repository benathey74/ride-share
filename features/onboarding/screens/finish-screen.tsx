"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { MobileHeader } from "@/components/layout/mobile-header";
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
import { fetchOnboardingSnapshot, isApiConfigured } from "../api";
import type { OnboardingSnapshot } from "../types";
import { ROUTES } from "@/lib/constants/routes";
import { FinishDriverRedirectNotice } from "../components/finish-driver-redirect-notice";
import { OnboardingBackRow } from "../components/onboarding-back-row";
import { OnboardingProgress } from "../components/onboarding-progress";
import { useCompleteOnboardingMutation, useOnboardingSnapshotQuery } from "../hooks";
import { useOnboardingWizard } from "../onboarding-wizard-context";
import { onboardingKeys } from "../query-keys";
import { driverGatePresentation } from "@/features/shared/lib/status-presentation";

type DriverGate = "pending" | "rejected" | "revoked" | "approved";

function driverGateFromStatus(status: string | undefined): DriverGate {
  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  if (status === "revoked") return "revoked";
  return "pending";
}

export function FinishScreen() {
  const router = useRouter();
  const toast = useAppToast();
  const queryClient = useQueryClient();
  const { wizardRole, wizardHydrated, clearWizardRole } = useOnboardingWizard();
  const configured = isApiConfigured();
  const { data, isPending, isError, error, refetch } = useOnboardingSnapshotQuery({
    enabled: configured,
  });
  const completeMutation = useCompleteOnboardingMutation();

  const [driverUi, setDriverUi] = useState<DriverGate | null>(null);

  useEffect(() => {
    if (!configured || isPending || !data || !wizardHydrated || !wizardRole) return;

    if (!data.account.onboardingCompletedAt) {
      setDriverUi(null);
      return;
    }

    if (wizardRole === "passenger") {
      router.replace(ROUTES.home);
      clearWizardRole();
      return;
    }

    const gate = driverGateFromStatus(data.driver?.approvalStatus);
    if (gate === "approved") {
      router.replace(ROUTES.home);
      clearWizardRole();
      return;
    }
    setDriverUi(gate);
  }, [clearWizardRole, configured, data, isPending, router, wizardHydrated, wizardRole]);

  useEffect(() => {
    if (!configured || isPending || !wizardHydrated) return;
    if (!wizardRole) {
      router.replace(ROUTES.onboarding.welcome);
    }
  }, [configured, isPending, router, wizardHydrated, wizardRole]);

  const goHome = () => {
    clearWizardRole();
    router.push(ROUTES.home);
  };

  const onCompleteSetup = async () => {
    try {
      await completeMutation.mutateAsync();
      await queryClient.fetchQuery({
        queryKey: onboardingKeys.snapshot(),
        queryFn: fetchOnboardingSnapshot,
      });
      toast({ message: "Onboarding complete.", variant: "success" });

      const snap = queryClient.getQueryData<OnboardingSnapshot>(onboardingKeys.snapshot());
      if (!snap) {
        goHome();
        return;
      }

      if (wizardRole === "passenger") {
        goHome();
        return;
      }

      const gate = driverGateFromStatus(snap.driver?.approvalStatus);
      if (gate === "approved") {
        goHome();
        return;
      }
      setDriverUi(gate);
    } catch (e) {
      toast({
        message: e instanceof Error ? e.message : "Could not complete onboarding.",
        variant: "error",
      });
    }
  };

  if (!configured) {
    return (
      <div className="flex flex-1 flex-col px-4 py-5 md:px-5">
        <MobileHeader title="Finish" />
        <p className="mt-4 text-sm text-muted-foreground">Configure the API base URL to continue.</p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex flex-1 flex-col" aria-busy="true">
        <MobileHeader title="Finish" />
        <div className="flex flex-1 flex-col gap-4 px-4 py-5 md:px-5">
          <div className="h-48 animate-pulse rounded-3xl bg-muted/50" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    const { title, description } = describeApiFailure(error);
    return (
      <div className="flex flex-1 flex-col">
        <MobileHeader title="Finish" />
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

  const showDriverGate = driverUi !== null && (wizardRole === "driver" || wizardRole === "both");
  const needsCompleteTap = !data.account.onboardingCompletedAt;

  const backHref =
    wizardRole === "passenger"
      ? ROUTES.onboarding.passenger
      : wizardRole === "driver"
        ? ROUTES.onboarding.places
        : ROUTES.onboarding.driver;

  const finishHeaderTitle = (() => {
    if (showDriverGate) {
      if (driverUi === "pending") return "Driver approval";
      if (driverUi === "rejected" || driverUi === "revoked") return "Driver access";
      return "Finish";
    }
    if (wizardRole === "passenger") return "Ready to ride";
    if (wizardRole === "driver") return "Finish offering rides";
    return "Almost done";
  })();

  const wrapDescription = (() => {
    if (wizardRole === "passenger") {
      return "We’ll mark onboarding complete. You can add driver details later from your profile if you want to offer rides.";
    }
    if (wizardRole === "driver") {
      return "We’ll save your progress and mark onboarding complete. Driver routes stay locked until an admin approves your vehicle.";
    }
    return "We’ll mark onboarding complete. You can ride right away; publishing routes unlocks after driver approval.";
  })();

  const pendingDriverGate =
    showDriverGate && driverUi === "pending" ? driverGatePresentation("pending") : null;
  const blockedDriverGate =
    showDriverGate && (driverUi === "rejected" || driverUi === "revoked")
      ? driverGatePresentation(driverUi)
      : null;

  return (
    <div className="flex flex-1 flex-col">
      <MobileHeader title={finishHeaderTitle} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-5 md:px-5">
        <FinishDriverRedirectNotice />
        <OnboardingProgress wizardRole={wizardRole} />

        {showDriverGate ? (
          <>
            {pendingDriverGate ? (
              <Card className="rounded-3xl border-amber-500/30 bg-amber-500/[0.06]">
                <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-900 dark:text-amber-100">
                    <Clock className="h-6 w-6" aria-hidden />
                  </span>
                  <div className="min-w-0 space-y-2">
                    <CardTitle className="text-base">{pendingDriverGate.title}</CardTitle>
                    <CardDescription className="text-left">{pendingDriverGate.body}</CardDescription>
                    <p className="text-left text-xs font-medium text-foreground/90">
                      What’s next: {pendingDriverGate.nextStep}
                    </p>
                    <ul className="list-inside list-disc space-y-1.5 text-left text-xs text-muted-foreground">
                      <li>An admin checks your make, plate, seats, and commute settings in the Admin app.</li>
                      <li>You don’t need to stay on this screen — open Home anytime to find rides.</li>
                      <li>When you’re approved, reload the app or revisit the driver area to publish routes.</li>
                    </ul>
                  </div>
                </CardHeader>
              </Card>
            ) : null}

            {blockedDriverGate ? (
              <Card className="rounded-3xl border-destructive/25 bg-destructive/5">
                <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
                    <ShieldAlert className="h-6 w-6" aria-hidden />
                  </span>
                  <div className="min-w-0 space-y-2">
                    <CardTitle className="text-base">{blockedDriverGate.title}</CardTitle>
                    <CardDescription className="text-left">{blockedDriverGate.body}</CardDescription>
                    <p className="text-left text-xs font-medium text-foreground/90">
                      What’s next: {blockedDriverGate.nextStep}
                    </p>
                    {data.driverModerationNotice?.message &&
                    data.driverModerationNotice.kind === driverUi ? (
                      <div className="rounded-2xl border border-border/70 bg-muted/35 px-3 py-2.5 text-left">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Note from your workspace
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-foreground">
                          {data.driverModerationNotice.message}
                        </p>
                      </div>
                    ) : null}
                    <ol className="list-decimal space-y-1.5 pl-4 text-left text-xs text-muted-foreground">
                      <li>Open driver setup and double-check plate, seats, make/model, and pickup radius.</li>
                      <li>Save changes — your profile updates for the next admin review.</li>
                      <li>Ask a workspace admin if you need help or believe this was a mistake.</li>
                    </ol>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <Button asChild className="rounded-2xl">
                    <Link href={ROUTES.onboarding.driver}>Update driver profile</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            <div className="flex flex-col gap-2">
              <Button type="button" className="h-12 rounded-2xl text-base" onClick={goHome}>
                {wizardRole === "both" ? "Continue as passenger" : "Go to home"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <OnboardingBackRow
              backHref={backHref}
              title={wizardRole === "passenger" ? "You’re ready" : wizardRole === "driver" ? "One last step" : "Wrap up"}
              description={wrapDescription}
            />

            <Card className="rounded-3xl border-primary/20">
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <CheckCircle2 className="h-6 w-6" aria-hidden />
                </span>
                <div className="min-w-0">
                  <CardTitle className="text-base">
                    {needsCompleteTap ? "Save & finish onboarding" : "Already complete"}
                  </CardTitle>
                  <CardDescription className="text-left">
                    {needsCompleteTap
                      ? "We record completion on the server so the app can skip this wizard next time. Profile, places, and commute prefs stay editable later."
                      : "This account is already marked complete. Head home, or go back if you want to adjust a step."}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

            {needsCompleteTap ? (
              <Button
                type="button"
                className="h-12 w-full rounded-2xl text-base"
                disabled={completeMutation.isPending}
                onClick={() => void onCompleteSetup()}
              >
                {completeMutation.isPending ? "Saving…" : "Complete setup"}
              </Button>
            ) : (
              <Button type="button" className="h-12 w-full rounded-2xl text-base" onClick={goHome}>
                Continue to app
              </Button>
            )}
          </>
        )}

        <PrivacyNotice />
      </div>
    </div>
  );
}
