/**
 * Central route paths for the App Router (no API wiring).
 */
export const ROUTES = {
  /** Email + password sign-in (session cookie). */
  login: "/login",
  register: "/register",
  onboarding: {
    welcome: "/onboarding",
    profile: "/onboarding/profile",
    places: "/onboarding/places",
    passenger: "/onboarding/passenger",
    driver: "/onboarding/driver",
    finish: "/onboarding/finish",
    /** @deprecated Use `finish` — kept for bookmarks; page redirects. */
    driverPending: "/onboarding/driver/pending",
  },
  home: "/home",
  passengerSearch: "/search",
  /**
   * Deep-link from home “Your search” — search screen reads `routeTemplateId` + optional
   * `routeName` to highlight and scroll to the card after results load.
   */
  passengerSearchFocusRoute: (routeTemplateId: string, routeName: string) => {
    const q = new URLSearchParams();
    q.set("routeTemplateId", routeTemplateId);
    const trimmed = routeName.trim();
    if (trimmed) q.set("routeName", trimmed);
    return `/search?${q.toString()}`;
  },
  /** Passenger list: requests & trips (derived from home + detail for now) */
  passengerMyTrips: "/trips",
  /**
   * **Private** booked-trip screen (`/trips/[id]`). Only for riders who already have a seat request
   * or passenger row — otherwise the API returns 403. Do not use for home/search “browse” flows.
   */
  passengerPrivateTripDetail: (tripInstanceId: string) =>
    `/trips/${tripInstanceId}`,
  /**
   * **Public** ride overview (`/rides/[id]`). Safe for anyone onboarded; no booking required.
   * Use for home/search “View ride” and corridor discovery.
   */
  passengerPublicRide: (tripInstanceId: string) =>
    `/rides/${tripInstanceId}`,
  driverDashboard: "/dashboard",
  driverRoutes: "/routes",
  driverRoutesNew: "/routes/new",
  /** Driver seat-request queue for a trip instance */
  driverTripRequests: (tripInstanceId: string) =>
    `/trips/${tripInstanceId}/requests`,
  adminDashboard: "/admin",
  profile: "/profile",
} as const;

type OnboardingPaths = (typeof ROUTES.onboarding)[keyof typeof ROUTES.onboarding];

export type AppRoute =
  | OnboardingPaths
  | Exclude<
      (typeof ROUTES)[keyof typeof ROUTES],
      ((...args: unknown[]) => unknown) | typeof ROUTES.onboarding
    >;
