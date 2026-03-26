"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchMeProfile,
  saveMeProfileForm,
} from "@/features/shared/api";
import { profileKeys } from "@/features/shared/query-keys";
import type { ProfileFormValues } from "@/features/shared/schemas/profile";

export function useProfileMeQuery() {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: fetchMeProfile,
  });
}

export function useSaveProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ProfileFormValues) => saveMeProfileForm(values),
    onSuccess: (next) => {
      queryClient.setQueryData(profileKeys.me(), next);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
  });
}
