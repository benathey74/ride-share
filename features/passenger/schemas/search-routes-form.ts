import { z } from "zod";

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

/** RHF + `PlaceAutocompleteField` paths for rider pickup. */
export const PASSENGER_SEARCH_PICKUP_FIELDS = {
  label: "pickupLabel",
  placeId: "pickupPlaceId",
  lat: "pickupLat",
  lng: "pickupLng",
} as const;

/** RHF + `PlaceAutocompleteField` paths for rider destination. */
export const PASSENGER_SEARCH_DEST_FIELDS = {
  label: "destinationLabel",
  placeId: "destinationPlaceId",
  lat: "destinationLat",
  lng: "destinationLng",
} as const;

export const passengerSearchRoutesFormSchema = z.object({
  pickupLabel: z.string().trim().min(2).max(160),
  pickupPlaceId: googlePlaceId,
  destinationLabel: z.string().trim().min(2).max(160),
  destinationPlaceId: googlePlaceId,
  pickupLat: decimalCoord,
  pickupLng: decimalCoord,
  destinationLat: decimalCoord,
  destinationLng: decimalCoord,
});

export type PassengerSearchRoutesFormValues = z.infer<typeof passengerSearchRoutesFormSchema>;

export function passengerSearchRoutesFormDefaults(): PassengerSearchRoutesFormValues {
  return {
    pickupLabel: "",
    pickupPlaceId: "",
    destinationLabel: "",
    destinationPlaceId: "",
    pickupLat: "",
    pickupLng: "",
    destinationLat: "",
    destinationLng: "",
  };
}
