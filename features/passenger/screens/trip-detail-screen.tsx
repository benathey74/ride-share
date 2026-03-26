"use client";

import Link from "next/link";
import { ChevronLeft, MapPin, MessageSquareText } from "lucide-react";
import { ApiErrorDevHint } from "@/components/dev/api-error-hint";
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
import { usePassengerTripDetailQuery } from "@/features/passenger/hooks";
import { PrivacyNotice } from "@/features/shared/components/privacy-notice";
import {
  CorridorMapPlaceholder,
  CorridorMapPreview,
} from "@/components/maps/corridor-map-preview";
import { ApiError, describeApiFailure } from "@/lib/api/errors";
import { ROUTES } from "@/lib/constants/routes";
import { parseLatLng } from "@/lib/maps/parse-lat-lng";
import { publicAliasLabel } from "@/lib/utils/privacy";
import type { TripRequest } from "@/types/trip";
import {
  passengerBookedMapDescription,
  TRIP_MAP_MARKER,
  TRIP_MAP_SECTION,
  TRIP_PICKUP_LABEL,
} from "@/features/shared/lib/trip-map-copy";
import {
  tripInstanceStatusPresentation,
  tripRequestStatusPresentation,
} from "@/features/shared/lib/status-presentation";

/** Pickup row to display: accepted request first, else pending, else most recent. */
function primarySeatRequest(requests: TripRequest[]): TripRequest | null {
  const accepted = requests.find((r) => r.status === "accepted");
  if (accepted) return accepted;
  const pending = requests.find((r) => r.status === "pending");
  if (pending) return pending;
  return requests[0] ?? null;
}

function TripDetailSkeleton() {
  return (
    <div className="space-y-6 md:space-y-7" aria-busy="true" aria-label="Loading trip details">
      <div className="h-10 w-40 animate-pulse rounded-2xl bg-muted/60" />
      <div className="h-36 animate-pulse rounded-3xl bg-muted/50" />
      <div className="h-28 animate-pulse rounded-3xl bg-muted/45" />
      <div className="h-[220px] min-h-[220px] animate-pulse rounded-3xl bg-muted/55 sm:h-[260px]" />
      <div className="h-24 animate-pulse rounded-3xl bg-muted/40" />
    </div>
  );
}

export function PassengerTripDetailScreen({
  tripInstanceId,
}: {
  tripInstanceId: string;
}) {
  const { data, isPending, isError, error, refetch } =
    usePassengerTripDetailQuery(tripInstanceId);

  if (!tripInstanceId.trim()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Missing trip</CardTitle>
          <CardDescription>Open a trip from home or search.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="secondary" className="rounded-2xl">
            <Link href={ROUTES.home}>Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isPending) {
    return <TripDetailSkeleton />;
  }

  if (isError || !data) {
    const { title, description } = describeApiFailure(error);
    const isNotFound = error instanceof ApiError && error.status === 404;
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base">
            {isNotFound ? "Trip not found" : title}
          </CardTitle>
          <CardDescription className="whitespace-pre-wrap text-left">
            {isNotFound
              ? "This trip may have been removed or the link is incorrect."
              : description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
          <Button asChild variant="outline" className="rounded-2xl">
            <Link href={ROUTES.home}>Home</Link>
          </Button>
          <ApiErrorDevHint error={error} />
        </CardContent>
      </Card>
    );
  }

  const primary = primarySeatRequest(data.myRequests);
  const pickup = primary?.pickup;
  const hasExactPickup = Boolean(pickup?.exact?.latitude && pickup?.exact?.longitude);
  const routeStatusPres = tripInstanceStatusPresentation(data.routeStatus);

  const originLL = parseLatLng(data.route.originLat, data.route.originLng);
  const destLL = parseLatLng(data.route.destinationLat, data.route.destinationLng);
  const exactLL =
    hasExactPickup && pickup?.exact
      ? parseLatLng(pickup.exact.latitude, pickup.exact.longitude)
      : null;

  const approxAreaLL =
    pickup?.approximateArea != null
      ? parseLatLng(pickup.approximateArea.latitude, pickup.approximateArea.longitude)
      : null;
  const approxCircleRadiusM =
    pickup?.approximateArea?.radiusMeters ?? data.route.pickupFuzzRadiusM;
  const approximatePickupForMap =
    exactLL || !originLL || !destLL
      ? null
      : approxAreaLL
        ? { center: approxAreaLL, radiusMeters: approxCircleRadiusM }
        : { center: originLL, radiusMeters: data.route.pickupFuzzRadiusM };

  const googleCorridorHref =
    originLL && destLL
      ? `https://www.google.com/maps/dir/?api=1&origin=${originLL.lat},${originLL.lng}&destination=${destLL.lat},${destLL.lng}`
      : null;
  const googleExactHref =
    exactLL
      ? `https://www.google.com/maps/search/?api=1&query=${exactLL.lat},${exactLL.lng}`
      : null;

  return (
    <div className="space-y-6 pb-2 md:space-y-7">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-2xl" asChild>
          <Link href={ROUTES.home} aria-label="Back to home">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <SectionHeader
          title="Your trip"
          description="Track your seat request, pickup, and the map for this booking."
          className="flex-1 border-0 pb-0"
        />
      </div>

      <Card className="overflow-hidden rounded-3xl border-primary/15">
        <CardHeader className="space-y-3 pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">Driver</CardTitle>
            <Badge variant={routeStatusPres.tone} className="rounded-full">
              {routeStatusPres.label}
            </Badge>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">{routeStatusPres.helper}</p>
          <div className="flex items-center gap-3">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-2xl leading-none"
              aria-hidden
            >
              {data.host?.avatarEmoji ?? "·"}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {data.host ? publicAliasLabel(data.host) : "Host"}
              </p>
              <p className="text-xs text-muted-foreground">
                {data.host
                  ? "Public alias and avatar only."
                  : "Public alias only — no legal name shown."}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Trip route
          </p>
          <p className="text-sm font-medium text-foreground">{data.destinationLabel}</p>
          <p className="text-xs text-muted-foreground">{data.route.approximatePickupLabel}</p>
          <p className="text-xs text-muted-foreground">
            {data.tripDate || "—"} · {data.departureTime || "—"} · {data.seatsRemaining}/
            {data.seatsTotal} seats left
          </p>
        </CardContent>
      </Card>

      {data.myRequests.length === 0 ? (
        <Card className="rounded-3xl border-dashed">
          <CardHeader>
            <CardTitle className="text-base">No seat request yet</CardTitle>
            <CardDescription>
              You have not requested a seat on this trip. Search for routes and send a request to
              see your status here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-2xl">
              <Link href={ROUTES.passengerSearch}>Find routes</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <section className="space-y-3">
          <SectionHeader
            title="Your seat request"
            description={
              data.myRequests.length > 1
                ? "We show pickup for your accepted request first, then pending, then other rows."
                : "Pickup on the map matches these statuses: approx until you’re accepted, then confirmed when saved."
            }
          />
          <div className="space-y-3">
            {data.myRequests.map((req) => {
              const reqPres = tripRequestStatusPresentation(req.status);
              return (
              <Card key={req.id} className="rounded-3xl">
                <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Seat request</CardTitle>
                  <Badge variant={reqPres.tone}>{reqPres.label}</Badge>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-xs text-muted-foreground">{reqPres.helper}</p>
                  {req.message ? (
                    <p className="rounded-2xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground/80">Your note: </span>
                      {req.message}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            );
            })}
          </div>
        </section>
      )}

      <Card className="rounded-3xl border-secondary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" aria-hidden />
            <CardTitle className="text-base">Pickup</CardTitle>
          </div>
          <CardDescription>
            {primary
              ? primary.status === "accepted"
                ? hasExactPickup
                  ? "Your confirmed pickup is on the map and below."
                  : "You’re accepted — exact pickup appears here once your driver saves coordinates."
                : "Approx pickup matches what you sent with your request. The map uses that area until you’re accepted."
              : "Request a seat to see pickup information for this trip."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {pickup ? (
            <>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {TRIP_PICKUP_LABEL.approxEyebrow}
                </p>
                <p className="text-sm font-medium text-foreground">{pickup.approximateLabel}</p>
              </div>
              {hasExactPickup && pickup.exact ? (
                <div className="space-y-2 rounded-2xl border border-primary/20 bg-primary/5 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                    Confirmed pickup
                  </p>
                  {pickup.exact.label ? (
                    <p className="text-sm font-semibold text-foreground">{pickup.exact.label}</p>
                  ) : null}
                  <p className="font-mono text-xs text-muted-foreground">
                    {pickup.exact.latitude}, {pickup.exact.longitude}
                  </p>
                </div>
              ) : primary?.status === "pending" ? (
                <p className="text-xs text-muted-foreground">
                  Exact pin and precise label stay hidden until your driver accepts you.
                </p>
              ) : primary?.status === "accepted" && !hasExactPickup ? (
                <p className="text-xs text-muted-foreground">
                  No exact pin yet — your driver may still add coordinates. The map shows your approx
                  area meanwhile.
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No pickup data for your requests yet.</p>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-3xl border-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{TRIP_MAP_SECTION.passengerDriverRoute}</CardTitle>
          <CardDescription>
            {passengerBookedMapDescription({
              hasPolyline: Boolean(data.route.routePolyline?.trim()),
              hasExactPickup,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {originLL && destLL ? (
            <CorridorMapPreview
              key={`${data.tripInstanceId}-${exactLL ? "exact" : "approx"}-${approxAreaLL ? "a" : "o"}`}
              origin={originLL}
              destination={destLL}
              encodedPolyline={data.route.routePolyline ?? null}
              straightLineFallback
              originTitle={TRIP_MAP_MARKER.routeStart}
              destinationTitle={TRIP_MAP_MARKER.destination}
              approximatePickup={approximatePickupForMap}
              exactPickup={exactLL}
              exactPickupTitle={TRIP_MAP_MARKER.confirmedPickup}
              variant="default"
              emphasis
            />
          ) : (
            <CorridorMapPlaceholder
              className="h-[220px] min-h-[220px] sm:h-[260px]"
              title="Map unavailable"
              helperText="Corridor start/end coordinates are missing for this trip, so we can’t draw the map. The trip summary above still describes the run."
            />
          )}
          {googleCorridorHref ? (
            <Button asChild variant="outline" className="w-full rounded-2xl">
              <a
                href={googleCorridorHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open route start and destination in Google Maps"
              >
                Open route in Google Maps
              </a>
            </Button>
          ) : null}
          {googleExactHref ? (
            <Button asChild variant="secondary" className="w-full rounded-2xl">
              <a
                href={googleExactHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open confirmed pickup location in Google Maps"
              >
                Open confirmed pickup in Google Maps
              </a>
            </Button>
          ) : null}
          {!hasExactPickup && originLL && destLL ? (
            <p className="text-center text-xs text-muted-foreground">
              After acceptance, a confirmed pickup pin and link appear when your driver saves exact
              coordinates.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-border/80">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-secondary" aria-hidden />
            <CardTitle className="text-base">Coordination</CardTitle>
          </div>
          <CardDescription>
            Trip chat and in-app messaging are not wired yet — use your usual channel with the host
            once you have confirmed pickup details.
          </CardDescription>
        </CardHeader>
      </Card>

      <PrivacyNotice />
    </div>
  );
}
