"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { PlaceAutocompleteField } from "@/components/location/place-autocomplete-field";
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
import { isApiConfigured } from "../api";
import { ROUTES } from "@/lib/constants/routes";
import { OnboardingBackRow } from "../components/onboarding-back-row";
import { OnboardingProgress } from "../components/onboarding-progress";
import { pathAfterPlaces } from "../navigation";
import { useOnboardingSnapshotQuery, usePutSavedPlacesMutation } from "../hooks";
import { useOnboardingWizard } from "../onboarding-wizard-context";
import { placesFormDefaultsFromSnapshot } from "../lib/form-defaults";
import {
  ONBOARDING_HOME_PLACE_FIELDS,
  ONBOARDING_WORK_PLACE_FIELDS,
  onboardingPlacesSetupSchema,
  type OnboardingPlacesSetupValues,
} from "../schemas/places-setup";

function placeErr(
  errors: Partial<Record<keyof OnboardingPlacesSetupValues, { message?: string }>>,
  keys: (keyof OnboardingPlacesSetupValues)[],
): string | undefined {
  for (const k of keys) {
    const m = errors[k]?.message;
    if (m) return m;
  }
  return undefined;
}

export function PlacesSetupScreen() {
  const router = useRouter();
  const toast = useAppToast();
  const { wizardRole, wizardHydrated } = useOnboardingWizard();
  const configured = isApiConfigured();
  const { data, isPending, isError, error, refetch } = useOnboardingSnapshotQuery({
    enabled: configured,
  });
  const putPlaces = usePutSavedPlacesMutation();

  const form = useForm<OnboardingPlacesSetupValues>({
    resolver: zodResolver(onboardingPlacesSetupSchema),
    defaultValues: {
      homeLabel: "",
      homePlaceId: "",
      homeLat: "",
      homeLng: "",
      workLabel: "",
      workPlaceId: "",
      workLat: "",
      workLng: "",
    },
    mode: "onBlur",
  });

  const { control, handleSubmit, formState } = form;

  useEffect(() => {
    if (!data) return;
    form.reset(placesFormDefaultsFromSnapshot(data));
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

  const onSubmit = handleSubmit(async (values) => {
    const places = [
      {
        kind: "home" as const,
        label: values.homeLabel.trim(),
        placeId: values.homePlaceId.trim(),
        lat: values.homeLat.trim(),
        lng: values.homeLng.trim(),
        isDefault: true,
      },
      {
        kind: "work" as const,
        label: values.workLabel.trim(),
        placeId: values.workPlaceId.trim(),
        lat: values.workLat.trim(),
        lng: values.workLng.trim(),
        isDefault: true,
      },
    ];
    try {
      await putPlaces.mutateAsync(places);
      toast({ message: "Saved places updated.", variant: "success" });
      router.push(pathAfterPlaces(wizardRole));
    } catch (e) {
      toast({
        message: e instanceof Error ? e.message : "Could not save places.",
        variant: "error",
      });
    }
  });

  const homeErr = placeErr(formState.errors, [
    "homePlaceId",
    "homeLabel",
    "homeLat",
    "homeLng",
  ]);
  const workErr = placeErr(formState.errors, [
    "workPlaceId",
    "workLabel",
    "workLat",
    "workLng",
  ]);

  if (!configured) {
    return (
      <div className="flex flex-1 flex-col px-4 py-5 md:px-5">
        <MobileHeader title="Saved places" />
        <p className="mt-4 text-sm text-muted-foreground">Configure the API base URL to continue.</p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex flex-1 flex-col" aria-busy="true">
        <MobileHeader title="Saved places" />
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
        <MobileHeader title="Saved places" />
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
    <FormProvider {...form}>
      <div className="flex flex-1 flex-col">
        <MobileHeader title="Saved places" />
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-5 md:px-5">
          <OnboardingProgress wizardRole={wizardRole} />
          <OnboardingBackRow
            backHref={ROUTES.onboarding.profile}
            title="Home & work anchors"
            description="Pick places from Google suggestions. Coordinates are stored on your account for search defaults — not shown to other users until a ride is matched."
          />

          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-base">Home / usual pickup area</CardTitle>
                <CardDescription>Where you typically start from.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <PlaceAutocompleteField<OnboardingPlacesSetupValues>
                  control={control}
                  fields={ONBOARDING_HOME_PLACE_FIELDS}
                  htmlId="ob-home-place"
                  label="Search home"
                  placeholder="Neighborhood or address"
                  disabled={putPlaces.isPending}
                  helperText={homeErr}
                  helperVariant="destructive"
                />
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-base">Work / usual destination</CardTitle>
                <CardDescription>Your primary workplace or campus building.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <PlaceAutocompleteField<OnboardingPlacesSetupValues>
                  control={control}
                  fields={ONBOARDING_WORK_PLACE_FIELDS}
                  htmlId="ob-work-place"
                  label="Search work"
                  placeholder="Office or campus"
                  disabled={putPlaces.isPending}
                  helperText={workErr}
                  helperVariant="destructive"
                />
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="h-12 w-full rounded-2xl text-base"
              disabled={putPlaces.isPending}
            >
              {putPlaces.isPending ? "Saving…" : "Continue"}
            </Button>
          </form>

          <PrivacyNotice />
        </div>
      </div>
    </FormProvider>
  );
}
