"use client";

import Link from "next/link";
import { Car, MapPin, Search } from "lucide-react";
import { SectionHeader } from "@/components/layout/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CorridorMapPreview } from "@/components/maps/corridor-map-preview";
import { ApiErrorDevHint } from "@/components/dev/api-error-hint";
import { isApiConfigured } from "@/features/onboarding/api";
import { useOnboardingSnapshotQuery } from "@/features/onboarding/hooks";
import { PassengerHomeGetStarted } from "@/features/passenger/components/home-get-started";
import { usePassengerHomeQuery } from "@/features/passenger/hooks";
import { PrivacyNotice } from "@/features/shared/components/privacy-notice";
import { describeApiFailure } from "@/lib/api/errors";
import {
  formatApproximatePickup,
  publicAliasLabel,
} from "@/lib/utils/privacy";
import { ROUTES } from "@/lib/constants/routes";
import { parseLatLng } from "@/lib/maps/parse-lat-lng";
import { PassengerDriverAccessNotice } from "@/features/passenger/components/driver-access-notice";
import { TRIP_MAP_MARKER, TRIP_PICKUP_LABEL } from "@/features/shared/lib/trip-map-copy";
import { passengerHomeStatusLabelPresentation } from "@/features/shared/lib/status-presentation";

function HomeScreenSkeleton() {
  return (
    <div className="space-y-6 md:space-y-7" aria-busy="true" aria-label="Loading home">
      <div className="h-48 animate-pulse rounded-[2rem] bg-muted/60" />
      <div className="space-y-3">
        <div className="h-4 w-40 animate-pulse rounded bg-muted/60" />
        <div className="h-36 animate-pulse rounded-3xl bg-muted/50" />
      </div>
      <div className="h-28 animate-pulse rounded-3xl bg-muted/50" />
      <div className="h-40 animate-pulse rounded-3xl bg-muted/50" />
    </div>
  );
}

export function HomeScreen() {
  const configured = isApiConfigured();
  const {
    data: snapshot,
    isPending: snapshotPending,
    isError: snapshotError,
    error: snapshotErr,
    refetch: refetchSnapshot,
  } = useOnboardingSnapshotQuery({ enabled: configured });
  const onboardingComplete = Boolean(snapshot?.account.onboardingCompletedAt);
  const {
    data,
    isPending: homePending,
    isError: homeError,
    error: homeErr,
    refetch: refetchHome,
  } = usePassengerHomeQuery({ enabled: configured && onboardingComplete });

  if (!configured) {
    return (
      <Card className="rounded-3xl border-amber-500/30">
        <CardHeader>
          <CardTitle className="text-base">API not configured</CardTitle>
          <CardDescription className="text-left">
            Set <code className="rounded bg-muted px-1">NEXT_PUBLIC_API_BASE_URL</code> in{" "}
            <code className="rounded bg-muted px-1">.env.local</code> so we can load your workspace and
            onboarding status.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button asChild variant="secondary" className="rounded-2xl">
            <Link href={ROUTES.onboarding.welcome}>Open setup</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (snapshotPending) {
    return <HomeScreenSkeleton />;
  }

  if (snapshotError || !snapshot) {
    const { title, description } = snapshotError
      ? describeApiFailure(snapshotErr)
      : { title: "Could not load workspace", description: "Try again or open setup to continue." };
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="whitespace-pre-wrap text-left">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button type="button" variant="secondary" className="rounded-2xl" onClick={() => refetchSnapshot()}>
            Retry
          </Button>
          <Button asChild variant="outline" className="rounded-2xl">
            <Link href={ROUTES.onboarding.welcome}>Open setup</Link>
          </Button>
          {snapshotError ? <ApiErrorDevHint error={snapshotErr} /> : null}
        </CardContent>
      </Card>
    );
  }

  if (!onboardingComplete) {
    return <PassengerHomeGetStarted />;
  }

  if (homePending) {
    return <HomeScreenSkeleton />;
  }

  if (homeError || !data) {
    const { title, description } = describeApiFailure(homeErr);
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="whitespace-pre-wrap text-left">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="secondary" onClick={() => refetchHome()}>
            Retry
          </Button>
          <ApiErrorDevHint error={homeErr} />
        </CardContent>
      </Card>
    );
  }

  const pickupLabel = formatApproximatePickup(
    data.nextPickup.pickupAreaLabel,
    data.nextPickup.pickupFuzzRadiusM,
  );
  const pickupStatus = passengerHomeStatusLabelPresentation(data.nextPickup.statusLabel);

  return (
    <div className="space-y-6 md:space-y-7">
      <PassengerDriverAccessNotice />

      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-teal-600 to-secondary p-6 text-primary-foreground shadow-soft-lg">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
          {data.hero.eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight">
          {data.hero.titleLine1}
          <br />
          {data.hero.titleLine2}
        </h2>
        <p className="mt-3 max-w-[280px] text-sm leading-relaxed text-white/90">
          {data.hero.subtitle}
        </p>
      </section>

      <section className="space-y-3">
        <Card className="overflow-hidden rounded-3xl border-primary/25 bg-primary/[0.07] ring-1 ring-primary/15">
          <CardContent className="space-y-3 p-5">
            <Button
              asChild
              size="lg"
              className="h-14 w-full gap-2 rounded-2xl text-base font-semibold shadow-sm"
            >
              <Link href={ROUTES.passengerSearch}>
                <Search className="h-6 w-6 shrink-0" aria-hidden />
                Search for rides
              </Link>
            </Button>
            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              Next: choose pickup and destination — we’ll match corridors from approved drivers.
            </p>
            {snapshot.driver?.approvalStatus === "approved" ? (
              <Button
                asChild
                variant="outline"
                className="h-11 w-full gap-2 rounded-2xl border-primary/25 bg-background/80"
              >
                <Link href={ROUTES.driverRoutesNew}>
                  <Car className="h-4 w-4 shrink-0" aria-hidden />
                  Offer a ride — new route
                </Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
        <p className="px-0.5 text-xs text-muted-foreground">{data.searchSectionDescription}</p>
      </section>

      <PrivacyNotice />

      <section className="space-y-3">
        <SectionHeader title={data.nextPickupSectionTitle} />
        <Card className="border-primary/20">
          <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-base">Status</CardTitle>
            <Badge variant={pickupStatus.tone}>{pickupStatus.label}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs leading-relaxed text-muted-foreground">{pickupStatus.helper}</p>
            <div className="flex gap-3 rounded-2xl bg-background/80 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <MapPin className="h-5 w-5" strokeWidth={2} aria-hidden />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {TRIP_PICKUP_LABEL.approxEyebrow}
                </p>
                <p className="text-sm font-semibold text-foreground">{pickupLabel}</p>
                <p className="text-xs text-muted-foreground">
                  {data.nextPickup.privacyFootnote}
                </p>
              </div>
            </div>
            {data.nextPickup.tripInstanceId ? (
              <Button asChild variant="secondary" className="w-full rounded-2xl">
                <Link href={ROUTES.passengerTripDetail(data.nextPickup.tripInstanceId)}>
                  View trip details
                </Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3 pb-2">
        <SectionHeader
          title="Routes nearby"
          description={data.routesSectionDescription}
        />
        {data.nearbyRoutes.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">No routes nearby yet</CardTitle>
              <CardDescription>
                When approved drivers publish corridors in your area, they will appear here. Use{" "}
                <strong>Search for rides</strong> above to find routes by place.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          data.nearbyRoutes.map((route) => {
            const o = parseLatLng(route.approxPickupLat, route.approxPickupLng);
            const d = parseLatLng(route.destinationLat, route.destinationLng);
            return (
              <Card
                key={route.routeTemplateId}
                className="overflow-hidden rounded-3xl border-border/90"
              >
                <CardHeader>
                  <CardTitle className="text-base">{route.name}</CardTitle>
                  <CardDescription>
                    <span className="inline-flex items-center gap-2">
                      {route.host ? (
                        <Badge variant="secondary">{publicAliasLabel(route.host)}</Badge>
                      ) : (
                        <Badge variant="outline">Host TBD</Badge>
                      )}
                      <span className="text-muted-foreground">
                        {route.departureWindowLabel}
                      </span>
                    </span>
                  </CardDescription>
                </CardHeader>
                {o && d ? (
                  <CardContent className="pt-0">
                    <CorridorMapPreview
                      variant="compact"
                      origin={o}
                      destination={d}
                      encodedPolyline={route.routePolyline ?? null}
                      straightLineFallback={false}
                      approximatePickup={{
                        center: o,
                        radiusMeters: route.pickupFuzzRadiusM,
                      }}
                      originTitle={TRIP_MAP_MARKER.routeStart}
                      destinationTitle={TRIP_MAP_MARKER.destination}
                    />
                  </CardContent>
                ) : null}
              </Card>
            );
          })
        )}
      </section>
    </div>
  );
}
