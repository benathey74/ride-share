import type { PublicProfile } from "@/types/profile";
import type { RouteMatchHint, RouteSuggestion } from "@/types/route";
import type {
  PassengerHomeResponse,
  PassengerMyTripRow,
  PassengerMyTripsOverview,
  PassengerTripDetail,
  TripInstanceStatus,
  TripRequest,
  TripRequestPickup,
  TripRequestStatus,
} from "@/types/trip";
import type { PassengerSearchRoutesFormValues } from "@/features/passenger/schemas/search-routes-form";
import {
  apiGetJson,
  apiPostJson,
  unwrapData,
} from "@/lib/api/client";

export function toPublicProfile(
  raw: { alias?: string; avatar?: string; avatarEmoji?: string } | null,
): PublicProfile | null {
  if (!raw?.alias) return null;
  return {
    alias: raw.alias,
    avatarEmoji: raw.avatarEmoji ?? raw.avatar ?? "·",
  };
}

function normalizeRouteStatus(raw: unknown): TripInstanceStatus {
  const s = String(raw ?? "scheduled").toLowerCase();
  if (
    s === "scheduled" ||
    s === "in_progress" ||
    s === "completed" ||
    s === "cancelled"
  ) {
    return s;
  }
  return "scheduled";
}

function normalizeWireDateOnly(raw: unknown): string {
  if (raw == null) return "";
  if (typeof raw === "string") return raw.slice(0, 10);
  return String(raw).slice(0, 10);
}

function normalizePassengerTripDetail(raw: unknown): PassengerTripDetail {
  const t = raw as Record<string, unknown>;
  const route = t.route as
    | {
        approximatePickupLabel?: string;
        originLat?: string;
        originLng?: string;
        destinationLat?: string;
        destinationLng?: string;
        pickupFuzzRadiusM?: number;
        routePolyline?: string | null;
        totalDistanceMeters?: number | null;
        totalDurationSeconds?: number | null;
      }
    | undefined;
  const requestsRaw = t.myRequests;
  const myRequests = Array.isArray(requestsRaw)
    ? requestsRaw.map((r) => mapWireTripRequest(r))
    : [];

  return {
    tripInstanceId: String(t.tripInstanceId ?? ""),
    routeStatus: normalizeRouteStatus(t.routeStatus),
    tripDate: normalizeWireDateOnly(t.tripDate),
    departureTime: String(t.departureTime ?? "").slice(0, 5),
    seatsTotal: Number(t.seatsTotal ?? 0),
    seatsRemaining: Number(t.seatsRemaining ?? 0),
    host: toPublicProfile(
      (t.host as Parameters<typeof toPublicProfile>[0]) ?? null,
    ),
    destinationLabel: String(t.destinationLabel ?? ""),
    route: {
      approximatePickupLabel: String(route?.approximatePickupLabel ?? ""),
      originLat: String(route?.originLat ?? ""),
      originLng: String(route?.originLng ?? ""),
      destinationLat: String(route?.destinationLat ?? ""),
      destinationLng: String(route?.destinationLng ?? ""),
      pickupFuzzRadiusM: Number(route?.pickupFuzzRadiusM ?? 400),
      routePolyline:
        route?.routePolyline === undefined || route?.routePolyline === null
          ? null
          : String(route.routePolyline),
      totalDistanceMeters:
        route?.totalDistanceMeters === undefined || route?.totalDistanceMeters === null
          ? null
          : Number(route.totalDistanceMeters),
      totalDurationSeconds:
        route?.totalDurationSeconds === undefined || route?.totalDurationSeconds === null
          ? null
          : Number(route.totalDurationSeconds),
    },
    myRequests,
  };
}

type RawRouteRow = {
  routeTemplateId?: string;
  name?: string;
  host?: { alias?: string; avatar?: string; avatarEmoji?: string } | null;
  departureWindowLabel?: string;
  pickupAreaLabel?: string;
  pickupFuzzRadiusM?: number;
  destinationLabel?: string;
  approxPickupLat?: string;
  approxPickupLng?: string;
  destinationLat?: string;
  destinationLng?: string;
  nextTripInstanceId?: string | null;
  routePolyline?: string | null;
  totalDistanceMeters?: number | null;
  totalDurationSeconds?: number | null;
  schedules?: { id: number; dayOfWeek: number; isActive: boolean }[];
  matchHints?: string[];
};

const MATCH_HINTS = new Set<string>(["corridor_pickup", "pickup_zone", "corridor_destination"]);

function toRouteMatchHints(raw: string[] | undefined): RouteMatchHint[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const out = raw.filter((h): h is RouteMatchHint => MATCH_HINTS.has(h));
  return out.length > 0 ? out : undefined;
}

function toRouteSuggestion(row: RawRouteRow): RouteSuggestion {
  return {
    routeTemplateId: String(row.routeTemplateId ?? ""),
    name: String(row.name ?? ""),
    host: toPublicProfile(row.host ?? null),
    departureWindowLabel: String(row.departureWindowLabel ?? ""),
    pickupAreaLabel: String(row.pickupAreaLabel ?? ""),
    pickupFuzzRadiusM: Number(row.pickupFuzzRadiusM ?? 400),
    destinationLabel: String(row.destinationLabel ?? ""),
    approxPickupLat: String(row.approxPickupLat ?? ""),
    approxPickupLng: String(row.approxPickupLng ?? ""),
    destinationLat: String(row.destinationLat ?? ""),
    destinationLng: String(row.destinationLng ?? ""),
    nextTripInstanceId:
      row.nextTripInstanceId === undefined || row.nextTripInstanceId === null
        ? null
        : String(row.nextTripInstanceId),
    routePolyline:
      row.routePolyline === undefined || row.routePolyline === null
        ? null
        : String(row.routePolyline),
    totalDistanceMeters:
      row.totalDistanceMeters === undefined || row.totalDistanceMeters === null
        ? null
        : Number(row.totalDistanceMeters),
    totalDurationSeconds:
      row.totalDurationSeconds === undefined || row.totalDurationSeconds === null
        ? null
        : Number(row.totalDurationSeconds),
    schedules: Array.isArray(row.schedules) ? row.schedules : undefined,
    matchHints: toRouteMatchHints(row.matchHints),
  };
}

function normalizePassengerHome(raw: unknown): PassengerHomeResponse {
  const h = raw as Partial<PassengerHomeResponse>;
  return {
    hero: {
      eyebrow: String(h.hero?.eyebrow ?? ""),
      titleLine1: String(h.hero?.titleLine1 ?? ""),
      titleLine2: String(h.hero?.titleLine2 ?? ""),
      subtitle: String(h.hero?.subtitle ?? ""),
    },
    searchSectionDescription: String(h.searchSectionDescription ?? ""),
    nextPickupSectionTitle: String(h.nextPickupSectionTitle ?? ""),
    routesSectionDescription: String(h.routesSectionDescription ?? ""),
    nextPickup: {
      tripInstanceId: String(h.nextPickup?.tripInstanceId ?? ""),
      statusLabel: String(h.nextPickup?.statusLabel ?? ""),
      pickupAreaLabel: String(h.nextPickup?.pickupAreaLabel ?? ""),
      pickupFuzzRadiusM: Number(h.nextPickup?.pickupFuzzRadiusM ?? 400),
      privacyFootnote: String(h.nextPickup?.privacyFootnote ?? ""),
    },
    nearbyRoutes: Array.isArray(h.nearbyRoutes)
      ? h.nearbyRoutes.map((r) => toRouteSuggestion(r as RawRouteRow))
      : [],
  };
}

function toPickup(raw: unknown): TripRequestPickup {
  const p = raw as TripRequestPickup & {
    approximateArea?: { latitude?: unknown; longitude?: unknown; radiusMeters?: unknown };
  };
  const areaLat = p?.approximateArea?.latitude;
  const areaLng = p?.approximateArea?.longitude;
  const areaR = p?.approximateArea?.radiusMeters;
  const approximateArea =
    areaLat != null &&
    areaLng != null &&
    String(areaLat).trim() !== "" &&
    String(areaLng).trim() !== ""
      ? {
          latitude: String(areaLat),
          longitude: String(areaLng),
          radiusMeters: Number(areaR) > 0 ? Number(areaR) : 400,
        }
      : undefined;

  return {
    approximateLabel: String(p?.approximateLabel ?? ""),
    ...(approximateArea ? { approximateArea } : {}),
    exact:
      p?.exact?.latitude != null && p?.exact?.longitude != null
        ? {
            latitude: String(p.exact.latitude),
            longitude: String(p.exact.longitude),
            label: p.exact.label ?? null,
          }
        : undefined,
  };
}

export function mapWireTripRequest(raw: unknown): TripRequest {
  const r = raw as Record<string, unknown>;
  return {
    id: String(r.id ?? ""),
    tripInstanceId: String(r.tripInstanceId ?? ""),
    status: String(r.status ?? "pending").toLowerCase() as TripRequestStatus,
    rider: toPublicProfile(
      (r.rider as { alias?: string; avatar?: string; avatarEmoji?: string } | null) ??
        null,
    ),
    pickup: toPickup(r.pickup),
    message: r.message === undefined || r.message === null ? null : String(r.message),
    createdAt:
      typeof r.createdAt === "string"
        ? r.createdAt
        : r.createdAt != null
          ? String(r.createdAt)
          : "",
    updatedAt:
      r.updatedAt === undefined || r.updatedAt === null
        ? null
        : typeof r.updatedAt === "string"
          ? r.updatedAt
          : String(r.updatedAt),
    respondedAt:
      r.respondedAt === undefined || r.respondedAt === null
        ? null
        : typeof r.respondedAt === "string"
          ? r.respondedAt
          : String(r.respondedAt),
  };
}

/**
 * GET /api/v1/passenger/home — `{ data: { home } }`.
 */
export async function fetchPassengerHome(): Promise<PassengerHomeResponse> {
  const json = await apiGetJson("/api/v1/passenger/home");
  const { home } = unwrapData<{ home: unknown }>(json);
  return normalizePassengerHome(home);
}

/** Structured search sent as GET query params (coordinates drive server-side corridor matching). */
export type PassengerRouteSearchParams = PassengerSearchRoutesFormValues;

export function passengerRouteSearchParamsFromForm(
  v: PassengerSearchRoutesFormValues,
): PassengerRouteSearchParams {
  return {
    pickupLabel: v.pickupLabel.trim(),
    pickupPlaceId: v.pickupPlaceId.trim(),
    destinationLabel: v.destinationLabel.trim(),
    destinationPlaceId: v.destinationPlaceId.trim(),
    pickupLat: v.pickupLat.trim(),
    pickupLng: v.pickupLng.trim(),
    destinationLat: v.destinationLat.trim(),
    destinationLng: v.destinationLng.trim(),
  };
}

/**
 * Builds the query string for GET /api/v1/passenger/routes/suggestions.
 * Labels and place IDs are included for forward-compatible logging/analytics on the server.
 */
export function buildPassengerRouteSuggestionsQueryString(
  search: PassengerRouteSearchParams,
): string {
  const p = new URLSearchParams();
  p.set("pickupLat", search.pickupLat);
  p.set("pickupLng", search.pickupLng);
  p.set("destinationLat", search.destinationLat);
  p.set("destinationLng", search.destinationLng);
  if (search.pickupLabel) p.set("pickupLabel", search.pickupLabel);
  if (search.destinationLabel) p.set("destinationLabel", search.destinationLabel);
  if (search.pickupPlaceId) p.set("pickupPlaceId", search.pickupPlaceId);
  if (search.destinationPlaceId) p.set("destinationPlaceId", search.destinationPlaceId);
  return p.toString();
}

/**
 * GET /api/v1/passenger/routes/suggestions — `{ data: { routes } }`.
 */
export async function fetchPassengerRouteSuggestions(
  search: PassengerRouteSearchParams,
): Promise<RouteSuggestion[]> {
  const qs = buildPassengerRouteSuggestionsQueryString(search);
  const json = await apiGetJson(
    `/api/v1/passenger/routes/suggestions?${qs}`,
  );
  const { routes } = unwrapData<{ routes: unknown[] }>(json);
  if (!Array.isArray(routes)) return [];
  return routes.map((r) => toRouteSuggestion(r as RawRouteRow));
}

/**
 * GET /api/v1/passenger/trips/:id — `{ data: { trip } }`.
 */
export async function fetchPassengerTripDetail(
  tripInstanceId: string,
): Promise<PassengerTripDetail> {
  const json = await apiGetJson(
    `/api/v1/passenger/trips/${encodeURIComponent(tripInstanceId)}`,
  );
  const { trip } = unwrapData<{ trip: unknown }>(json);
  return normalizePassengerTripDetail(trip);
}

function pickupSummaryFromPickupDto(
  pickup: TripRequestPickup,
  requestStatus: TripRequestStatus | null,
): { primary: string; sub?: string } {
  const approx = pickup.approximateLabel;
  if (pickup.exact) {
    const ex = pickup.exact;
    const primary =
      ex.label?.trim() ||
      `${ex.latitude}, ${ex.longitude}`;
    return { primary, sub: `Corridor: ${approx}` };
  }
  if (requestStatus === "pending") {
    return { primary: approx, sub: "Approximate until the driver accepts" };
  }
  return { primary: approx };
}

type WireMyTripOverviewRow = {
  key: string;
  tripInstanceId: string;
  tripRequestId: string | null;
  requestStatus: string | null;
  routeStatus: string;
  host: { alias?: string; avatar?: string; avatarEmoji?: string } | null;
  tripDate: string;
  departureTime: string;
  originLabel: string;
  destinationLabel: string;
  pickup: unknown;
  statusLabel: string;
};

function mapWireMyTripsOverviewRow(raw: unknown): PassengerMyTripRow {
  const w = raw as WireMyTripOverviewRow;
  const pickup = toPickup(w.pickup);
  const rsRaw = w.requestStatus != null ? String(w.requestStatus).toLowerCase() : null;
  const rs =
    rsRaw === "pending" ||
    rsRaw === "accepted" ||
    rsRaw === "declined" ||
    rsRaw === "cancelled"
      ? (rsRaw as TripRequestStatus)
      : null;
  const { primary, sub } = pickupSummaryFromPickupDto(pickup, rs);
  return {
    key: String(w.key ?? `${w.tripInstanceId}-${w.tripRequestId ?? "row"}`),
    tripInstanceId: String(w.tripInstanceId ?? ""),
    tripRequestId: w.tripRequestId != null ? String(w.tripRequestId) : null,
    requestStatus: rs,
    routeStatus: normalizeRouteStatus(w.routeStatus),
    driver: toPublicProfile(w.host ?? null),
    destinationLabel: String(w.destinationLabel ?? ""),
    pickupSummary: primary,
    pickupSubtext: sub,
    statusLabel: String(w.statusLabel ?? ""),
  };
}

/**
 * GET /api/v1/passenger/my-trips — `{ data: { pendingRequests, upcomingTrips, pastTrips } }`.
 */
export async function fetchPassengerMyTripsOverview(): Promise<PassengerMyTripsOverview> {
  const json = await apiGetJson("/api/v1/passenger/my-trips");
  const data = unwrapData<{
    pendingRequests: unknown[];
    upcomingTrips: unknown[];
    pastTrips: unknown[];
  }>(json);
  const mapRows = (rows: unknown[]) =>
    Array.isArray(rows) ? rows.map(mapWireMyTripsOverviewRow) : [];
  return {
    pendingRequests: mapRows(data.pendingRequests),
    upcomingTrips: mapRows(data.upcomingTrips),
    pastTrips: mapRows(data.pastTrips),
    derivedFrom: "dedicated-endpoint",
  };
}

export type CreatePassengerTripRequestInput = {
  tripInstanceId: number;
  approxPickupLabel: string;
  approxPickupLat: string;
  approxPickupLng: string;
  approxPickupRadiusMeters?: number;
  message?: string | null;
};

/**
 * POST /api/v1/passenger/trip-requests — `{ data: { tripRequest } }`.
 */
export async function createPassengerTripRequest(
  input: CreatePassengerTripRequestInput,
): Promise<TripRequest> {
  const json = await apiPostJson("/api/v1/passenger/trip-requests", {
    tripInstanceId: input.tripInstanceId,
    approxPickupLabel: input.approxPickupLabel,
    approxPickupLat: input.approxPickupLat,
    approxPickupLng: input.approxPickupLng,
    approxPickupRadiusMeters: input.approxPickupRadiusMeters,
    message: input.message ?? null,
  });
  const { tripRequest } = unwrapData<{ tripRequest: unknown }>(json);
  return mapWireTripRequest(tripRequest);
}
