"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  acceptDriverTripRequest,
  createDriverRouteTemplate,
  declineDriverTripRequest,
  fetchDriverDashboard,
  fetchDriverRouteTemplates,
  fetchDriverTripRequests,
} from "@/features/driver/api";
import { driverKeys } from "@/features/driver/query-keys";
import { passengerKeys } from "@/features/passenger/query-keys";
import { tripChatKeys } from "@/features/trip-chat/query-keys";
import type { CreateDriverRouteTemplateInput } from "@/types/driver";

export function useDriverDashboardQuery() {
  return useQuery({
    queryKey: driverKeys.dashboard(),
    queryFn: fetchDriverDashboard,
    staleTime: 20 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useDriverRouteTemplatesQuery() {
  return useQuery({
    queryKey: driverKeys.routeTemplates(),
    queryFn: fetchDriverRouteTemplates,
  });
}

export function useCreateDriverRouteTemplateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDriverRouteTemplateInput) =>
      createDriverRouteTemplate(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: driverKeys.routeTemplates() }),
        queryClient.invalidateQueries({ queryKey: driverKeys.dashboard() }),
        queryClient.invalidateQueries({ queryKey: passengerKeys.routesPrefix() }),
        queryClient.invalidateQueries({ queryKey: passengerKeys.home() }),
      ]);
    },
  });
}

export function useDriverTripRequestsQuery(tripInstanceId: string) {
  return useQuery({
    queryKey: driverKeys.tripRequests(tripInstanceId),
    queryFn: () => fetchDriverTripRequests(tripInstanceId),
    enabled: Boolean(tripInstanceId),
  });
}

export function useAcceptDriverTripRequestMutation(tripInstanceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tripRequestId: string) =>
      acceptDriverTripRequest(tripRequestId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: driverKeys.dashboard() }),
        queryClient.invalidateQueries({
          queryKey: driverKeys.tripRequests(tripInstanceId),
        }),
        queryClient.invalidateQueries({
          queryKey: tripChatKeys.messages(tripInstanceId),
        }),
        // Rider’s trip detail, My trips, and home read seat-request state from passenger APIs.
        queryClient.invalidateQueries({ queryKey: passengerKeys.all }),
      ]);
    },
  });
}

export function useDeclineDriverTripRequestMutation(tripInstanceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tripRequestId: string) =>
      declineDriverTripRequest(tripRequestId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: driverKeys.dashboard() }),
        queryClient.invalidateQueries({
          queryKey: driverKeys.tripRequests(tripInstanceId),
        }),
        queryClient.invalidateQueries({ queryKey: passengerKeys.all }),
      ]);
    },
  });
}
