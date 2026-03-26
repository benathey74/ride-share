"use client";

import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
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
import { useDriverRouteTemplatesQuery } from "@/features/driver/hooks";
import { routeTemplateStatusPresentation } from "@/features/shared/lib/route-template-status-presentation";
import { WEEKDAY_SHORT } from "@/features/driver/schemas/create-route-form";
import { CorridorMapPreview } from "@/components/maps/corridor-map-preview";
import { TRIP_MAP_MARKER } from "@/features/shared/lib/trip-map-copy";
import { describeApiFailure } from "@/lib/api/errors";
import { ROUTES } from "@/lib/constants/routes";
import { parseLatLng } from "@/lib/maps/parse-lat-lng";
import type { DriverRouteTemplate } from "@/types/driver";

function formatDrivingDistanceMeters(m: number | null | undefined): string | null {
  if (m == null || !Number.isFinite(m) || m <= 0) return null;
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(m >= 10_000 ? 0 : 1)} km`;
}

function formatActiveDays(template: DriverRouteTemplate): string {
  const active = template.schedules.filter((s) => s.isActive).map((s) => s.dayOfWeek);
  if (active.length === 0) return "—";
  return active
    .slice()
    .sort((a, b) => a - b)
    .map((d) => WEEKDAY_SHORT[d] ?? String(d))
    .join(", ");
}

function RoutesListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading routes">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-36 animate-pulse rounded-3xl bg-muted/50" />
      ))}
    </div>
  );
}

export function DriverRoutesListScreen() {
  const { data, isPending, isError, error, refetch } = useDriverRouteTemplatesQuery();

  if (isPending) {
    return <RoutesListSkeleton />;
  }

  if (isError) {
    const { title, description } = describeApiFailure(error);
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="whitespace-pre-wrap text-left">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
          <ApiErrorDevHint error={error} />
        </CardContent>
      </Card>
    );
  }

  const templates = data ?? [];

  return (
    <div className="space-y-6 pb-2 md:space-y-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader
          title="Your routes"
          description="Templates power passenger suggestions and trip scheduling."
          className="flex-1 border-0 pb-0"
        />
        <Button asChild className="h-12 shrink-0 rounded-2xl px-5">
          <Link href={ROUTES.driverRoutesNew}>
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            New route
          </Link>
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card className="rounded-3xl border-dashed">
          <CardHeader>
            <CardTitle className="text-base">No route templates yet</CardTitle>
            <CardDescription>
              Create a corridor (origin → destination), departure time, and schedule so riders can
              request seats.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-2xl">
              <Link href={ROUTES.driverRoutesNew}>Create your first route</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => {
            const templateStatus = routeTemplateStatusPresentation(t.status);
            const o = parseLatLng(t.originLat, t.originLng);
            const d = parseLatLng(t.destinationLat, t.destinationLng);
            const distLabel = formatDrivingDistanceMeters(t.totalDistanceMeters);
            return (
            <Card key={t.id} className="rounded-3xl border-border/90">
              <CardHeader className="space-y-2 pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base leading-snug">
                    {t.originLabel}{" "}
                    <span className="text-muted-foreground">→</span> {t.destinationLabel}
                  </CardTitle>
                  <Badge variant="secondary" className="capitalize">
                    {t.scheduleType.replace(/_/g, " ")}
                  </Badge>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Departs {t.departureTime} · {t.seatsTotal} seats · ±{t.detourToleranceMinutes} min
                  detour
                  {t.pickupRadiusMeters != null
                    ? ` · ~${t.pickupRadiusMeters}m pickup radius`
                    : " · default pickup radius"}
                  {distLabel ? ` · ${distLabel}` : null}
                  {t.totalDurationSeconds != null &&
                  Number.isFinite(t.totalDurationSeconds) &&
                  t.totalDurationSeconds > 0
                    ? ` · ~${Math.max(1, Math.round(t.totalDurationSeconds / 60))} min drive`
                    : null}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {o && d ? (
                  <CorridorMapPreview
                    variant="compact"
                    origin={o}
                    destination={d}
                    encodedPolyline={t.routePolyline ?? null}
                    straightLineFallback={false}
                    originTitle={TRIP_MAP_MARKER.routeStart}
                    destinationTitle={TRIP_MAP_MARKER.destination}
                  />
                ) : null}
                {t.scheduleType === "recurring" ? (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground/80">Active days: </span>
                    {formatActiveDays(t)}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">One-off template (no weekday grid).</p>
                )}
                <div className="space-y-1.5 border-t border-border/60 pt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Route template
                    </span>
                    <Badge variant={templateStatus.tone}>{templateStatus.label}</Badge>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {templateStatus.helper}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
          })}
        </div>
      )}

      <Card className="rounded-3xl bg-slate-900/5">
        <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Need another corridor?</p>
          <Button asChild variant="outline" className="rounded-2xl">
            <Link href={ROUTES.driverRoutesNew}>
              Add route
              <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
