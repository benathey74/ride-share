"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CorridorMapPreview } from "@/components/maps/corridor-map-preview";
import { parseLatLng } from "@/lib/maps/parse-lat-lng";
import { formatApproximatePickup, publicAliasLabel } from "@/lib/utils/privacy";
import { TRIP_MAP_MARKER, TRIP_PICKUP_LABEL } from "@/features/shared/lib/trip-map-copy";
import { ROUTE_MATCH_HINT_LABELS, type RouteMatchHint, type RouteSuggestion } from "@/types/route";
import { cn } from "@/lib/utils";

export type PassengerRouteCorridorCardProps = {
  route: RouteSuggestion;
  /** When true, show match-hint badges (search results only). */
  showMatchHints?: boolean;
  /** `none` keeps scroll/taps available for CTAs below the map on browse surfaces. */
  mapPointerEvents?: "auto" | "none";
  /** Anchor for scroll-into-view from /search deep links. */
  cardId?: string;
  /** Emphasize card when deep-linked from home. */
  highlight?: boolean;
  /** Badge when `route.host` is null (e.g. home browse uses “Driver TBD”). */
  hostFallbackLabel?: string;
  /** Optional top label to clearly distinguish “available ride” vs “not bookable yet”. */
  statusBadge?: {
    text: string;
    tone?: "available" | "unavailable";
  };
  children?: React.ReactNode;
};

/**
 * Shared passenger corridor card: host, schedule, optional match hints, compact map, approx pickup
 * line, then a footer slot (CTAs, message field, etc.).
 */
export function PassengerRouteCorridorCard({
  route,
  showMatchHints = false,
  mapPointerEvents = "auto",
  cardId,
  highlight = false,
  hostFallbackLabel = "Driver",
  statusBadge,
  children,
}: PassengerRouteCorridorCardProps) {
  const originLL = parseLatLng(route.approxPickupLat, route.approxPickupLng);
  const destLL = parseLatLng(route.destinationLat, route.destinationLng);
  const pickupLine = formatApproximatePickup(route.pickupAreaLabel, route.pickupFuzzRadiusM);
  const hints = showMatchHints ? route.matchHints : undefined;

  return (
    <Card
      id={cardId}
      className={cn(
        "overflow-hidden rounded-3xl border-border/90",
        highlight && "ring-2 ring-primary/35 ring-offset-2 ring-offset-background",
      )}
    >
      <CardHeader>
        <CardTitle className="text-base">{route.name}</CardTitle>
        <CardDescription>
          <span className="inline-flex flex-wrap items-center gap-2">
            {route.host ? (
              <Badge variant="secondary">{publicAliasLabel(route.host)}</Badge>
            ) : (
              <Badge variant="outline">{hostFallbackLabel}</Badge>
            )}
            {statusBadge ? (
              <Badge
                variant={statusBadge.tone === "available" ? "secondary" : "outline"}
                className={
                  statusBadge.tone === "unavailable"
                    ? "border-border/60 text-muted-foreground"
                    : undefined
                }
              >
                {statusBadge.text}
              </Badge>
            ) : null}
            <span className="text-muted-foreground">{route.departureWindowLabel}</span>
          </span>
        </CardDescription>
        {hints && hints.length > 0 ? (
          <div className="space-y-1.5 pt-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Why this route matched
            </p>
            <div className="flex flex-wrap gap-1.5">
              {hints.map((h: RouteMatchHint) => (
                <Badge
                  key={h}
                  variant="outline"
                  className="rounded-lg border-primary/25 bg-primary/[0.06] px-2 py-0.5 text-[10px] font-medium leading-tight text-foreground"
                >
                  {ROUTE_MATCH_HINT_LABELS[h]}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {originLL && destLL ? (
          <CorridorMapPreview
            variant="compact"
            origin={originLL}
            destination={destLL}
            encodedPolyline={route.routePolyline ?? null}
            straightLineFallback={false}
            approximatePickup={{
              center: originLL,
              radiusMeters: route.pickupFuzzRadiusM,
            }}
            originTitle={TRIP_MAP_MARKER.routeStart}
            destinationTitle={TRIP_MAP_MARKER.destination}
            pointerEvents={mapPointerEvents}
          />
        ) : null}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {TRIP_PICKUP_LABEL.approxEyebrow}
          </p>
          <p className="text-sm font-medium text-foreground">{pickupLine}</p>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
