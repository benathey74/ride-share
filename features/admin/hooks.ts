"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveAdminDriver,
  fetchAdminDashboard,
  fetchAdminReports,
  fetchAdminUsers,
  rejectAdminDriver,
  revokeAdminDriver,
  suspendAdminUser,
} from "@/features/admin/api";
import { adminKeys } from "@/features/admin/query-keys";
import { useAppToast } from "@/features/shared/components/toast-provider";
import { describeApiFailure } from "@/lib/api/errors";

export function useAdminDashboardQuery() {
  return useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: fetchAdminDashboard,
  });
}

export function useAdminUsersQuery() {
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn: fetchAdminUsers,
  });
}

export function useAdminReportsQuery() {
  return useQuery({
    queryKey: adminKeys.reports(),
    queryFn: fetchAdminReports,
  });
}

export function useSuspendAdminUserMutation() {
  const queryClient = useQueryClient();
  const toast = useAppToast();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      suspendAdminUser(userId, { reason }),
    onSuccess: async () => {
      toast({ message: "User suspended.", variant: "success" });
      await queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
    onError: (err) => {
      toast({
        message: describeApiFailure(err).title,
        variant: "error",
      });
    },
  });
}

export function useRevokeAdminDriverMutation() {
  const queryClient = useQueryClient();
  const toast = useAppToast();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      revokeAdminDriver(userId, { reason }),
    onSuccess: async () => {
      toast({ message: "Driver access revoked.", variant: "success" });
      await queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
    onError: (err) => {
      toast({
        message: describeApiFailure(err).title,
        variant: "error",
      });
    },
  });
}

export function useApproveAdminDriverMutation() {
  const queryClient = useQueryClient();
  const toast = useAppToast();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      approveAdminDriver(userId, { reason }),
    onSuccess: async () => {
      toast({ message: "Driver approved.", variant: "success" });
      await queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
    onError: (err) => {
      toast({
        message: describeApiFailure(err).title,
        variant: "error",
      });
    },
  });
}

export function useRejectAdminDriverMutation() {
  const queryClient = useQueryClient();
  const toast = useAppToast();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      rejectAdminDriver(userId, { reason }),
    onSuccess: async () => {
      toast({ message: "Driver application rejected.", variant: "success" });
      await queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
    onError: (err) => {
      toast({
        message: describeApiFailure(err).title,
        variant: "error",
      });
    },
  });
}
