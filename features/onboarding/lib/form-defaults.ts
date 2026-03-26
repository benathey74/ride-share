import type { OnboardingSnapshot } from "../types";

/** HTML `type="time"` expects HH:MM; API may return HH:MM:SS. */
export function normalizeTimeHm(v: string | null | undefined, fallback: string): string {
  const s = (v ?? fallback).trim();
  return s.length >= 5 ? s.slice(0, 5) : fallback;
}

export function profileFormDefaultsFromSnapshot(s: OnboardingSnapshot) {
  const pub = s.publicProfile;
  const acc = s.account;
  return {
    alias: pub?.alias ?? "",
    avatarEmoji: pub?.avatarEmoji ?? pub?.avatar ?? "",
    departmentTeam: acc.departmentTeam ?? "",
    emergencyContactName: acc.emergencyContactName ?? "",
    emergencyContactPhone: acc.emergencyContactPhone ?? "",
  };
}

export function placesFormDefaultsFromSnapshot(s: OnboardingSnapshot) {
  const home = s.savedPlaces.find((p) => p.kind === "home");
  const work = s.savedPlaces.find((p) => p.kind === "work");
  return {
    homeLabel: home?.label ?? "",
    homePlaceId: home?.placeId ?? "",
    homeLat: home?.lat ?? "",
    homeLng: home?.lng ?? "",
    workLabel: work?.label ?? "",
    workPlaceId: work?.placeId ?? "",
    workLat: work?.lat ?? "",
    workLng: work?.lng ?? "",
  };
}

export function passengerFormDefaultsFromSnapshot(s: OnboardingSnapshot) {
  const p = s.passenger;
  const days = p?.usualCommuteDays?.length ? p.usualCommuteDays : [1, 2, 3, 4, 5];
  return {
    commuteDays: days,
    preferredMorningTime: normalizeTimeHm(p?.preferredMorningTime, "08:00"),
    preferredEveningTime: normalizeTimeHm(p?.preferredEveningTime, "17:30"),
    ridePreferences: p?.ridePreferences ?? "",
  };
}

export function driverFormDefaultsFromSnapshot(s: OnboardingSnapshot) {
  const d = s.driver;
  return {
    vehicleMake: d?.vehicleMake ?? "",
    vehicleModel: d?.vehicleModel ?? "",
    vehicleColor: d?.vehicleColor ?? "",
    plateNumber: d?.plateNumber ?? "",
    seatsTotal: d?.seatsTotal ?? 4,
    detourToleranceMinutes: d?.detourToleranceMinutes ?? 10,
    pickupRadiusMeters: d?.pickupRadiusMeters ?? 400,
    commuteNotes: d?.commuteNotes ?? "",
  };
}
