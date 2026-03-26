import type { MeProfile } from "@/types/profile";
import {
  apiGetJson,
  apiPatchJson,
  unwrapData,
} from "@/lib/api/client";
import type { ProfileFormValues } from "@/features/shared/schemas/profile";

type PublicProfileApi = {
  alias: string;
  avatar: string;
  avatarEmoji: string;
};

type ProfileApiPayload = {
  email: string;
  realName: string | null;
  phone: string | null;
  departmentTeam?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  onboardingCompletedAt?: string | null;
  status: string;
  canDrive: boolean;
  canRide: boolean;
  isAdmin: boolean;
  publicProfile: PublicProfileApi | null;
  passenger: {
    accessibilityNotes: string | null;
    usualCommuteDays?: number[];
    preferredMorningTime?: string | null;
    preferredEveningTime?: string | null;
    ridePreferences?: string | null;
  } | null;
  driver: {
    approvalStatus: string;
    vehicleMake: string | null;
    vehicleModel: string | null;
    vehicleColor: string | null;
    plateNumber: string | null;
    seatsTotal: number;
    detourToleranceMinutes: number;
    pickupRadiusMeters?: number | null;
    commuteNotes?: string | null;
  } | null;
};

export function toMeProfile(payload: ProfileApiPayload): MeProfile {
  const pub = payload.publicProfile;
  return {
    alias: pub?.alias ?? "anonymous",
    avatarEmoji: pub?.avatarEmoji ?? pub?.avatar ?? "·",
    bio: payload.passenger?.accessibilityNotes ?? "",
  };
}

/**
 * GET /api/v1/me/profile — `{ data: { profile } }`.
 */
export async function fetchMeProfile(): Promise<MeProfile> {
  const json = await apiGetJson("/api/v1/me/profile");
  const { profile } = unwrapData<{ profile: ProfileApiPayload }>(json);
  return toMeProfile(profile);
}

export type PatchMeAccountInput = {
  realName?: string | null;
  phone?: string | null;
  accessibilityNotes?: string | null;
  departmentTeam?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  /** Sets server `onboarding_completed_at` when true. */
  completeOnboarding?: boolean;
};

export type PatchMePublicInput = {
  alias?: string;
  avatar?: string;
};

/**
 * PATCH /api/v1/me/profile — `{ data: { profile } }`.
 */
export async function patchMeAccount(
  input: PatchMeAccountInput,
): Promise<MeProfile> {
  const json = await apiPatchJson("/api/v1/me/profile", input);
  const { profile } = unwrapData<{ profile: ProfileApiPayload }>(json);
  return toMeProfile(profile);
}

/**
 * PATCH /api/v1/me/public-profile — `{ data: { publicProfile } }` only.
 */
export async function patchMePublicProfile(
  input: PatchMePublicInput,
): Promise<void> {
  await apiPatchJson("/api/v1/me/public-profile", input);
}

/**
 * Saves the profile form: public identity first, then passenger notes (accessibility).
 * Returns the latest full profile from the account PATCH response.
 */
export async function saveMeProfileForm(
  values: ProfileFormValues,
): Promise<MeProfile> {
  await patchMePublicProfile({
    alias: values.alias,
    avatar: values.avatarEmoji,
  });
  return patchMeAccount({
    accessibilityNotes:
      values.bio?.trim() === "" || values.bio === undefined
        ? null
        : values.bio,
  });
}
