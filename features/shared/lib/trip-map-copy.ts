/**
 * Shared map / pickup wording for passenger + driver surfaces (alpha consistency).
 * Marker titles are passed to Google Maps `Marker.title` (tooltips).
 */

export const TRIP_MAP_MARKER = {
  routeStart: "Route start",
  destination: "Destination",
  confirmedPickup: "Confirmed pickup",
} as const;

/** Section / card titles */
export const TRIP_MAP_SECTION = {
  /** Passenger booked trip detail — map card */
  passengerDriverRoute: "Your driver's route",
  /** Driver: trip request queue — map above request list */
  driverRouteThisTrip: "Route for this trip",
} as const;

export const TRIP_PICKUP_LABEL = {
  approxEyebrow: "Approx pickup area",
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
      ? "Teal line: their published driving path. Green: route start · Amber: destination · Blue pin: your confirmed pickup."
      : "Teal line: their published driving path. Green: route start · Amber: destination · Blue circle: your approx pickup area.";
  }
  return hasExactPickup
    ? "Straight line: simple corridor link (detailed path not stored). Blue pin: your confirmed pickup."
    : "Straight line: simple corridor link (detailed path not stored). Blue circle: your approx pickup area.";
}

/** Driver trip requests — map legend */
export function driverTripRequestsMapDescription(hasPolyline: boolean): string {
  return hasPolyline
    ? "Teal line: the route you published. Green: start · Amber: destination. Each card shows that rider’s pickup (approx until you accept, then confirmed when saved)."
    : "Straight line: start-to-end estimate (no detailed path stored). Each rider’s pickup is in the cards below.";
}
