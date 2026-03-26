"use client";

import { useQuery } from "@tanstack/react-query";
import { getApiBaseUrl } from "@/lib/api/client";
import { fetchAuthMe } from "@/features/auth/api";
import type { AuthAccount } from "@/features/auth/types";

export const authMeQueryKey = ["auth", "me"] as const;

export function useAuthMeQuery(options?: { enabled?: boolean }) {
  const configured = Boolean(getApiBaseUrl());
  return useQuery({
    queryKey: authMeQueryKey,
    queryFn: fetchAuthMe,
    enabled: options?.enabled !== false && configured,
    retry: false,
    staleTime: 60 * 1000,
  });
}

export type { AuthAccount };
