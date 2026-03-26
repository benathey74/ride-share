import type {
  CreateDriverRouteTemplateInput,
  DriverDashboardData,
  DriverDashboardResponse,
  DriverQuickAction,
  DriverRouteTemplate,
  DriverRouteTemplateSchedule,
  DriverTodayTripRow,
} from "@/types/driver";
import type { TripRequest } from "@/types/trip";
import {
  driverDashboardStatusPresentation,
  driverDashboardStatusSlot,
} from "@/features/shared/lib/status-presentation";
import {
  apiGetJson,
  apiPostJson,
  unwrapData,
} from "@/lib/api/client";
import { mapWireTripRequest } from "@/features/passenger/api";

const QUICK_ACTIONS: DriverQuickAction[] = [
  {
    id: "startTrip",
    label: "Start trip",
    toneClass: "bg-primary/12 text-primary",
  },
  {
    id: "shareEta",
    label: "Share ETA",
    toneClass: "bg-secondary/12 text-secondary",
  },
  {
    id: "route",
    label: "Route",
    toneClass: "bg-accent/15 text-amber-900",
  },
  {
    id: "message",
    label: "Message",
    toneClass: "bg-primary/10 text-primary",
  },
];

function mapTodayTripRow(
  row: DriverDashboardResponse["todaysTrips"][number],
): DriverTodayTripRow {
  const tripDate =
    typeof row.tripDate === "string"
      ? row.tripDate
      : row.tripDate != null
        ? String(row.tripDate).slice(0, 10)
        : "";
  return {
    id: String(row.id ?? ""),
    tripDate,
    departureTime: String(row.departureTime ?? ""),
    routeStatus: String(row.routeStatus ?? ""),
    seatsTotal: Number(row.seatsTotal ?? 0),
    seatsRemaining: Number(row.seatsRemaining ?? 0),
    destinationLabel: String(row.destinationLabel ?? ""),
  };
}

export function mapDriverDashboard(api: DriverDashboardResponse): DriverDashboardData {
  const { summary, todaysTrips, pendingRequests } = api;
  const next = todaysTrips[0];
  const pendingCount = pendingRequests.length;

  const bodyParts = [
    `${summary.tripsToday} trip${summary.tripsToday === 1 ? "" : "s"} today`,
    `${summary.seatsOffered} seat${summary.seatsOffered === 1 ? "" : "s"} offered`,
    `${summary.acceptedPassengersToday} accepted rider${
      summary.acceptedPassengersToday === 1 ? "" : "s"
    }`,
  ];
  if (pendingCount > 0) {
    bodyParts.push(`${pendingCount} pending request${pendingCount === 1 ? "" : "s"}`);
  }

  let nextTripPreviewLabel = "No trips scheduled today";
  if (next) {
    const time = (next.departureTime ?? "").slice(0, 5);
    const dest = next.destinationLabel ?? "Trip";
    const date = next.tripDate ? String(next.tripDate).slice(0, 10) : "";
    nextTripPreviewLabel = date
      ? `${dest} · ${date}${time ? ` · ${time}` : ""}`
      : `${dest}${time ? ` · ${time}` : ""}`;
  }

  const slot = driverDashboardStatusSlot(pendingCount, summary.tripsToday);
  const statusPres = driverDashboardStatusPresentation(slot);

  const pendingSeatRequests = (pendingRequests ?? [])
    .map((r) => ({
      id: String(r.id ?? ""),
      tripInstanceId: String(r.tripInstanceId ?? ""),
      destinationLabel: String(r.destinationLabel ?? "Trip"),
      riderLabel: String(r.rider?.alias ?? "Rider"),
    }))
    .filter((r) => r.id.length > 0 && r.tripInstanceId.length > 0);

  return {
    summary: {
      dayLabel: "Today",
      statusBadgeLabel: statusPres.label,
      statusHelper: statusPres.helper,
      statusTone: statusPres.tone,
      bodyText: bodyParts.join(" · "),
      nextTripPreviewLabel,
    },
    quickActions: QUICK_ACTIONS,
    todaysTrips: todaysTrips.map(mapTodayTripRow),
    pendingSeatRequests,
  };
}

/**
 * GET /api/v1/driver/dashboard — `{ data: { dashboard } }`.
 */
export async function fetchDriverDashboard(): Promise<DriverDashboardData> {
  const json = await apiGetJson("/api/v1/driver/dashboard");
  const { dashboard } = unwrapData<{ dashboard: DriverDashboardResponse }>(json);
  return mapDriverDashboard(dashboard);
}

export type DriverTripRouteSummary = {
  originLat: string;
  originLng: string;
  destinationLat: string;
  destinationLng: string;
  routePolyline: string | null;
  pickupFuzzRadiusM: number;
};

export type DriverTripRequestsPayload = {
  tripInstanceId: string;
  tripRoute: DriverTripRouteSummary;
  requests: TripRequest[];
};

/**
 * GET /api/v1/driver/trip-instances/:id/requests
 */
function mapTripRoute(raw: unknown): DriverTripRouteSummary {
  const r = raw as Record<string, unknown>;
  const poly = r.routePolyline;
  return {
    originLat: String(r.originLat ?? ""),
    originLng: String(r.originLng ?? ""),
    destinationLat: String(r.destinationLat ?? ""),
    destinationLng: String(r.destinationLng ?? ""),
    routePolyline:
      poly === undefined || poly === null || poly === "" ? null : String(poly),
    pickupFuzzRadiusM: Number(r.pickupFuzzRadiusM ?? 400),
  };
}

export async function fetchDriverTripRequests(
  tripInstanceId: string,
): Promise<DriverTripRequestsPayload> {
  const json = await apiGetJson(
    `/api/v1/driver/trip-instances/${encodeURIComponent(tripInstanceId)}/requests`,
  );
  const data = unwrapData<{
    tripInstanceId: string;
    tripRoute?: unknown;
    requests: unknown[];
  }>(json);
  const tripRoute =
    data.tripRoute != null
      ? mapTripRoute(data.tripRoute)
      : {
          originLat: "",
          originLng: "",
          destinationLat: "",
          destinationLng: "",
          routePolyline: null,
          pickupFuzzRadiusM: 400,
        };
  return {
    tripInstanceId: String(data.tripInstanceId),
    tripRoute,
    requests: Array.isArray(data.requests)
      ? data.requests.map((r) => mapWireTripRequest(r))
      : [],
  };
}

/**
 * POST /api/v1/driver/trip-requests/:id/accept
 */
export async function acceptDriverTripRequest(
  tripRequestId: string,
): Promise<TripRequest> {
  const json = await apiPostJson(
    `/api/v1/driver/trip-requests/${encodeURIComponent(tripRequestId)}/accept`,
    {},
  );
  const { tripRequest } = unwrapData<{ tripRequest: unknown }>(json);
  return mapWireTripRequest(tripRequest);
}

/**
 * POST /api/v1/driver/trip-requests/:id/decline
 */
export async function declineDriverTripRequest(
  tripRequestId: string,
): Promise<TripRequest> {
  const json = await apiPostJson(
    `/api/v1/driver/trip-requests/${encodeURIComponent(tripRequestId)}/decline`,
    {},
  );
  const { tripRequest } = unwrapData<{ tripRequest: unknown }>(json);
  return mapWireTripRequest(tripRequest);
}

function mapWireSchedule(raw: unknown): DriverRouteTemplateSchedule {
  const s = raw as Record<string, unknown>;
  return {
    id: String(s.id ?? ""),
    dayOfWeek: Number(s.dayOfWeek ?? 0),
    isActive: Boolean(s.isActive ?? true),
  };
}

export function mapWireRouteTemplate(raw: unknown): DriverRouteTemplate {
  const t = raw as Record<string, unknown>;
  const schedulesRaw = t.schedules;
  const pr = t.pickupRadiusMeters;
  return {
    id: String(t.id ?? ""),
    originLabel: String(t.originLabel ?? ""),
    destinationLabel: String(t.destinationLabel ?? ""),
    originPlaceId:
      t.originPlaceId === undefined || t.originPlaceId === null
        ? null
        : String(t.originPlaceId),
    destinationPlaceId:
      t.destinationPlaceId === undefined || t.destinationPlaceId === null
        ? null
        : String(t.destinationPlaceId),
    originLat: String(t.originLat ?? ""),
    originLng: String(t.originLng ?? ""),
    destinationLat: String(t.destinationLat ?? ""),
    destinationLng: String(t.destinationLng ?? ""),
    scheduleType: String(t.scheduleType ?? ""),
    departureTime: String(t.departureTime ?? "").slice(0, 5),
    seatsTotal: Number(t.seatsTotal ?? 0),
    detourToleranceMinutes: Number(t.detourToleranceMinutes ?? 0),
    pickupRadiusMeters:
      pr === undefined || pr === null || pr === ""
        ? null
        : Number(pr),
    routePolyline:
      t.routePolyline === undefined || t.routePolyline === null
        ? null
        : String(t.routePolyline),
    totalDistanceMeters:
      t.totalDistanceMeters === undefined || t.totalDistanceMeters === null
        ? null
        : Number(t.totalDistanceMeters),
    totalDurationSeconds:
      t.totalDurationSeconds === undefined || t.totalDurationSeconds === null
        ? null
        : Number(t.totalDurationSeconds),
    status: String(t.status ?? ""),
    schedules: Array.isArray(schedulesRaw)
      ? schedulesRaw.map(mapWireSchedule)
      : [],
  };
}

/**
 * GET /api/v1/driver/route-templates — `{ data: { templates } }`.
 */
export async function fetchDriverRouteTemplates(): Promise<DriverRouteTemplate[]> {
  const json = await apiGetJson("/api/v1/driver/route-templates");
  const { templates } = unwrapData<{ templates: unknown[] }>(json);
  if (!Array.isArray(templates)) return [];
  return templates.map(mapWireRouteTemplate);
}

function buildCreateRouteBody(input: CreateDriverRouteTemplateInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    originLabel: input.originLabel,
    destinationLabel: input.destinationLabel,
    originLat: input.originLat,
    originLng: input.originLng,
    destinationLat: input.destinationLat,
    destinationLng: input.destinationLng,
    scheduleType: input.scheduleType,
    departureTime: input.departureTime,
    seatsTotal: input.seatsTotal,
    detourToleranceMinutes: input.detourToleranceMinutes,
  };
  if (input.originPlaceId) body.originPlaceId = input.originPlaceId;
  if (input.destinationPlaceId) body.destinationPlaceId = input.destinationPlaceId;
  if (input.pickupRadiusMeters !== undefined) {
    body.pickupRadiusMeters = input.pickupRadiusMeters;
  }
  if (input.status !== undefined) body.status = input.status;
  if (input.schedules !== undefined && input.schedules.length > 0) {
    body.schedules = input.schedules;
  }
  return body;
}

/**
 * POST /api/v1/driver/route-templates — `{ data: { template } }`.
 */
export async function createDriverRouteTemplate(
  input: CreateDriverRouteTemplateInput,
): Promise<DriverRouteTemplate> {
  const json = await apiPostJson(
    "/api/v1/driver/route-templates",
    buildCreateRouteBody(input),
  );
  const { template } = unwrapData<{ template: unknown }>(json);
  return mapWireRouteTemplate(template);
}
