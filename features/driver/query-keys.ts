export const driverKeys = {
  all: ["driver"] as const,
  dashboard: () => [...driverKeys.all, "dashboard"] as const,
  routeTemplates: () => [...driverKeys.all, "route-templates"] as const,
  tripRequests: (tripInstanceId: string) =>
    [...driverKeys.all, "trip", tripInstanceId, "requests"] as const,
};
