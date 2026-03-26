"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CorridorMapPlaceholder,
  CorridorMapPreview,
} from "@/components/maps/corridor-map-preview";
import {
  useCreatePassengerTripRequestMutation,
  usePassengerRideBrowseQuery,
} from "@/features/passenger/hooks";
import { PrivacyNotice } from "@/features/shared/components/privacy-notice";
import { useAppToast } from "@/features/shared/components/toast-provider";
import { ApiError, describeApiFailure } from "@/lib/api/errors";
import { ROUTES } from "@/lib/constants/routes";
import { parseLatLng } from "@/lib/maps/parse-lat-lng";
import { publicAliasLabel } from "@/lib/utils/privacy";
import {
  passengerBookedMapDescription,
  TRIP_MAP_MARKER,
  TRIP_MAP_SECTION,
  TRIP_PICKUP_LABEL,
} from "@/features/shared/lib/trip-map-copy";
import { tripInstanceStatusPresentation } from "@/features/shared/lib/status-presentation";

function RideBrowseSkeleton() {
  return (
    <div className="space-y-6 md:space-y-7" aria-busy="true" aria-label="Loading ride">
      <div className="h-10 w-40 animate-pulse rounded-2xl bg-muted/60" />
      <div className="h-36 animate-pulse rounded-3xl bg-muted/50" />
      <div className="h-[220px] min-h-[220px] animate-pulse rounded-3xl bg-muted/55 sm:h-[260px]" />
    </div>
  );
}

export function PassengerRideBrowseScreen({
  tripInstanceId,
}: {
  tripInstanceId: string;
}) {
  const router = useRouter();
  const { data, isPending, isError, error, refetch } =
    usePassengerRideBrowseQuery(tripInstanceId);
  const mutation = useCreatePassengerTripRequestMutation();
  const toast = useAppToast();
  const [message, setMessage] = useState("");

  if (!tripInstanceId.trim()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Missing trip</CardTitle>
          <CardDescription>Use a link from home or search.</CardDescription>
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
    return <RideBrowseSkeleton />;
  }

  if (isError || !data) {
    const { title, description } = describeApiFailure(error);
    const isNotFound = error instanceof ApiError && error.status === 404;
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base">
            {isNotFound ? "Ride not available" : title}
          </CardTitle>
          <CardDescription className="whitespace-pre-wrap text-left">
            {isNotFound
              ? "This trip may be full, finished, or removed. Try another corridor from home or search."
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

  const routeStatusPres = tripInstanceStatusPresentation(data.routeStatus);
  const originLL = parseLatLng(data.route.originLat, data.route.originLng);
  const destLL = parseLatLng(data.route.destinationLat, data.route.destinationLng);
  const approxCircle =
    originLL && destLL
      ? { center: originLL, radiusMeters: data.route.pickupFuzzRadiusM }
      : null;

  const googleCorridorHref =
    originLL && destLL
      ? `https://www.google.com/maps/dir/?api=1&origin=${originLL.lat},${originLL.lng}&destination=${destLL.lat},${destLL.lng}`
      : null;

  const tid = Number(data.tripInstanceId);
  const canSubmitRequest =
    data.canRequestSeat && Number.isFinite(tid) && !mutation.isPending;

  return (
    <div className="space-y-6 pb-2 md:space-y-7">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-2xl" asChild>
          <Link href={ROUTES.home} aria-label="Back to home">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <SectionHeader
          title="Ride overview"
          description="Public summary for this trip. Exact pickup and your notes appear only after you have a seat — open Your trip details when available."
          className="flex-1 border-0 pb-0"
        />
      </div>

      {data.viewerMayOpenPrivateDetail ? (
        <Card className="rounded-3xl border-primary/25 bg-primary/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {data.viewerSeatRequestStatus === "accepted"
                ? "You’re on this trip"
                : data.viewerSeatRequestStatus === "pending"
                  ? "Waiting for the driver"
                  : "Your activity on this trip"}
            </CardTitle>
            <CardDescription>
              Seat status, pickup, and messages stay on your private trip screen — this page is only
              a public overview.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button asChild className="h-12 w-full rounded-2xl text-base font-semibold">
              <Link href={ROUTES.passengerPrivateTripDetail(data.tripInstanceId)}>
                Your trip details
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="overflow-hidden rounded-3xl border-primary/15">
        <CardHeader className="space-y-3 pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">Host and route</CardTitle>
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
            Destination
          </p>
          <p className="text-sm font-medium text-foreground">{data.destinationLabel}</p>
          <p className="text-xs text-muted-foreground">
            {data.tripDate || "—"} · {data.departureTime || "—"} · {data.seatsRemaining}/
            {data.seatsTotal} seats left
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-secondary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" aria-hidden />
            <CardTitle className="text-base">Approximate pickup</CardTitle>
          </div>
          <CardDescription>
            This is the route’s approximate pickup area. Confirmed pickup details show after your seat
            is confirmed and a pickup point is available.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {TRIP_PICKUP_LABEL.approxEyebrow}
          </p>
          <p className="text-sm font-medium text-foreground">{data.route.approximatePickupLabel}</p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-3xl border-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{TRIP_MAP_SECTION.passengerDriverRoute}</CardTitle>
          <CardDescription>
            {passengerBookedMapDescription({
              hasPolyline: Boolean(data.route.routePolyline?.trim()),
              hasExactPickup: false,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {originLL && destLL ? (
            <CorridorMapPreview
              origin={originLL}
              destination={destLL}
              encodedPolyline={data.route.routePolyline ?? null}
              straightLineFallback
              originTitle={TRIP_MAP_MARKER.routeStart}
              destinationTitle={TRIP_MAP_MARKER.destination}
              approximatePickup={approxCircle}
              exactPickup={null}
              variant="default"
              emphasis
            />
          ) : (
            <CorridorMapPlaceholder
              className="h-[220px] min-h-[220px] sm:h-[260px]"
              title="Map unavailable"
              helperText="Corridor coordinates are missing for this trip."
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
        </CardContent>
      </Card>

      {data.viewerIsDriver ? (
        <Card className="rounded-3xl border-dashed">
          <CardHeader>
            <CardTitle className="text-base">You’re driving this trip</CardTitle>
            <CardDescription>
              Manage seat requests and pickup from the Drive area — this screen is for passengers
              browsing the corridor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="rounded-2xl">
              <Link href={ROUTES.driverTripRequests(data.tripInstanceId)}>Open driver queue</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!data.viewerIsDriver && data.viewerSeatRequestStatus === "pending" && !data.viewerMayOpenPrivateDetail ? (
        <Card className="rounded-3xl border-amber-500/25 bg-amber-500/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Request pending</CardTitle>
            <CardDescription>
              You’ve already asked for a seat. Trip details unlock once the driver responds — use
              My trips or the link below.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button asChild variant="secondary" className="w-full rounded-2xl">
              <Link href={ROUTES.passengerPrivateTripDetail(data.tripInstanceId)}>
                Open trip status
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {data.canRequestSeat ? (
        <Card className="rounded-3xl border-border/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Request a seat</CardTitle>
            <CardDescription>
              We’ll send your approximate pickup (corridor default below) and optional note to the
              driver.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="ride-browse-msg">Note to the driver (optional)</Label>
              <Input
                id="ride-browse-msg"
                className="rounded-2xl"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. I can meet at the lobby"
                maxLength={2000}
                disabled={mutation.isPending}
              />
            </div>
            <Button
              type="button"
              className="h-12 w-full rounded-2xl text-base font-semibold"
              disabled={!canSubmitRequest}
              onClick={() => {
                if (!Number.isFinite(tid)) return;
                mutation.mutate(
                  {
                    tripInstanceId: tid,
                    approxPickupLabel: data.seatRequestDefaults.approxPickupLabel,
                    approxPickupLat: data.seatRequestDefaults.approxPickupLat,
                    approxPickupLng: data.seatRequestDefaults.approxPickupLng,
                    approxPickupRadiusMeters: data.seatRequestDefaults.approxPickupRadiusMeters,
                    message: message.trim() || null,
                  },
                  {
                    onSuccess: () => {
                      toast({
                        message: "Seat request sent. Opening your trip details…",
                        variant: "success",
                      });
                      router.push(ROUTES.passengerPrivateTripDetail(data.tripInstanceId));
                    },
                    onError: (err) => {
                      toast({
                        message: describeApiFailure(err).title,
                        variant: "error",
                      });
                    },
                  },
                );
              }}
            >
              {mutation.isPending ? "Sending…" : "Request a seat"}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!data.canRequestSeat &&
      !data.viewerIsDriver &&
      !data.viewerMayOpenPrivateDetail &&
      data.viewerSeatRequestStatus !== "pending" ? (
        <p className="text-center text-xs text-muted-foreground">
          {data.seatsRemaining < 1
            ? "No seats left on this trip."
            : data.viewerSeatRequestStatus === "declined" || data.viewerSeatRequestStatus === "cancelled"
              ? "You can send a new seat request if the driver is still accepting riders."
              : "Seat requests aren’t available for this trip right now."}
        </p>
      ) : null}

      <Card className="rounded-3xl border-border/80">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-secondary" aria-hidden />
            <CardTitle className="text-base">Coordination</CardTitle>
          </div>
          <CardDescription>
            In-trip chat isn’t in the app yet — use your usual channel with the host after you have a
            seat.
          </CardDescription>
        </CardHeader>
      </Card>

      <PrivacyNotice />
    </div>
  );
}
