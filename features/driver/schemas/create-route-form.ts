import { z } from "zod";
import type { CreateDriverRouteTemplateInput } from "@/types/driver";

const decimalCoord = z
  .string()
  .trim()
  .min(1, "Required")
  .max(32)
  .regex(/^-?\d+(\.\d+)?$/, "Use decimal degrees (e.g. 14.5995)");

const googlePlaceId = z
  .string()
  .trim()
  .min(1, "Choose a place from the suggestions")
  .max(255);

/** RHF + `PlaceAutocompleteField` field paths for the origin stop. */
export const DRIVER_ROUTE_ORIGIN_PLACE_FIELDS = {
  label: "originLabel",
  placeId: "originPlaceId",
  lat: "originLat",
  lng: "originLng",
} as const;

/** RHF + `PlaceAutocompleteField` field paths for the destination stop. */
export const DRIVER_ROUTE_DEST_PLACE_FIELDS = {
  label: "destinationLabel",
  placeId: "destinationPlaceId",
  lat: "destinationLat",
  lng: "destinationLng",
} as const;

export const createRouteFormSchema = z
  .object({
    originLabel: z.string().trim().min(2).max(160),
    destinationLabel: z.string().trim().min(2).max(160),
    originPlaceId: googlePlaceId,
    destinationPlaceId: googlePlaceId,
    scheduleType: z.enum(["recurring", "one_off"]),
    departureTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Use HH:MM (24h)"),
    seatsTotal: z.number().int().min(1).max(20),
    detourToleranceMinutes: z.number().int().min(0).max(120),
    pickupRadiusMeters: z.number().int().min(50).max(5000),
    originLat: decimalCoord,
    originLng: decimalCoord,
    destinationLat: decimalCoord,
    destinationLng: decimalCoord,
    selectedDays: z.array(z.number().int().min(0).max(6)),
  })
  .superRefine((val, ctx) => {
    if (val.scheduleType === "recurring" && val.selectedDays.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Select at least one day",
        path: ["selectedDays"],
      });
    }
  });

export type CreateRouteFormValues = z.infer<typeof createRouteFormSchema>;

export function createRouteFormDefaults(): CreateRouteFormValues {
  return {
    originLabel: "",
    destinationLabel: "",
    originPlaceId: "",
    destinationPlaceId: "",
    scheduleType: "recurring",
    departureTime: "07:00",
    seatsTotal: 4,
    detourToleranceMinutes: 10,
    pickupRadiusMeters: 400,
    originLat: "",
    originLng: "",
    destinationLat: "",
    destinationLng: "",
    selectedDays: [1, 2, 3, 4, 5],
  };
}

export function createRoutePayloadFromForm(
  values: CreateRouteFormValues,
): CreateDriverRouteTemplateInput {
  const base: CreateDriverRouteTemplateInput = {
    originLabel: values.originLabel,
    destinationLabel: values.destinationLabel,
    originPlaceId: values.originPlaceId.trim(),
    destinationPlaceId: values.destinationPlaceId.trim(),
    originLat: values.originLat,
    originLng: values.originLng,
    destinationLat: values.destinationLat,
    destinationLng: values.destinationLng,
    scheduleType: values.scheduleType,
    departureTime: values.departureTime,
    seatsTotal: values.seatsTotal,
    detourToleranceMinutes: values.detourToleranceMinutes,
    pickupRadiusMeters: values.pickupRadiusMeters,
  };
  if (values.scheduleType === "recurring") {
    base.schedules = values.selectedDays.map((dayOfWeek) => ({
      dayOfWeek,
      isActive: true,
    }));
  }
  return base;
}

export const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
