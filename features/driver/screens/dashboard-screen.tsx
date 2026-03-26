"use client";

import Link from "next/link";
import { Car, Clock3, ChevronRight, MapPinned, MessageCircle, Route } from "lucide-react";
import type { DriverQuickActionId } from "@/types/driver";
import { SectionHeader } from "@/components/layout/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiErrorDevHint } from "@/components/dev/api-error-hint";
import { useDriverDashboardQuery } from "@/features/driver/hooks";
import { ROUTES } from "@/lib/constants/routes";
import { describeApiFailure } from "@/lib/api/errors";

const DRIVER_ACTION_ICONS: Record<DriverQuickActionId, typeof Car> = {
  startTrip: Car,
  shareEta: Clock3,
  route: Route,
  message: MessageCircle,
};

/** Quick actions that navigate somewhere (others stay as placeholders). */
const DRIVER_QUICK_ACTION_HREF: Partial<Record<DriverQuickActionId, string>> = {
  route: ROUTES.driverRoutes,
};

function DriverDashboardSkeleton() {
  return (
    <div className="space-y-6 md:space-y-7" aria-busy="true" aria-label="Loading driver dashboard">
      <div className="h-44 animate-pulse rounded-3xl bg-slate-800/40" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-3xl bg-muted/50" />
        ))}
      </div>
    </div>
  );
}

export function DriverDashboardScreen() {
  const { data, isPending, isError, error, refetch } = useDriverDashboardQuery();

  if (isPending) {
    return <DriverDashboardSkeleton />;
  }

  if (isError || !data) {
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

  const { summary, quickActions, todaysTrips, pendingSeatRequests } = data;

  return (
    <div className="space-y-6 md:space-y-7">
      <Card className="border-0 bg-slate-900 text-slate-50 shadow-soft-lg">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {summary.dayLabel}
            </p>
            <Badge
              variant={summary.statusTone}
              className={
                summary.statusTone === "default"
                  ? "bg-emerald-500/20 text-emerald-200"
                  : summary.statusTone === "accent"
                    ? "border-amber-500/40 bg-amber-500/15 text-amber-100"
                    : summary.statusTone === "secondary"
                      ? "bg-white/10 text-slate-200"
                      : "border-white/20 bg-white/5 text-slate-300"
              }
            >
              {summary.statusBadgeLabel}
            </Badge>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">{summary.statusHelper}</p>
          <p className="text-sm text-slate-300">{summary.bodyText}</p>
          <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 text-sm text-slate-200">
            <MapPinned className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span className="truncate">{summary.nextTripPreviewLabel}</span>
          </div>
        </CardContent>
      </Card>

      {pendingSeatRequests.length === 0 && todaysTrips.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-border/80 bg-muted/15">
          <CardHeader>
            <CardTitle className="text-base">No trips or seat requests right now</CardTitle>
            <CardDescription>
              Scheduled runs for today and pending rider requests show up here first. Publish a
              corridor if you have not yet, or check back when colleagues request seats.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild className="rounded-2xl">
              <Link href={ROUTES.driverRoutes}>Manage routes</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-2xl">
              <Link href={ROUTES.driverRoutesNew}>New route</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {pendingSeatRequests.length > 0 ? (
        <section className="space-y-3">
          <SectionHeader
            title="Pending seat requests"
            description="Open the trip queue to accept or decline — includes trips not only scheduled for today."
          />
          <div className="space-y-2">
            {pendingSeatRequests.map((req) => (
              <Button
                key={req.id}
                variant="outline"
                className="h-auto w-full justify-between gap-2 rounded-3xl border-amber-500/30 bg-amber-500/[0.06] py-3 pr-3 pl-4 text-left"
                asChild
              >
                <Link href={ROUTES.driverTripRequests(req.tripInstanceId)}>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">
                      {req.riderLabel} · {req.destinationLabel}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      Review request
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              </Button>
            ))}
          </div>
        </section>
      ) : null}

      {todaysTrips.length > 0 ? (
        <section className="space-y-3">
          <SectionHeader
            title="Today's trips"
            description="Open the request queue for each run."
          />
          <div className="space-y-2">
            {todaysTrips.map((trip) => (
              <Button
                key={trip.id}
                variant="outline"
                className="h-auto w-full justify-between gap-2 rounded-3xl py-3 pr-3 pl-4 text-left"
                asChild
              >
                <Link href={ROUTES.driverTripRequests(trip.id)}>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">
                      {trip.destinationLabel}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {(trip.tripDate ? trip.tripDate.slice(0, 10) : "—")} ·{" "}
                      {(trip.departureTime ? trip.departureTime.slice(0, 5) : "—")} ·{" "}
                      {trip.seatsRemaining}/{trip.seatsTotal} seats left
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              </Button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <SectionHeader title="Quick actions" />
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = DRIVER_ACTION_ICONS[action.id];
            const href = DRIVER_QUICK_ACTION_HREF[action.id];
            const inner = (
              <>
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${action.toneClass}`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                </span>
                <span className="text-xs font-semibold text-foreground">{action.label}</span>
              </>
            );
            if (href) {
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-auto flex-col gap-2 rounded-3xl border-border bg-card py-4 shadow-sm"
                  asChild
                >
                  <Link href={href}>{inner}</Link>
                </Button>
              );
            }
            return (
              <Button
                key={action.id}
                type="button"
                variant="outline"
                className="h-auto flex-col gap-2 rounded-3xl border-border bg-card py-4 shadow-sm"
              >
                {inner}
              </Button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
