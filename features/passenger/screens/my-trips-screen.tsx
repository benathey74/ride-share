"use client";

import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
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
import { usePassengerMyTripsOverviewQuery } from "@/features/passenger/hooks";
import { PrivacyNotice } from "@/features/shared/components/privacy-notice";
import { describeApiFailure } from "@/lib/api/errors";
import { ROUTES } from "@/lib/constants/routes";
import { publicAliasLabel } from "@/lib/utils/privacy";
import type { PassengerMyTripRow } from "@/types/trip";
import { passengerMyTripRowPresentation } from "@/features/shared/lib/status-presentation";

const isDev = process.env.NODE_ENV === "development";

function MyTripsSkeleton() {
  return (
    <div className="space-y-6 md:space-y-7" aria-busy="true" aria-label="Loading trips">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-5 w-32 animate-pulse rounded bg-muted/60" />
          <div className="h-28 animate-pulse rounded-3xl bg-muted/50" />
        </div>
      ))}
    </div>
  );
}

function MyTripRowCard({ row }: { row: PassengerMyTripRow }) {
  const status = passengerMyTripRowPresentation(row);
  return (
    <Card className="overflow-hidden rounded-3xl border-border/90 transition-colors hover:border-primary/25">
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0 pb-2">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-xl leading-none"
            aria-hidden
          >
            {row.driver?.avatarEmoji ?? "·"}
          </span>
          <div className="min-w-0">
            <CardTitle className="truncate text-base">
              {row.driver ? publicAliasLabel(row.driver) : "Driver"}
            </CardTitle>
            <CardDescription className="truncate text-xs">
              {row.destinationLabel}
            </CardDescription>
          </div>
        </div>
        <Badge variant={status.tone} className="shrink-0">
          {status.label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <p className="text-xs leading-relaxed text-muted-foreground">{status.helper}</p>
        <div className="flex gap-2 rounded-2xl bg-muted/40 p-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Pickup
            </p>
            <p className="text-sm font-medium text-foreground">{row.pickupSummary}</p>
            {row.pickupSubtext ? (
              <p className="text-xs text-muted-foreground">{row.pickupSubtext}</p>
            ) : null}
          </div>
        </div>
        <Button
          asChild
          variant="outline"
          className="h-11 w-full justify-between rounded-2xl px-4"
        >
          <Link href={ROUTES.passengerTripDetail(row.tripInstanceId)}>
            Trip details
            <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function SectionBlock({
  title,
  description,
  rows,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  description: string;
  rows: PassengerMyTripRow[];
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <section className="space-y-3">
      <SectionHeader title={title} description={description} />
      {rows.length === 0 ? (
        <Card className="rounded-3xl border-dashed">
          <CardHeader>
            <CardTitle className="text-base">{emptyTitle}</CardTitle>
            <CardDescription>{emptyDescription}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <MyTripRowCard key={row.key} row={row} />
          ))}
        </div>
      )}
    </section>
  );
}

export function PassengerMyTripsScreen() {
  const { data, isPending, isError, error, refetch } = usePassengerMyTripsOverviewQuery();

  if (isPending) {
    return <MyTripsSkeleton />;
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

  const total =
    data.pendingRequests.length + data.upcomingTrips.length + data.pastTrips.length;
  const allEmpty = total === 0;

  return (
    <div className="space-y-8 pb-2 md:space-y-10">
      <SectionHeader
        title="My trips"
        description="Track seat requests and upcoming rides. Pickup stays approximate until a driver accepts you."
      />

      {isDev ? (
        <div className="rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 px-3 py-2 font-mono text-[10px] leading-relaxed text-amber-950 dark:text-amber-100">
          <p className="font-semibold text-amber-800 dark:text-amber-200">Dev</p>
          <p className="text-muted-foreground">
            Source: <code className="text-foreground/90">GET /api/v1/passenger/my-trips</code> (
            <span className="text-foreground/80">derivedFrom: {data.derivedFrom}</span>). Pickup lines
            follow server privacy rules (approx until accepted / allowed exact).
          </p>
        </div>
      ) : null}

      {allEmpty ? (
        <Card className="rounded-3xl border-primary/15">
          <CardHeader>
            <CardTitle className="text-base">Nothing here yet</CardTitle>
            <CardDescription>
              When you request a seat or join a trip, it will show up in the sections below. Your
              home screen highlights the next relevant trip when one exists.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild className="rounded-2xl">
              <Link href={ROUTES.passengerSearch}>Search routes</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-2xl">
              <Link href={ROUTES.home}>Home</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <SectionBlock
        title="Pending requests"
        description="Waiting for the driver to accept or decline your seat request."
        rows={data.pendingRequests}
        emptyTitle="No pending requests"
        emptyDescription="Send a seat request from Search to see it here."
      />

      <SectionBlock
        title="Upcoming trips"
        description="Accepted seats and trips in progress — open for details and pickup."
        rows={data.upcomingTrips}
        emptyTitle="No upcoming trips"
        emptyDescription="After a driver accepts, your trip appears here with pickup details."
      />

      <SectionBlock
        title="Past trips"
        description="Completed runs, cancelled trips, or declined requests."
        rows={data.pastTrips}
        emptyTitle="No past activity"
        emptyDescription="Finished or declined trips will appear here."
      />

      <PrivacyNotice />
    </div>
  );
}
