import type { PublicProfile } from "@/types/profile";
import type { RouteSuggestion } from "@/types/route";

export type TripInstanceStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export type TripRequestStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "cancelled";

export type TripInstance = {
  id: string;
  routeTemplateId: string | null;
  hostUserId: string;
  scheduledStart: string;
  status: TripInstanceStatus;
  pickupAreaLabel: string;
  pickupFuzzRadiusM: number;
  destinationLabel: string;
  seatsOffered: number;
};

/** Privacy-safe pickup block from the API. */
export type TripRequestPickup = {
  approximateLabel: string;
  /** Rider’s fuzz center + radius for maps (same privacy tier as approximateLabel). */
  approximateArea?: {
    latitude: string;
    longitude: string;
    radiusMeters: number;
  };
  exact?: {
    latitude: string;
    longitude: string;
    label?: string | null;
  };
};

/**
 * Seat request row (API / `PrivacyViewService` shape). Mapping in feature `api.ts` files.
 */
export type TripRequest = {
  id: string;
  tripInstanceId: string;
  status: TripRequestStatus;
  rider: PublicProfile | null;
  pickup: TripRequestPickup;
  message: string | null;
  createdAt: string;
  updatedAt: string | null;
  respondedAt: string | null;
};

export type PassengerHomeHero = {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
};

/**
 * Normalized passenger home payload (same shape the UI consumes).
 * Wire envelope: `{ data: { home: PassengerHomeResponse } }`.
 */
export type PassengerHomeResponse = {
  hero: PassengerHomeHero;
  searchSectionDescription: string;
  nextPickupSectionTitle: string;
  routesSectionDescription: string;
  nextPickup: {
    tripInstanceId: string;
    statusLabel: string;
    pickupAreaLabel: string;
    pickupFuzzRadiusM: number;
    privacyFootnote: string;
  };
  nearbyRoutes: RouteSuggestion[];
};

/** @deprecated Use `PassengerHomeResponse` — kept for gradual refactors */
export type PassengerHomeData = PassengerHomeResponse;

/**
 * Public browse payload (`GET /api/v1/passenger/public-trips/:id`).
 * Template-level corridor + timing only; never exact rider pickup or other riders’ data.
 */
export type PassengerRideBrowse = {
  tripInstanceId: string;
  routeStatus: TripInstanceStatus;
  tripDate: string;
  departureTime: string;
  seatsTotal: number;
  seatsRemaining: number;
  host: PublicProfile | null;
  destinationLabel: string;
  route: PassengerTripDetail["route"];
  canRequestSeat: boolean;
  viewerIsDriver: boolean;
  viewerMayOpenPrivateDetail: boolean;
  viewerSeatRequestStatus: TripRequestStatus | null;
  seatRequestDefaults: {
    approxPickupLabel: string;
    approxPickupLat: string;
    approxPickupLng: string;
    approxPickupRadiusMeters: number;
  };
};

/**
 * Normalized passenger trip detail (`GET /api/v1/passenger/trips/:id`).
 * Pickup privacy per `myRequests[].pickup` follows backend `PrivacyViewService`.
 */
export type PassengerTripDetail = {
  tripInstanceId: string;
  routeStatus: TripInstanceStatus;
  tripDate: string;
  departureTime: string;
  seatsTotal: number;
  seatsRemaining: number;
  host: PublicProfile | null;
  destinationLabel: string;
  route: {
    approximatePickupLabel: string;
    /** Template corridor — not the rider’s exact pin. */
    originLat: string;
    originLng: string;
    destinationLat: string;
    destinationLng: string;
    pickupFuzzRadiusM: number;
    /** Instance polyline preferred over template when both exist. */
    routePolyline?: string | null;
    totalDistanceMeters?: number | null;
    totalDurationSeconds?: number | null;
  };
  myRequests: TripRequest[];
};

/** Single row on My Trips (list view; pickup obeys request status + privacy). */
export type PassengerMyTripRow = {
  key: string;
  tripInstanceId: string;
  tripRequestId: string | null;
  requestStatus: TripRequestStatus | null;
  routeStatus: TripInstanceStatus;
  driver: PublicProfile | null;
  destinationLabel: string;
  pickupSummary: string;
  pickupSubtext?: string;
  statusLabel: string;
};

export type PassengerMyTripsDerivedSource =
  | "home-only"
  | "home-and-trip-detail"
  | "dedicated-endpoint";

/**
 * Rider overview from `GET /api/v1/passenger/my-trips` (preferred) or legacy home+detail derivation.
 */
export type PassengerMyTripsOverview = {
  pendingRequests: PassengerMyTripRow[];
  upcomingTrips: PassengerMyTripRow[];
  pastTrips: PassengerMyTripRow[];
  derivedFrom: PassengerMyTripsDerivedSource;
};
