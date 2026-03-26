"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
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
import { ApiErrorDevHint } from "@/components/dev/api-error-hint";
import { CorridorMapPreview } from "@/components/maps/corridor-map-preview";
import { parseLatLng } from "@/lib/maps/parse-lat-lng";
import {
  useAcceptDriverTripRequestMutation,
  useDeclineDriverTripRequestMutation,
  useDriverTripRequestsQuery,
} from "@/features/driver/hooks";
import { useAppToast } from "@/features/shared/components/toast-provider";
import { ROUTES } from "@/lib/constants/routes";
import { describeApiFailure } from "@/lib/api/errors";
import { publicAliasLabel } from "@/lib/utils/privacy";
import type { TripRequest } from "@/types/trip";
import {
  driverTripRequestsMapDescription,
  pickupEyebrowFromPickup,
  TRIP_MAP_MARKER,
  TRIP_MAP_SECTION,
} from "@/features/shared/lib/trip-map-copy";
import { tripRequestStatusPresentation } from "@/features/shared/lib/status-presentation";

function TripRequestsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading seat requests">
      <div className="h-[220px] min-h-[220px] animate-pulse rounded-3xl bg-muted/55 sm:h-[260px]" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-32 animate-pulse rounded-3xl bg-muted/50" />
      ))}
    </div>
  );
}

export function DriverTripRequestsScreen({
  tripInstanceId,
}: {
  tripInstanceId: string;
}) {
  const { data, isPending, isError, error, refetch } =
    useDriverTripRequestsQuery(tripInstanceId);
  const accept = useAcceptDriverTripRequestMutation(tripInstanceId);
  const decline = useDeclineDriverTripRequestMutation(tripInstanceId);
  const toast = useAppToast();
  const busy = accept.isPending || decline.isPending;

  const rowAccepting = (id: string) =>
    accept.isPending && accept.variables === id;
  const rowDeclining = (id: string) =>
    decline.isPending && decline.variables === id;

  const fetchErrorCopy = useMemo(
    () => (isError ? describeApiFailure(error) : null),
    [isError, error],
  );

  const renderRow = (row: TripRequest) => {
    const pending = row.status === "pending";
    const statusPres = tripRequestStatusPresentation(row.status, "driver");
    const e = row.pickup.exact;
    const pickupPrimaryLine =
      e?.latitude != null &&
      e?.longitude != null &&
      Number.isFinite(Number(e.latitude)) &&
      Number.isFinite(Number(e.longitude))
        ? e.label?.trim() || `${e.latitude}, ${e.longitude}`
        : row.pickup.approximateLabel;
    return (
      <Card key={row.id}>
        <CardHeader className="space-y-1 pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">
              {row.rider ? (
                <Badge variant="secondary">{publicAliasLabel(row.rider)}</Badge>
              ) : (
                <span className="text-muted-foreground">Rider</span>
              )}
            </CardTitle>
            <Badge variant={statusPres.tone}>{statusPres.label}</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {pickupEyebrowFromPickup(row.pickup)}
            </p>
            <CardDescription className="text-sm text-foreground">{pickupPrimaryLine}</CardDescription>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">{statusPres.helper}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {row.message ? (
            <p className="rounded-2xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              {row.message}
            </p>
          ) : null}
          {pending ? (
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                className="flex-1 rounded-xl"
                disabled={busy}
                onClick={() =>
                  accept.mutate(row.id, {
                    onSuccess: () =>
                      toast({
                        message: "Accepted. Rider details unlock for this trip.",
                        variant: "success",
                      }),
                    onError: (err) =>
                      toast({
                        message: describeApiFailure(err).title,
                        variant: "error",
                      }),
                  })
                }
              >
                {rowAccepting(row.id) ? "Accepting…" : "Accept"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="flex-1 rounded-xl"
                disabled={busy}
                onClick={() =>
                  decline.mutate(row.id, {
                    onSuccess: () =>
                      toast({
                        message: "Request declined.",
                        variant: "success",
                      }),
                    onError: (err) =>
                      toast({
                        message: describeApiFailure(err).title,
                        variant: "error",
                      }),
                  })
                }
              >
                {rowDeclining(row.id) ? "Declining…" : "Decline"}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 pb-2 md:space-y-7">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-2xl" asChild>
          <Link href={ROUTES.driverDashboard} aria-label="Back to dashboard">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <SectionHeader
          title="Seat requests"
          description="Each card shows rider alias and approx pickup. Exact details unlock after you accept."
          className="flex-1 border-0 pb-0"
        />
      </div>

      {isPending ? <TripRequestsSkeleton /> : null}

      {isError && fetchErrorCopy ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base">{fetchErrorCopy.title}</CardTitle>
            <CardDescription className="whitespace-pre-wrap text-left">
              {fetchErrorCopy.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
            <ApiErrorDevHint error={error} />
          </CardContent>
        </Card>
      ) : null}

      {!isPending && !isError && data ? (
        data.requests.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">No requests</CardTitle>
              <CardDescription>
                Pending seat requests for this trip will show up here.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-4">
            {(() => {
              const tr = data.tripRoute;
              const o = parseLatLng(tr.originLat, tr.originLng);
              const d = parseLatLng(tr.destinationLat, tr.destinationLng);
              if (!o || !d) return null;
              return (
                <Card className="overflow-hidden rounded-3xl border-primary/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{TRIP_MAP_SECTION.driverRouteThisTrip}</CardTitle>
                    <CardDescription>
                      {driverTripRequestsMapDescription(Boolean(tr.routePolyline?.trim()))}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CorridorMapPreview
                      origin={o}
                      destination={d}
                      encodedPolyline={tr.routePolyline}
                      straightLineFallback
                      originTitle={TRIP_MAP_MARKER.routeStart}
                      destinationTitle={TRIP_MAP_MARKER.destination}
                      approximatePickup={null}
                      exactPickup={null}
                      variant="default"
                      emphasis
                    />
                  </CardContent>
                </Card>
              );
            })()}
            <div className="space-y-3">{data.requests.map(renderRow)}</div>
          </div>
        )
      ) : null}
    </div>
  );
}
