import {
  apiGetJson,
  apiPatchJson,
  apiPutJson,
  getApiBaseUrl,
  unwrapData,
} from "@/lib/api/client";
import type { OnboardingSnapshot, SavedPlacePutItem, SavedPlaceRow } from "./types";
import { toMeProfile } from "@/features/shared/api";

export function isApiConfigured(): boolean {
  return Boolean(getApiBaseUrl());
}

export async function fetchOnboardingSnapshot(): Promise<OnboardingSnapshot> {
  const json = await apiGetJson("/api/v1/me/onboarding");
  const { onboarding } = unwrapData<{ onboarding: OnboardingSnapshot }>(json);
  return onboarding;
}

export async function putSavedPlaces(
  places: SavedPlacePutItem[],
): Promise<SavedPlaceRow[]> {
  const json = await apiPutJson("/api/v1/me/saved-places", { places });
  const { savedPlaces } = unwrapData<{ savedPlaces: SavedPlaceRow[] }>(json);
  return savedPlaces;
}

export type PutPassengerProfileBody = {
  accessibilityNotes: string | null;
  usualCommuteDays: number[];
  preferredMorningTime: string;
  preferredEveningTime: string;
  ridePreferences: string | null;
};

export async function putPassengerProfile(
  body: PutPassengerProfileBody,
): Promise<ReturnType<typeof toMeProfile>> {
  const json = await apiPutJson("/api/v1/me/passenger-profile", body);
  type ProfilePayload = Parameters<typeof toMeProfile>[0];
  const { profile } = unwrapData<{ profile: ProfilePayload }>(json);
  return toMeProfile(profile);
}

export type PutDriverProfileBody = {
  vehicleMake: string;
  vehicleModel: string;
  vehicleColor: string;
  plateNumber: string;
  seatsTotal: number;
  detourToleranceMinutes: number;
  pickupRadiusMeters: number;
  commuteNotes: string | null;
};

export async function putDriverProfile(
  body: PutDriverProfileBody,
): Promise<ReturnType<typeof toMeProfile>> {
  const json = await apiPutJson("/api/v1/me/driver-profile", body);
  type ProfilePayload = Parameters<typeof toMeProfile>[0];
  const { profile } = unwrapData<{ profile: ProfilePayload }>(json);
  return toMeProfile(profile);
}

export type PatchMeProfileBody = {
  realName?: string | null;
  phone?: string | null;
  accessibilityNotes?: string | null;
  departmentTeam?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  completeOnboarding?: boolean;
};

export async function patchMeProfile(
  body: PatchMeProfileBody,
): Promise<ReturnType<typeof toMeProfile>> {
  const json = await apiPatchJson("/api/v1/me/profile", body);
  type ProfilePayload = Parameters<typeof toMeProfile>[0];
  const { profile } = unwrapData<{ profile: ProfilePayload }>(json);
  return toMeProfile(profile);
}

export async function patchMePublicProfile(input: {
  alias?: string;
  avatar?: string;
}): Promise<void> {
  await apiPatchJson("/api/v1/me/public-profile", input);
}
