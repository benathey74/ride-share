"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { PlaceAutocompleteField } from "@/components/location/place-autocomplete-field";
import { SectionHeader } from "@/components/layout/section-header";
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
import { PassengerRouteCorridorCard } from "@/features/passenger/components/passenger-route-corridor-card";
import { ApiErrorDevHint } from "@/components/dev/api-error-hint";
import {
  passengerRouteSearchParamsFromForm,
  type PassengerRouteSearchParams,
} from "@/features/passenger/api";
import {
  useCreatePassengerTripRequestMutation,
  useExpressCorridorInterestMutation,
  usePassengerRouteSuggestionsQuery,
} from "@/features/passenger/hooks";
import {
  PASSENGER_SEARCH_DEST_FIELDS,
  PASSENGER_SEARCH_PICKUP_FIELDS,
  passengerSearchRoutesFormDefaults,
  passengerSearchRoutesFormSchema,
  type PassengerSearchRoutesFormValues,
} from "@/features/passenger/schemas/search-routes-form";
import { PrivacyNotice } from "@/features/shared/components/privacy-notice";
import { useAppToast } from "@/features/shared/components/toast-provider";
import { describeApiFailure } from "@/lib/api/errors";
import { ROUTES } from "@/lib/constants/routes";
import type { RouteSuggestion } from "@/types/route";

function placeFieldError(
  errors: Partial<Record<keyof PassengerSearchRoutesFormValues, { message?: string }>>,
  keys: (keyof PassengerSearchRoutesFormValues)[],
): string | undefined {
  for (const k of keys) {
    const m = errors[k]?.message;
    if (m) return m;
  }
  return undefined;
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading routes">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-36 animate-pulse rounded-3xl bg-muted/50" />
      ))}
    </div>
  );
}

function RouteCard({
  route,
  message,
  onMessageChange,
  onRequestSeat,
  seatSubmitting,
  lastSeatOkTemplateId,
  onNotifyInterest,
  interestSubmitting,
  lastInterestOkTemplateId,
  sentRecently,
  highlight,
}: {
  route: RouteSuggestion;
  message: string;
  onMessageChange: (v: string) => void;
  onRequestSeat: () => void;
  seatSubmitting: boolean;
  lastSeatOkTemplateId: string | null;
  onNotifyInterest: () => void;
  interestSubmitting: boolean;
  lastInterestOkTemplateId: string | null;
  sentRecently: boolean;
  highlight?: boolean;
}) {
  const isBookable = Boolean(route.nextTripInstanceId);
  const statusBadge = isBookable
    ? { text: "Available ride", tone: "available" as const }
    : { text: "No rides available right now", tone: "unavailable" as const };
  const existingInterest = !isBookable ? route.corridorInterest ?? null : null;
  const hasExistingInterest = Boolean(existingInterest?.hasContacted);
  const interestUpdatedAtLabel =
    existingInterest?.updatedAt && !Number.isNaN(Date.parse(existingInterest.updatedAt))
      ? new Date(existingInterest.updatedAt).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : null;

  return (
    <PassengerRouteCorridorCard
      route={route}
      showMatchHints
      mapPointerEvents={isBookable ? "auto" : "none"}
      cardId={`passenger-route-card-${route.routeTemplateId}`}
      highlight={highlight}
      statusBadge={statusBadge}
    >
      <div className="relative z-10 space-y-3 border-t border-border/60 pt-3">
        {isBookable && route.nextTripInstanceId ? (
          <Button asChild variant="outline" className="h-11 w-full rounded-2xl font-semibold">
            <Link href={ROUTES.passengerPublicRide(route.nextTripInstanceId)}>View ride</Link>
          </Button>
        ) : null}

        {isBookable ? (
          <>
            <div className="space-y-2">
              <Label htmlFor={`msg-${route.routeTemplateId}`}>Note to the driver (optional)</Label>
              <Input
                id={`msg-${route.routeTemplateId}`}
                className="rounded-2xl"
                value={message}
                onChange={(e) => onMessageChange(e.target.value)}
                placeholder="e.g. I can meet at the lobby"
                maxLength={2000}
                disabled={seatSubmitting}
              />
            </div>
            {lastSeatOkTemplateId === route.routeTemplateId ? (
              <div className="space-y-2" role="status">
                <p className="text-xs font-medium text-primary">
                  Request sent — you’ll see <strong>Waiting for driver</strong> on the trip until they
                  respond.
                </p>
                {route.nextTripInstanceId ? (
                  <Button asChild variant="secondary" size="sm" className="w-full rounded-xl">
                    <Link href={ROUTES.passengerPrivateTripDetail(route.nextTripInstanceId)}>
                      Open trip
                    </Link>
                  </Button>
                ) : null}
              </div>
            ) : null}
            <Button
              type="button"
              className="h-12 w-full rounded-2xl text-base font-semibold"
              disabled={seatSubmitting}
              onClick={onRequestSeat}
            >
              {seatSubmitting ? "Sending…" : "Request a seat"}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-1.5 rounded-2xl border border-border/70 bg-muted/20 px-3 py-2.5">
              <p className="text-sm font-semibold text-foreground">
                No rides available for this route yet
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {hasExistingInterest
                  ? "You’ve already notified the driver. Edit your note any time if your plans changed."
                  : "This route matches your pickup and destination, but there’s no ride you can book yet. Add an optional note and notify the driver."}
              </p>
            </div>
            {hasExistingInterest ? (
              <div className="rounded-2xl border border-border/70 bg-muted/30 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  You’ve contacted the driver
                </p>
                {existingInterest?.message ? (
                  <p className="mt-1 text-xs text-foreground">“{existingInterest.message}”</p>
                ) : null}
                {interestUpdatedAtLabel ? (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Last updated {interestUpdatedAtLabel}
                  </p>
                ) : null}
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor={`interest-${route.routeTemplateId}`}>
                Note to the driver (optional)
              </Label>
              <Input
                id={`interest-${route.routeTemplateId}`}
                className="rounded-2xl"
                value={message}
                onChange={(e) => onMessageChange(e.target.value)}
                placeholder="e.g. I commute this way most Tuesdays"
                maxLength={2000}
                disabled={interestSubmitting || sentRecently}
              />
            </div>
            <Button
              type="button"
              className="h-12 w-full rounded-2xl text-base font-semibold"
              disabled={interestSubmitting || sentRecently}
              onClick={onNotifyInterest}
            >
              {interestSubmitting
                ? "Sending…"
                : sentRecently
                  ? "Sent to driver"
                  : hasExistingInterest
                    ? "Update your interest"
                    : "Notify driver you're interested"}
            </Button>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {hasExistingInterest ? "Update your note anytime." : "We’ll let the driver know you want this trip."}{" "}
              After they schedule a run with seats, use{" "}
              <span className="font-medium text-foreground">View ride</span> and{" "}
              <span className="font-medium text-foreground">Request a seat</span> on this card.
            </p>
            {lastInterestOkTemplateId === route.routeTemplateId ? (
              <p className="text-xs font-medium text-primary" role="status">
                Sent to driver. You can edit and resend in a moment.
              </p>
            ) : null}
          </>
        )}
      </div>
    </PassengerRouteCorridorCard>
  );
}

export function SearchResultsScreen() {
  const [committedSearch, setCommittedSearch] =
    useState<PassengerRouteSearchParams | null>(null);

  const { data, isPending, isError, error, refetch, isFetching } =
    usePassengerRouteSuggestionsQuery(committedSearch);

  const form = useForm<PassengerSearchRoutesFormValues>({
    resolver: zodResolver(passengerSearchRoutesFormSchema),
    defaultValues: passengerSearchRoutesFormDefaults(),
    mode: "onBlur",
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  const mutation = useCreatePassengerTripRequestMutation();
  const interestMutation = useExpressCorridorInterestMutation();
  const toast = useAppToast();
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [lastSeatOkTemplate, setLastSeatOkTemplate] = useState<string | null>(null);
  const [lastInterestOkTemplate, setLastInterestOkTemplate] = useState<string | null>(null);
  const [submittingRouteId, setSubmittingRouteId] = useState<string | null>(null);
  const [submittingInterestRouteId, setSubmittingInterestRouteId] = useState<string | null>(null);
  const [recentlySentInterestByTemplate, setRecentlySentInterestByTemplate] =
    useState<Record<string, boolean>>({});

  const onSubmit = handleSubmit((values) => {
    setCommittedSearch(passengerRouteSearchParamsFromForm(values));
  });

  const pickupErr = placeFieldError(errors, [
    "pickupPlaceId",
    "pickupLabel",
    "pickupLat",
    "pickupLng",
  ]);
  const destErr = placeFieldError(errors, [
    "destinationPlaceId",
    "destinationLabel",
    "destinationLat",
    "destinationLng",
  ]);

  const showResults = committedSearch !== null;
  const routes = data ?? [];
  const resultsLoading = showResults && isPending;
  const resultsError = showResults && isError;
  const resultsReady = showResults && !isError && !isPending;

  const searchParams = useSearchParams();
  const focusTemplateId = searchParams.get("routeTemplateId")?.trim() || null;
  const focusRouteName = searchParams.get("routeName")?.trim() || null;
  const corridorFocusLabel = focusRouteName || "this corridor";
  const focusInResults =
    Boolean(focusTemplateId) && routes.some((r) => r.routeTemplateId === focusTemplateId);
  const scrollSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    if (!resultsReady || !focusTemplateId || !committedSearch) return;
    const inList = routes.some((r) => r.routeTemplateId === focusTemplateId);
    if (!inList) return;
    const sig = `${focusTemplateId}:${committedSearch.pickupLat}:${committedSearch.pickupLng}:${committedSearch.destinationLat}:${committedSearch.destinationLng}`;
    if (scrollSignatureRef.current === sig) return;
    scrollSignatureRef.current = sig;
    const el = document.getElementById(`passenger-route-card-${focusTemplateId}`);
    requestAnimationFrame(() => {
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, [resultsReady, focusTemplateId, routes, committedSearch]);

  return (
    <FormProvider {...form}>
      <div className="space-y-6 pb-2 md:space-y-7">
        <SectionHeader
          title="Find a ride"
          description="Pick real places from the list. We match driver corridors to your pickup and destination without exposing exact addresses until you’re accepted."
        />

        {focusTemplateId && !showResults ? (
          <Card className="rounded-3xl border-primary/25 bg-primary/[0.05]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Continue with a corridor</CardTitle>
              <CardDescription className="text-left">
                You opened search for <span className="font-medium text-foreground">{corridorFocusLabel}</span>.
                Enter pickup and destination above, then tap{" "}
                <span className="font-medium text-foreground">Show matching routes</span> — we’ll
                scroll to that card when it appears in your results.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        <Card className="rounded-3xl border-border/90">
          <CardHeader>
            <CardTitle className="text-base">Your trip</CardTitle>
            <CardDescription>
              Choose each stop from Google’s suggestions — free typing alone won’t run a search.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6" noValidate>
              <PlaceAutocompleteField<PassengerSearchRoutesFormValues>
                control={control}
                fields={PASSENGER_SEARCH_PICKUP_FIELDS}
                htmlId="passenger-search-pickup"
                label="Pickup (where you’ll get in)"
                placeholder="Search pickup"
                disabled={resultsLoading}
                helperText={pickupErr}
                helperVariant="destructive"
              />
              <PlaceAutocompleteField<PassengerSearchRoutesFormValues>
                control={control}
                fields={PASSENGER_SEARCH_DEST_FIELDS}
                htmlId="passenger-search-destination"
                label="Destination (where you’re headed)"
                placeholder="Search destination"
                disabled={resultsLoading}
                helperText={destErr}
                helperVariant="destructive"
              />
              <Button
                type="submit"
                className="w-full rounded-2xl sm:w-auto sm:min-w-[140px]"
                disabled={resultsLoading}
              >
                {resultsLoading ? "Searching…" : "Show matching routes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {!showResults ? (
          <Card className="rounded-3xl border-dashed border-border/80 bg-muted/20">
            <CardHeader>
              <CardTitle className="text-base">Start with two places</CardTitle>
              <CardDescription>
                Pick pickup and destination from the lists, then tap{" "}
                <span className="font-medium text-foreground">Show matching routes</span>.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {showResults && isFetching && !isPending ? (
          <p className="text-center text-xs text-muted-foreground" aria-live="polite">
            Updating results…
          </p>
        ) : null}

        {resultsError ? (
          <Card className="rounded-3xl border-destructive/30">
            <CardHeader>
              <CardTitle className="text-base">{describeApiFailure(error).title}</CardTitle>
              <CardDescription className="whitespace-pre-wrap text-left">
                {describeApiFailure(error).description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="button" variant="secondary" className="rounded-2xl" onClick={() => refetch()}>
                Retry
              </Button>
              <ApiErrorDevHint error={error} />
            </CardContent>
          </Card>
        ) : null}

        {resultsLoading ? <SearchResultsSkeleton /> : null}

        {resultsReady && routes.length === 0 ? (
          <Card className="rounded-3xl border-dashed border-border/80">
            <CardHeader>
              <CardTitle className="text-base">No corridors match this trip</CardTitle>
              <CardDescription className="space-y-2 text-left">
                <p>
                  No approved driver route is close enough to <strong>both</strong> your pickup and
                  destination right now.
                </p>
                <p className="text-xs text-muted-foreground">
                  Try nearby cross streets, a park-and-ride, or a broader destination. New routes
                  appear as drivers publish them.
                </p>
                {focusTemplateId ? (
                  <p className="text-xs text-muted-foreground">
                    The corridor you picked from home ({corridorFocusLabel}) doesn’t fit these places
                    — adjust pickup or destination and search again.
                  </p>
                ) : null}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {resultsReady && focusTemplateId && routes.length > 0 && !focusInResults ? (
          <Card className="rounded-3xl border-amber-500/30 bg-amber-500/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-amber-950 dark:text-amber-50">
                Corridor not in this list
              </CardTitle>
              <CardDescription className="text-left text-amber-950/90 dark:text-amber-100/90">
                <span className="font-medium text-foreground">{corridorFocusLabel}</span> didn’t
                match your pickup and destination. Try nearby stops or another time — ranked cards
                below are still valid options.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {resultsReady && routes.length > 0 ? (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              {routes.length} corridor{routes.length === 1 ? "" : "s"} ranked for your pickup and
              destination. When a run is open: <span className="font-medium text-foreground">View ride</span>{" "}
              and <span className="font-medium text-foreground">Request a seat</span>. When there’s no
              bookable run yet: <span className="font-medium text-foreground">Notify driver you're interested</span> on
              each card.
            </p>
            {routes.map((route) => (
              <RouteCard
                key={route.routeTemplateId}
                route={route}
                highlight={Boolean(focusTemplateId && route.routeTemplateId === focusTemplateId)}
                message={messages[route.routeTemplateId] ?? ""}
                onMessageChange={(v) =>
                  setMessages((m) => ({ ...m, [route.routeTemplateId]: v }))
                }
                seatSubmitting={
                  mutation.isPending && submittingRouteId === route.routeTemplateId
                }
                lastSeatOkTemplateId={lastSeatOkTemplate}
                onRequestSeat={() => {
                  if (!route.nextTripInstanceId) return;
                  const tid = Number(route.nextTripInstanceId);
                  if (!Number.isFinite(tid)) return;
                  setSubmittingRouteId(route.routeTemplateId);
                  mutation.mutate(
                    {
                      tripInstanceId: tid,
                      approxPickupLabel: route.pickupAreaLabel,
                      approxPickupLat: route.approxPickupLat,
                      approxPickupLng: route.approxPickupLng,
                      approxPickupRadiusMeters: route.pickupFuzzRadiusM,
                      message: messages[route.routeTemplateId]?.trim() || null,
                    },
                    {
                      onSuccess: () => {
                        setLastSeatOkTemplate(route.routeTemplateId);
                        toast({
                          message:
                            "Seat request sent. The driver sees your approximate pickup and note — wait for accept or decline.",
                          variant: "success",
                        });
                      },
                      onError: (err) => {
                        toast({
                          message: describeApiFailure(err).title,
                          variant: "error",
                        });
                      },
                      onSettled: () => setSubmittingRouteId(null),
                    },
                  );
                }}
                interestSubmitting={
                  interestMutation.isPending &&
                  submittingInterestRouteId === route.routeTemplateId
                }
                lastInterestOkTemplateId={lastInterestOkTemplate}
                sentRecently={Boolean(recentlySentInterestByTemplate[route.routeTemplateId])}
                onNotifyInterest={() => {
                  setSubmittingInterestRouteId(route.routeTemplateId);
                  interestMutation.mutate(
                    {
                      routeTemplateId: route.routeTemplateId,
                      message: messages[route.routeTemplateId]?.trim() || null,
                    },
                    {
                      onSuccess: (res) => {
                        setLastInterestOkTemplate(route.routeTemplateId);
                        setRecentlySentInterestByTemplate((prev) => ({
                          ...prev,
                          [route.routeTemplateId]: true,
                        }));
                        window.setTimeout(() => {
                          setRecentlySentInterestByTemplate((prev) => ({
                            ...prev,
                            [route.routeTemplateId]: false,
                          }));
                        }, 2500);
                        toast({
                          message: res.updated
                            ? "Updated your note for this corridor — the driver will see it on their dashboard."
                            : "The driver will see your interest on their dashboard.",
                          variant: "success",
                        });
                      },
                      onError: (err) => {
                        toast({
                          message: describeApiFailure(err).title,
                          variant: "error",
                        });
                      },
                      onSettled: () => setSubmittingInterestRouteId(null),
                    },
                  );
                }}
              />
            ))}
          </div>
        ) : null}

        <PrivacyNotice />

        {mutation.isError ? (
          <div className="space-y-2">
            <p className="text-center text-xs text-destructive" role="alert">
              {describeApiFailure(mutation.error).description}
            </p>
            <ApiErrorDevHint error={mutation.error} />
          </div>
        ) : null}
        {interestMutation.isError ? (
          <div className="space-y-2">
            <p className="text-center text-xs text-destructive" role="alert">
              {describeApiFailure(interestMutation.error).description}
            </p>
            <ApiErrorDevHint error={interestMutation.error} />
          </div>
        ) : null}
      </div>
    </FormProvider>
  );
}
