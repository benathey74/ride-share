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
import { PassengerRouteCorridorCard } from "@/features/passenger/components/passenger-route-corridor-card";
import { ApiErrorDevHint } from "@/components/dev/api-error-hint";
import { isApiConfigured } from "@/features/onboarding/api";
import { useOnboardingSnapshotQuery } from "@/features/onboarding/hooks";
import { PassengerHomeGetStarted } from "@/features/passenger/components/home-get-started";
import { usePassengerHomeQuery } from "@/features/passenger/hooks";
import { PrivacyNotice } from "@/features/shared/components/privacy-notice";
import { describeApiFailure } from "@/lib/api/errors";
import { formatApproximatePickup } from "@/lib/utils/privacy";
import { ROUTES } from "@/lib/constants/routes";
import { PassengerDriverAccessNotice } from "@/features/passenger/components/driver-access-notice";
import { PassengerHomeHeroBanner } from "@/features/passenger/components/passenger-home-hero-banner";
import { TRIP_PICKUP_LABEL } from "@/features/shared/lib/trip-map-copy";
import { passengerHomeStatusLabelPresentation } from "@/features/shared/lib/status-presentation";

function HomeScreenSkeleton() {
  return (
    <div className="space-y-6 md:space-y-7" aria-busy="true" aria-label="Loading home">
      <div className="aspect-[1024/682] min-h-[13rem] w-full animate-pulse rounded-[2rem] bg-muted/60 md:min-h-[15rem]" />
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

      <PassengerHomeHeroBanner verticallyCenter>
        <div className="mt-[20px] flex max-w-md flex-col gap-3">
          <h2 className="text-balance text-xl font-bold leading-tight tracking-tight text-[#2a3f5c] md:text-2xl">
            Find a ride,
            <br />
            Share the Cost!
          </h2>
          <p className="text-[13px] font-medium leading-[1.2] text-[#2a3f5c] [text-shadow:0_0_10px_rgba(255,255,255,0.45)] md:text-sm md:leading-[1.22]">
            Carpool with your <br />
            coworkers and save <br />
            on travel expenses.
          </p>
        </div>
      </PassengerHomeHeroBanner>

      <section className="space-y-3">
        <Card className="overflow-hidden rounded-3xl border-primary/25 bg-primary/[0.07] ring-1 ring-primary/15">
          <CardContent className="space-y-3 p-5">
            <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-primary/80">
              Riding as a passenger
            </p>
            <Button
              asChild
              size="lg"
              className="h-14 w-full gap-2 rounded-2xl text-base font-semibold shadow-sm"
            >
              <Link href={ROUTES.passengerSearch}>
                <Search className="h-6 w-6 shrink-0" aria-hidden />
                Find a ride
              </Link>
            </Button>
            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              Set pickup and destination — we show corridors from approved drivers that fit your trip.
            </p>
            {snapshot.driver?.approvalStatus === "approved" ? (
              <>
                <div className="relative py-1 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground before:absolute before:inset-x-8 before:top-1/2 before:h-px before:bg-border before:content-['']">
                  <span className="relative bg-primary/[0.07] px-2">or hosting</span>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 w-full gap-2 rounded-2xl border-primary/25 bg-background/80"
                >
                  <Link href={ROUTES.driverRoutesNew}>
                    <Car className="h-4 w-4 shrink-0" aria-hidden />
                    Publish a new route
                  </Link>
                </Button>
                <p className="text-center text-xs leading-relaxed text-muted-foreground">
                  For drivers: define a corridor and schedule so passengers can request seats.
                </p>
              </>
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
                <Link href={ROUTES.passengerPrivateTripDetail(data.nextPickup.tripInstanceId)}>
                  Open trip
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
              <CardTitle className="text-base">No routes listed nearby</CardTitle>
              <CardDescription>
                This list is a quick browse only. To match your exact pickup and destination, use{" "}
                <strong>Find a ride</strong> — search always gives the best fit.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          data.nearbyRoutes.map((route) => (
            <PassengerRouteCorridorCard
              key={route.routeTemplateId}
              route={route}
              hostFallbackLabel="Driver TBD"
              mapPointerEvents="none"
              cardId={`passenger-route-card-${route.routeTemplateId}`}
            >
              <div className="space-y-2 border-t border-border/60 pt-3">
                {route.nextTripInstanceId ? (
                  <Button asChild className="h-12 w-full rounded-2xl text-base font-semibold">
                    <Link href={ROUTES.passengerPublicRide(route.nextTripInstanceId)}>
                      View ride
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="secondary" className="h-12 w-full rounded-2xl text-base font-semibold">
                    <Link href={ROUTES.passengerSearchFocusRoute(route.routeTemplateId, route.name)}>
                      Your search
                    </Link>
                  </Button>
                )}
                <p className="text-center text-xs leading-relaxed text-muted-foreground">
                  {route.nextTripInstanceId
                    ? "Trip details, request a seat, and pickup status — same as search results."
                    : "No scheduled run with open seats yet. Use Find a ride with your real pickup and destination — when this corridor matches, you can notify the driver you’re interested even before a run is bookable."}
                </p>
              </div>
            </PassengerRouteCorridorCard>
          ))
        )}
      </section>
    </div>
  );
}
