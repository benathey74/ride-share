"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileKeys } from "@/features/shared/query-keys";
import {
  fetchOnboardingSnapshot,
  isApiConfigured,
  patchMeProfile,
  patchMePublicProfile,
  putDriverProfile,
  putPassengerProfile,
  putSavedPlaces,
  type PatchMeProfileBody,
  type PutDriverProfileBody,
  type PutPassengerProfileBody,
} from "./api";
import { onboardingKeys } from "./query-keys";
import type { SavedPlacePutItem } from "./types";

export function useOnboardingSnapshotQuery(options?: { enabled?: boolean }) {
  const configured = isApiConfigured();
  return useQuery({
    queryKey: onboardingKeys.snapshot(),
    queryFn: () => fetchOnboardingSnapshot(),
    enabled: configured && (options?.enabled ?? true),
    staleTime: 30 * 1000,
    retry: 1,
  });
}

export function useInvalidateOnboarding() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: onboardingKeys.snapshot() });
    void qc.invalidateQueries({ queryKey: profileKeys.me() });
  };
}

export function usePatchMePublicProfileMutation() {
  const invalidate = useInvalidateOnboarding();
  return useMutation({
    mutationFn: (input: { alias: string; avatar: string }) => patchMePublicProfile(input),
    onSuccess: () => invalidate(),
  });
}

export function usePatchMeAccountMutation() {
  const invalidate = useInvalidateOnboarding();
  return useMutation({
    mutationFn: (body: PatchMeProfileBody) => patchMeProfile(body),
    onSuccess: () => invalidate(),
  });
}

export function usePutSavedPlacesMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (places: SavedPlacePutItem[]) => putSavedPlaces(places),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: onboardingKeys.snapshot() });
    },
  });
}

export function usePutPassengerProfileMutation() {
  const invalidate = useInvalidateOnboarding();
  return useMutation({
    mutationFn: (body: PutPassengerProfileBody) => putPassengerProfile(body),
    onSuccess: () => invalidate(),
  });
}

export function usePutDriverProfileMutation() {
  const invalidate = useInvalidateOnboarding();
  return useMutation({
    mutationFn: (body: PutDriverProfileBody) => putDriverProfile(body),
    onSuccess: () => invalidate(),
  });
}

export function useCompleteOnboardingMutation() {
  const invalidate = useInvalidateOnboarding();
  return useMutation({
    mutationFn: () => patchMeProfile({ completeOnboarding: true }),
    onSuccess: () => invalidate(),
  });
}

export function useSkipOnboardingMutation() {
  const invalidate = useInvalidateOnboarding();
  return useMutation({
    mutationFn: () => patchMeProfile({ completeOnboarding: true }),
    onSuccess: () => invalidate(),
  });
}
