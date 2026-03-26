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
import { ApiErrorDevHint } from "@/components/dev/api-error-hint";
import { PrivacyNotice } from "@/features/shared/components/privacy-notice";
import { useAppToast } from "@/features/shared/components/toast-provider";
import { describeApiFailure } from "@/lib/api/errors";
import { isApiConfigured } from "../api";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import { OnboardingBackRow } from "../components/onboarding-back-row";
import { OnboardingProgress } from "../components/onboarding-progress";
import {
  useOnboardingSnapshotQuery,
  usePatchMeAccountMutation,
  usePatchMePublicProfileMutation,
} from "../hooks";
import { useOnboardingWizard } from "../onboarding-wizard-context";
import { profileFormDefaultsFromSnapshot } from "../lib/form-defaults";
import {
  onboardingProfileSetupSchema,
  type OnboardingProfileSetupValues,
} from "../schemas/profile-setup";

const EMOJI_PRESETS = ["🚗", "🚌", "🌿", "🎧", "☕", "🌙", "🐕", "📚", "🧭", "🛟"];

export function ProfileSetupScreen() {
  const router = useRouter();
  const toast = useAppToast();
  const { wizardRole, wizardHydrated } = useOnboardingWizard();
  const configured = isApiConfigured();
  const { data, isPending, isError, error, refetch } = useOnboardingSnapshotQuery({
    enabled: configured,
  });
  const publicMutation = usePatchMePublicProfileMutation();
  const accountMutation = usePatchMeAccountMutation();

  const form = useForm<OnboardingProfileSetupValues>({
    resolver: zodResolver(onboardingProfileSetupSchema),
    defaultValues: {
      alias: "",
      avatarEmoji: "",
      departmentTeam: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!data) return;
    form.reset(profileFormDefaultsFromSnapshot(data));
  }, [data, form]);

  useEffect(() => {
    if (!configured || isPending || !wizardHydrated) return;
    if (!wizardRole) {
      router.replace(ROUTES.onboarding.welcome);
    }
  }, [configured, isPending, router, wizardHydrated, wizardRole]);

  useEffect(() => {
    if (!configured || isPending || !data) return;
    if (data.account.onboardingCompletedAt) {
      router.replace(ROUTES.home);
    }
  }, [configured, data, isPending, router]);

  const saving = publicMutation.isPending || accountMutation.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await publicMutation.mutateAsync({
        alias: values.alias.trim(),
        avatar: values.avatarEmoji.trim(),
      });
      await accountMutation.mutateAsync({
        departmentTeam: values.departmentTeam.trim() || null,
        emergencyContactName: values.emergencyContactName.trim() || null,
        emergencyContactPhone: values.emergencyContactPhone.trim() || null,
      });
      toast({ message: "Profile saved.", variant: "success" });
      router.push(ROUTES.onboarding.places);
    } catch (e) {
      toast({
        message: e instanceof Error ? e.message : "Could not save profile.",
        variant: "error",
      });
    }
  });

  if (!configured) {
    return (
      <div className="flex flex-1 flex-col px-4 py-5 md:px-5">
        <MobileHeader title="Profile" />
        <p className="mt-4 text-sm text-muted-foreground">Configure the API base URL to continue.</p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex flex-1 flex-col" aria-busy="true">
        <MobileHeader title="Profile" />
        <div className="flex flex-1 flex-col gap-4 px-4 py-5 md:px-5">
          <div className="h-56 animate-pulse rounded-3xl bg-muted/50" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    const { title, description } = describeApiFailure(error);
    return (
      <div className="flex flex-1 flex-col">
        <MobileHeader title="Profile" />
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

  return (
    <div className="flex flex-1 flex-col">
      <MobileHeader title="Public profile" />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-5 md:px-5">
        <OnboardingProgress wizardRole={wizardRole} />
        <OnboardingBackRow
          backHref={ROUTES.onboarding.welcome}
          title="Who you appear as"
          description="Alias and avatar are visible to other riders. Department and emergency contact are stored on your account for safety."
        />

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-base">Identity</CardTitle>
              <CardDescription>Lowercase alias and emoji avatar — same rules as Profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ob-alias">Alias</Label>
                <Input
                  id="ob-alias"
                  autoComplete="off"
                  className="rounded-2xl"
                  disabled={saving}
                  {...form.register("alias")}
                />
                {form.formState.errors.alias ? (
                  <p className="text-xs text-destructive">{form.formState.errors.alias.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Avatar</Label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_PRESETS.map((e) => {
                    const active = form.watch("avatarEmoji") === e;
                    return (
                      <button
                        key={e}
                        type="button"
                        disabled={saving}
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-2xl border-2 text-xl transition-colors",
                          active
                            ? "border-primary bg-primary/10"
                            : "border-border/80 bg-muted/40 hover:border-primary/40",
                        )}
                        onClick={() =>
                          form.setValue("avatarEmoji", e, { shouldValidate: true, shouldDirty: true })
                        }
                      >
                        {e}
                      </button>
                    );
                  })}
                </div>
                <Input
                  className="rounded-2xl"
                  placeholder="Or paste any emoji"
                  disabled={saving}
                  {...form.register("avatarEmoji")}
                />
                {form.formState.errors.avatarEmoji ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.avatarEmoji.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ob-dept">Department / team (optional)</Label>
                <Input
                  id="ob-dept"
                  className="rounded-2xl"
                  disabled={saving}
                  {...form.register("departmentTeam")}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-base">Emergency contact</CardTitle>
              <CardDescription>Optional — leave both blank or fill both.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ob-ec-name">Name</Label>
                <Input
                  id="ob-ec-name"
                  className="rounded-2xl"
                  disabled={saving}
                  {...form.register("emergencyContactName")}
                />
                {form.formState.errors.emergencyContactName ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.emergencyContactName.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ob-ec-phone">Phone</Label>
                <Input
                  id="ob-ec-phone"
                  type="tel"
                  className="rounded-2xl"
                  disabled={saving}
                  {...form.register("emergencyContactPhone")}
                />
                {form.formState.errors.emergencyContactPhone ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.emergencyContactPhone.message}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="h-12 w-full rounded-2xl text-base" disabled={saving}>
            {saving ? "Saving…" : "Continue"}
          </Button>
        </form>

        <PrivacyNotice />
      </div>
    </div>
  );
}
