"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
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
import { useCreateDriverRouteTemplateMutation } from "@/features/driver/hooks";
import {
  createRouteFormDefaults,
  createRouteFormSchema,
  createRoutePayloadFromForm,
  DRIVER_ROUTE_DEST_PLACE_FIELDS,
  DRIVER_ROUTE_ORIGIN_PLACE_FIELDS,
  WEEKDAY_SHORT,
  type CreateRouteFormValues,
} from "@/features/driver/schemas/create-route-form";
import { useAppToast } from "@/features/shared/components/toast-provider";
import { ApiError, parseApiValidationErrors } from "@/lib/api/errors";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

function placeFieldError(
  errors: Partial<Record<keyof CreateRouteFormValues, { message?: string }>>,
  keys: (keyof CreateRouteFormValues)[],
): string | undefined {
  for (const k of keys) {
    const m = errors[k]?.message;
    if (m) return m;
  }
  return undefined;
}

export function DriverCreateRouteScreen() {
  const router = useRouter();
  const toast = useAppToast();
  const mutation = useCreateDriverRouteTemplateMutation();

  const form = useForm<CreateRouteFormValues>({
    resolver: zodResolver(createRouteFormSchema),
    defaultValues: createRouteFormDefaults(),
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    setError,
    formState: { errors },
  } = form;

  const scheduleType = watch("scheduleType");
  const selectedDays = watch("selectedDays") ?? [];

  const toggleDay = (day: number) => {
    const next = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day].sort((a, b) => a - b);
    setValue("selectedDays", next, { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    const payload = createRoutePayloadFromForm(values);
    try {
      await mutation.mutateAsync(payload);
      toast({
        message: "Route template created. Riders can see it on Search when it is active.",
        variant: "success",
      });
      router.push(ROUTES.driverRoutes);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const fieldErrors = parseApiValidationErrors(err);
        for (const [field, message] of Object.entries(fieldErrors)) {
          const k = field as keyof CreateRouteFormValues;
          if (k in values) {
            setError(k, { message });
          }
        }
        toast({
          message: "Please fix the highlighted fields (or check API validation messages).",
          variant: "error",
        });
        return;
      }
      toast({
        message:
          err instanceof ApiError ? err.message : "Could not create route. Check the form.",
        variant: "error",
      });
    }
  });

  const originErr = placeFieldError(errors, [
    "originPlaceId",
    "originLabel",
    "originLat",
    "originLng",
  ]);
  const destErr = placeFieldError(errors, [
    "destinationPlaceId",
    "destinationLabel",
    "destinationLat",
    "destinationLng",
  ]);

  return (
    <FormProvider {...form}>
      <div className="space-y-6 pb-2 md:space-y-7">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-2xl" asChild>
            <Link href={ROUTES.driverRoutes} aria-label="Back to routes">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <SectionHeader
            title="New route"
            description="Pick real places so matching and maps stay accurate later."
            className="flex-1 border-0 pb-0"
          />
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-base">Corridor</CardTitle>
              <CardDescription>
                Search and select origin and destination. Labels, place IDs, and coordinates are
                filled from Google Places.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <PlaceAutocompleteField<CreateRouteFormValues>
                control={control}
                fields={DRIVER_ROUTE_ORIGIN_PLACE_FIELDS}
                htmlId="route-origin-place"
                label="Origin"
                placeholder="Search origin (address or place)"
                disabled={mutation.isPending}
                helperText={originErr}
                helperVariant="destructive"
              />
              <PlaceAutocompleteField<CreateRouteFormValues>
                control={control}
                fields={DRIVER_ROUTE_DEST_PLACE_FIELDS}
                htmlId="route-destination-place"
                label="Destination"
                placeholder="Search destination (address or place)"
                disabled={mutation.isPending}
                helperText={destErr}
                helperVariant="destructive"
              />
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-base">Schedule</CardTitle>
              <CardDescription>Departure clock time and recurrence.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="departureTime">Departure time (24h)</Label>
                <Input
                  id="departureTime"
                  type="time"
                  className="rounded-2xl"
                  {...register("departureTime")}
                />
                {errors.departureTime ? (
                  <p className="text-xs text-destructive">{errors.departureTime.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduleType">Schedule type</Label>
                <select
                  id="scheduleType"
                  className={cn(
                    "flex h-11 w-full rounded-2xl border border-input bg-transparent px-3 py-2 text-sm",
                    "ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  )}
                  {...register("scheduleType")}
                >
                  <option value="recurring">Recurring (weekly)</option>
                  <option value="one_off">One-off</option>
                </select>
              </div>
              {scheduleType === "recurring" ? (
                <div className="space-y-2">
                  <Label>Active weekdays</Label>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAY_SHORT.map((label, day) => (
                      <Button
                        key={label}
                        type="button"
                        size="sm"
                        variant={selectedDays.includes(day) ? "default" : "outline"}
                        className="rounded-xl px-3"
                        onClick={() => toggleDay(day)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                  {errors.selectedDays ? (
                    <p className="text-xs text-destructive">{errors.selectedDays.message}</p>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-base">Capacity & pickup</CardTitle>
              <CardDescription>Seats, detour tolerance, and approximate corridor radius.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="seatsTotal">Seats offered</Label>
                <Input
                  id="seatsTotal"
                  type="number"
                  min={1}
                  max={20}
                  className="rounded-2xl"
                  {...register("seatsTotal", { valueAsNumber: true })}
                />
                {errors.seatsTotal ? (
                  <p className="text-xs text-destructive">{errors.seatsTotal.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="detourToleranceMinutes">Detour ± (minutes)</Label>
                <Input
                  id="detourToleranceMinutes"
                  type="number"
                  min={0}
                  max={120}
                  className="rounded-2xl"
                  {...register("detourToleranceMinutes", { valueAsNumber: true })}
                />
                {errors.detourToleranceMinutes ? (
                  <p className="text-xs text-destructive">
                    {errors.detourToleranceMinutes.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickupRadiusMeters">Pickup radius (m)</Label>
                <Input
                  id="pickupRadiusMeters"
                  type="number"
                  min={50}
                  max={5000}
                  className="rounded-2xl"
                  {...register("pickupRadiusMeters", { valueAsNumber: true })}
                />
                {errors.pickupRadiusMeters ? (
                  <p className="text-xs text-destructive">{errors.pickupRadiusMeters.message}</p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" className="rounded-2xl" asChild>
              <Link href={ROUTES.driverRoutes}>Cancel</Link>
            </Button>
            <Button type="submit" className="rounded-2xl" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating…" : "Create route"}
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
