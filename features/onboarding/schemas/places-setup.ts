import { z } from "zod";

const decimalCoord = z
  .string()
  .trim()
  .min(1, "Required")
  .max(32)
  .regex(/^-?\d+(\.\d+)?$/, "Use decimal degrees");

const googlePlaceId = z
  .string()
  .trim()
  .min(1, "Choose a place from the suggestions")
  .max(255);

export const ONBOARDING_HOME_PLACE_FIELDS = {
  label: "homeLabel",
  placeId: "homePlaceId",
  lat: "homeLat",
  lng: "homeLng",
} as const;

export const ONBOARDING_WORK_PLACE_FIELDS = {
  label: "workLabel",
  placeId: "workPlaceId",
  lat: "workLat",
  lng: "workLng",
} as const;

export const onboardingPlacesSetupSchema = z.object({
  homeLabel: z.string().trim().min(2).max(160),
  homePlaceId: googlePlaceId,
  homeLat: decimalCoord,
  homeLng: decimalCoord,
  workLabel: z.string().trim().min(2).max(160),
  workPlaceId: googlePlaceId,
  workLat: decimalCoord,
  workLng: decimalCoord,
});

export type OnboardingPlacesSetupValues = z.infer<typeof onboardingPlacesSetupSchema>;
