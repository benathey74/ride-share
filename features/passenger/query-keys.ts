import type { PassengerSearchRoutesFormValues } from "@/features/passenger/schemas/search-routes-form";

export const passengerKeys = {
  all: ["passenger"] as const,
  home: () => [...passengerKeys.all, "home"] as const,
  /** Prefix for invalidating every cached route-suggestion query. */
  routesPrefix: () => [...passengerKeys.all, "routes"] as const,
  routes: (search: PassengerSearchRoutesFormValues | null) =>
    search === null
      ? ([...passengerKeys.all, "routes", "suggestions", "idle"] as const)
      : ([
          ...passengerKeys.all,
          "routes",
          "suggestions",
          {
            pickupLat: search.pickupLat,
            pickupLng: search.pickupLng,
            destinationLat: search.destinationLat,
            destinationLng: search.destinationLng,
            pickupPlaceId: search.pickupPlaceId,
            destinationPlaceId: search.destinationPlaceId,
          },
        ] as const),
  tripDetail: (tripInstanceId: string) =>
    [...passengerKeys.all, "trip", tripInstanceId] as const,
  myTrips: () => [...passengerKeys.all, "my-trips"] as const,
};
