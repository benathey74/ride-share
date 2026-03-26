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
  /** Passenger list: requests & trips (derived from home + detail for now) */
  passengerMyTrips: "/trips",
  /** Passenger trip detail (rider view for a trip instance) */
  passengerTripDetail: (tripInstanceId: string) =>
    `/trips/${tripInstanceId}`,
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
