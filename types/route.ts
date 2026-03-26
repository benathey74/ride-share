import type { PublicProfile } from "@/types/profile";

/**
 * Route template (scheduled pattern / corridor). Coordinates stay server-side when wired.
 */
export type RouteTemplate = {
  id: string;
  name: string;
  description?: string | null;
  hostUserId: string;
  host: PublicProfile | null;
  pickupAreaLabel: string;
  pickupFuzzRadiusM: number;
  destinationLabel: string;
  seatsDefault: number;
};

export type RouteTemplateScheduleRow = {
  id: number;
  dayOfWeek: number;
  isActive: boolean;
};

/** Server keys; map to labels in UI. */
export type RouteMatchHint = "corridor_pickup" | "pickup_zone" | "corridor_destination";

export const ROUTE_MATCH_HINT_LABELS: Record<RouteMatchHint, string> = {
  corridor_pickup: "Close to your pickup",
  pickup_zone: "Within pickup zone",
  corridor_destination: "Near route destination",
};

/**
 * Passenger-facing suggestion row (API-normalized). Mapping lives in `features/passenger/api.ts`.
 */
export type RouteSuggestion = {
  routeTemplateId: string;
  name: string;
  host: PublicProfile | null;
  /** Pre-formatted window, e.g. "Recurring · 17:10" */
  departureWindowLabel: string;
  pickupAreaLabel: string;
  pickupFuzzRadiusM: number;
  destinationLabel: string;
  /** Corridor center for approximate seat-request pins (privacy-safe). */
  approxPickupLat: string;
  approxPickupLng: string;
  /** Corridor destination anchor (published route; same visibility as origin). */
  destinationLat: string;
  destinationLng: string;
  /** Next bookable trip instance for this template, if any. */
  nextTripInstanceId: string | null;
  /** Driving corridor polyline (encoded); null until template created with server Directions key. */
  routePolyline?: string | null;
  totalDistanceMeters?: number | null;
  totalDurationSeconds?: number | null;
  schedules?: RouteTemplateScheduleRow[];
  /** Present when search coords were sent; relative to rider search only. */
  matchHints?: RouteMatchHint[];
};
