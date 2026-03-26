"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPassengerTripRequest,
  expressPassengerCorridorInterest,
  fetchPassengerHome,
  fetchPassengerMyTripsOverview,
  fetchPassengerRouteSuggestions,
  fetchPassengerRideBrowse,
  fetchPassengerTripDetail,
  type CreatePassengerTripRequestInput,
  type PassengerRouteSearchParams,
} from "@/features/passenger/api";
import { passengerKeys } from "@/features/passenger/query-keys";

export function usePassengerMyTripsOverviewQuery() {
  return useQuery({
    queryKey: passengerKeys.myTrips(),
    queryFn: fetchPassengerMyTripsOverview,
    staleTime: 15 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function usePassengerTripDetailQuery(tripInstanceId: string) {
  return useQuery({
    queryKey: passengerKeys.tripDetail(tripInstanceId),
    queryFn: () => fetchPassengerTripDetail(tripInstanceId),
    enabled: Boolean(tripInstanceId.trim()),
    staleTime: 15 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function usePassengerRideBrowseQuery(tripInstanceId: string) {
  return useQuery({
    queryKey: passengerKeys.rideBrowse(tripInstanceId),
    queryFn: () => fetchPassengerRideBrowse(tripInstanceId),
    enabled: Boolean(tripInstanceId.trim()),
    staleTime: 15 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function usePassengerHomeQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: passengerKeys.home(),
    queryFn: fetchPassengerHome,
    enabled: options?.enabled ?? true,
  });
}

export function usePassengerRouteSuggestionsQuery(
  search: PassengerRouteSearchParams | null,
) {
  return useQuery({
    queryKey: passengerKeys.routes(search),
    queryFn: () => fetchPassengerRouteSuggestions(search!),
    enabled: search !== null,
  });
}

export function useCreatePassengerTripRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePassengerTripRequestInput) =>
      createPassengerTripRequest(input),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: passengerKeys.all });
      await queryClient.invalidateQueries({
        queryKey: passengerKeys.tripDetail(String(variables.tripInstanceId)),
      });
      await queryClient.invalidateQueries({
        queryKey: passengerKeys.rideBrowse(String(variables.tripInstanceId)),
      });
      await queryClient.invalidateQueries({ queryKey: passengerKeys.myTrips() });
    },
  });
}

export function useExpressCorridorInterestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { routeTemplateId: string; message: string | null }) =>
      expressPassengerCorridorInterest(vars.routeTemplateId, vars.message),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: passengerKeys.routesPrefix() });
    },
  });
}
