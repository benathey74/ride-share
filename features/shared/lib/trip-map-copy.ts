/**
 * Shared map / pickup wording for passenger + driver surfaces (alpha consistency).
 * Marker titles are passed to Google Maps `Marker.title` (tooltips).
 */

export const TRIP_MAP_MARKER = {
  routeStart: "Corridor start",
  destination: "End of corridor",
  confirmedPickup: "Your pickup (confirmed)",
} as const;

/** Section / card titles */
export const TRIP_MAP_SECTION = {
  /** Passenger booked trip detail — map card */
  passengerDriverRoute: "Corridor for this trip",
  /** Driver: trip request queue — map above request list */
  driverRouteThisTrip: "Your corridor for this trip",
} as const;

export const TRIP_PICKUP_LABEL = {
  approxEyebrow: "Approximate pickup",
  confirmedEyebrow: "Confirmed pickup",
} as const;

/** Single-row pickup UI when `pickup.exact` is exposed (e.g. driver after accept + saved coords). */
export function pickupEyebrowFromPickup(
  pickup: { exact?: { latitude?: string | null; longitude?: string | null } | null } | null | undefined,
): string {
  const e = pickup?.exact;
  if (e?.latitude != null && e?.longitude != null) {
    const lat = Number(e.latitude);
    const lng = Number(e.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return TRIP_PICKUP_LABEL.confirmedEyebrow;
    }
  }
  return TRIP_PICKUP_LABEL.approxEyebrow;
}

/** Passenger trip detail — map legend under title */
export function passengerBookedMapDescription(input: {
  hasPolyline: boolean;
  hasExactPickup: boolean;
}): string {
  const { hasPolyline, hasExactPickup } = input;
  if (hasPolyline) {
    return hasExactPickup
      ? "Teal: driver’s path · Green: start · Amber: destination · Blue marker: confirmed pickup point."
      : "Teal: driver’s path · Green: start · Amber: destination · Blue circle: your approximate pickup zone.";
  }
  return hasExactPickup
    ? "Straight line: route overview (no turn-by-turn stored). Blue marker: confirmed pickup point."
    : "Straight line: corridor overview. Blue circle: your approximate pickup zone.";
}

/** Driver trip requests — map legend */
export function driverTripRequestsMapDescription(hasPolyline: boolean): string {
  return hasPolyline
    ? "Teal: your published path · Green: start · Amber: destination. Cards below: each rider’s pickup (approx until you accept; confirmed pickup appears when available)."
    : "Straight line: route overview. Rider pickups are in the cards — approximate until you accept; confirmed pickup appears when available.";
}
