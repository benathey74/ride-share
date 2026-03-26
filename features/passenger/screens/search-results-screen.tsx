"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { PlaceAutocompleteField } from "@/components/location/place-autocomplete-field";
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
import { CorridorMapPreview } from "@/components/maps/corridor-map-preview";
import { ApiErrorDevHint } from "@/components/dev/api-error-hint";
import {
  passengerRouteSearchParamsFromForm,
  type PassengerRouteSearchParams,
} from "@/features/passenger/api";
import {
  useCreatePassengerTripRequestMutation,
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
import { parseLatLng } from "@/lib/maps/parse-lat-lng";
import {
  formatApproximatePickup,
  publicAliasLabel,
} from "@/lib/utils/privacy";
import { TRIP_MAP_MARKER, TRIP_PICKUP_LABEL } from "@/features/shared/lib/trip-map-copy";
import { ROUTE_MATCH_HINT_LABELS, type RouteSuggestion } from "@/types/route";

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
  onRequest,
  isSubmitting,
  lastSucceededId,
}: {
  route: RouteSuggestion;
  message: string;
  onMessageChange: (v: string) => void;
  onRequest: () => void;
  isSubmitting: boolean;
  lastSucceededId: string | null;
}) {
  const canRequest = Boolean(route.nextTripInstanceId);
  const pickupLine = formatApproximatePickup(
    route.pickupAreaLabel,
    route.pickupFuzzRadiusM,
  );

  const originLL = parseLatLng(route.approxPickupLat, route.approxPickupLng);
  const destLL = parseLatLng(route.destinationLat, route.destinationLng);

  return (
    <Card className="rounded-3xl border-border/90">
      <CardHeader>
        <CardTitle className="text-base">{route.name}</CardTitle>
        <CardDescription>
          <span className="inline-flex flex-wrap items-center gap-2">
            {route.host ? (
              <Badge variant="secondary">{publicAliasLabel(route.host)}</Badge>
            ) : (
              <Badge variant="outline">Host</Badge>
            )}
            <span className="text-muted-foreground">{route.departureWindowLabel}</span>
          </span>
        </CardDescription>
        {route.matchHints && route.matchHints.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {route.matchHints.map((h) => (
              <Badge
                key={h}
                variant="outline"
                className="rounded-lg border-primary/25 bg-primary/[0.06] px-2 py-0.5 text-[10px] font-medium leading-tight text-foreground"
              >
                {ROUTE_MATCH_HINT_LABELS[h]}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
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
          />
        ) : null}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {TRIP_PICKUP_LABEL.approxEyebrow}
          </p>
          <p className="text-sm font-medium text-foreground">{pickupLine}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`msg-${route.routeTemplateId}`}>Message to driver (optional)</Label>
          <Input
            id={`msg-${route.routeTemplateId}`}
            className="rounded-2xl"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="e.g. I can meet at the lobby"
            maxLength={2000}
            disabled={!canRequest || isSubmitting}
          />
        </div>
        {!canRequest ? (
          <p className="text-xs text-muted-foreground">
            No open trip instance for this route right now. Check back after the host schedules
            one.
          </p>
        ) : null}
        {lastSucceededId === route.routeTemplateId ? (
          <div className="space-y-2" role="status">
            <p className="text-xs font-medium text-primary">
              Request sent — the driver will see your seat request soon.
            </p>
            {route.nextTripInstanceId ? (
              <Button asChild variant="outline" size="sm" className="w-full rounded-xl">
                <Link href={ROUTES.passengerTripDetail(route.nextTripInstanceId)}>
                  View trip details
                </Link>
              </Button>
            ) : null}
          </div>
        ) : null}
        <Button
          type="button"
          className="w-full rounded-2xl"
          disabled={!canRequest || isSubmitting}
          onClick={onRequest}
        >
          {isSubmitting ? "Sending request…" : "Request seat"}
        </Button>
      </CardContent>
    </Card>
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
  const toast = useAppToast();
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [lastOkTemplate, setLastOkTemplate] = useState<string | null>(null);
  const [submittingRouteId, setSubmittingRouteId] = useState<string | null>(null);

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

  return (
    <FormProvider {...form}>
      <div className="space-y-6 pb-2 md:space-y-7">
        <SectionHeader
          title="Search routes"
          description="Choose real pickup and destination places. Results match driver corridors near those points (privacy-safe cards below)."
        />

        <Card className="rounded-3xl border-border/90">
          <CardHeader>
            <CardTitle className="text-base">Where are you going?</CardTitle>
            <CardDescription>
              Use the suggestions list — typed text alone is not enough to search.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6" noValidate>
              <PlaceAutocompleteField<PassengerSearchRoutesFormValues>
                control={control}
                fields={PASSENGER_SEARCH_PICKUP_FIELDS}
                htmlId="passenger-search-pickup"
                label="Pickup"
                placeholder="Search pickup location"
                disabled={resultsLoading}
                helperText={pickupErr}
                helperVariant="destructive"
              />
              <PlaceAutocompleteField<PassengerSearchRoutesFormValues>
                control={control}
                fields={PASSENGER_SEARCH_DEST_FIELDS}
                htmlId="passenger-search-destination"
                label="Destination"
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
                {resultsLoading ? "Searching…" : "Search routes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {!showResults ? (
          <Card className="rounded-3xl border-dashed border-border/80 bg-muted/20">
            <CardHeader>
              <CardTitle className="text-base">No search yet</CardTitle>
              <CardDescription>
                Select pickup and destination from Google Places, then tap{" "}
                <span className="font-medium text-foreground">Search routes</span> to see matching
                corridors.
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
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-base">No matching routes</CardTitle>
              <CardDescription>
                No active driver corridor is close enough to both your pickup and destination. Try
                nearby places or check back when hosts add routes along this corridor.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {resultsReady && routes.length > 0 ? (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Showing {routes.length} corridor{routes.length === 1 ? "" : "s"} for your search.
            </p>
            {routes.map((route) => (
              <RouteCard
                key={route.routeTemplateId}
                route={route}
                message={messages[route.routeTemplateId] ?? ""}
                onMessageChange={(v) =>
                  setMessages((m) => ({ ...m, [route.routeTemplateId]: v }))
                }
                isSubmitting={
                  mutation.isPending && submittingRouteId === route.routeTemplateId
                }
                lastSucceededId={lastOkTemplate}
                onRequest={() => {
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
                        setLastOkTemplate(route.routeTemplateId);
                        toast({
                          message:
                            "Seat request sent. The host will see your approximate pickup and message.",
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
      </div>
    </FormProvider>
  );
}
