export type DriverQuickActionId =
  | "startTrip"
  | "shareEta"
  | "route"
  | "message";

export type DriverQuickAction = {
  id: DriverQuickActionId;
  label: string;
  /** Tailwind utility fragment for icon chip background/text */
  toneClass: string;
};

export type DriverDashboardStatusTone = "default" | "secondary" | "outline" | "accent";

export type DriverDashboardSummary = {
  dayLabel: string;
  statusBadgeLabel: string;
  /** Short “what happens next” line under the dashboard status chip. */
  statusHelper: string;
  statusTone: DriverDashboardStatusTone;
  bodyText: string;
  nextTripPreviewLabel: string;
};

export type DriverTodayTripRow = {
  id: string;
  tripDate: string;
  departureTime: string;
  routeStatus: string;
  seatsTotal: number;
  seatsRemaining: number;
  destinationLabel: string;
};

/** Pending seat request row from driver dashboard (links to trip request queue). */
export type DriverPendingSeatRequestRow = {
  id: string;
  tripInstanceId: string;
  destinationLabel: string;
  /** Public alias for the rider */
  riderLabel: string;
};

/** Passenger interest when a corridor matched search but no bookable trip yet (not trip chat). */
export type DriverCorridorInterestRow = {
  id: string;
  routeTemplateId: string;
  corridorLabel: string;
  riderLabel: string;
  messagePreview: string | null;
  updatedAt: string;
};

export type DriverDashboardData = {
  summary: DriverDashboardSummary;
  quickActions: DriverQuickAction[];
  todaysTrips: DriverTodayTripRow[];
  pendingSeatRequests: DriverPendingSeatRequestRow[];
  corridorInterests: DriverCorridorInterestRow[];
};

/**
 * Raw `dashboard` object inside `{ data: { dashboard } }` before UI mapping.
 */
export type DriverDashboardResponse = {
  summary: {
    tripsToday: number;
    seatsOffered: number;
    acceptedPassengersToday: number;
  };
  todaysTrips: Array<{
    id: string;
    tripDate?: string;
    departureTime?: string;
    routeStatus?: string;
    seatsTotal?: number;
    seatsRemaining?: number;
    destinationLabel?: string;
  }>;
  pendingRequests: Array<{
    id: string;
    tripInstanceId?: string;
    status?: string;
    destinationLabel?: string;
    rider?: { alias?: string; avatar?: string; avatarEmoji?: string } | null;
  }>;
  corridorInterests?: Array<{
    id?: string;
    routeTemplateId?: string;
    corridorLabel?: string;
    rider?: { alias?: string; avatar?: string; avatarEmoji?: string } | null;
    message?: string | null;
    updatedAt?: string;
  }>;
};

export type DriverRouteTemplateSchedule = {
  id: string;
  dayOfWeek: number;
  isActive: boolean;
};

export type DriverRouteTemplate = {
  id: string;
  originLabel: string;
  destinationLabel: string;
  originPlaceId: string | null;
  destinationPlaceId: string | null;
  originLat: string;
  originLng: string;
  destinationLat: string;
  destinationLng: string;
  scheduleType: string;
  departureTime: string;
  seatsTotal: number;
  detourToleranceMinutes: number;
  pickupRadiusMeters: number | null;
  status: string;
  /** Encoded driving path when Directions API ran at create time. */
  routePolyline?: string | null;
  totalDistanceMeters?: number | null;
  totalDurationSeconds?: number | null;
  schedules: DriverRouteTemplateSchedule[];
};

/** POST /api/v1/driver/route-templates body (matches Vine validator). */
export type CreateDriverRouteTemplateInput = {
  originLabel: string;
  destinationLabel: string;
  originPlaceId?: string | null;
  destinationPlaceId?: string | null;
  originLat: string;
  originLng: string;
  destinationLat: string;
  destinationLng: string;
  scheduleType: string;
  departureTime: string;
  seatsTotal?: number;
  detourToleranceMinutes?: number;
  pickupRadiusMeters?: number;
  status?: string;
  schedules?: { dayOfWeek: number; isActive?: boolean }[];
};
