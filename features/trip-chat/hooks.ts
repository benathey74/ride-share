"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchTripCoordinationMessages,
  postTripCoordinationMessage,
} from "@/features/trip-chat/api";
import { tripChatKeys } from "@/features/trip-chat/query-keys";

export function useTripCoordinationMessagesQuery(
  tripInstanceId: string,
  options?: { enabled?: boolean },
) {
  const id = tripInstanceId.trim();
  const enabled = Boolean(id) && (options?.enabled ?? true);

  return useQuery({
    queryKey: tripChatKeys.messages(id),
    queryFn: () => fetchTripCoordinationMessages(id),
    enabled,
    refetchOnWindowFocus: true,
    refetchInterval: 45_000,
  });
}

export function usePostTripCoordinationMessageMutation(tripInstanceId: string) {
  const queryClient = useQueryClient();
  const id = tripInstanceId.trim();

  return useMutation({
    mutationFn: (message: string) => postTripCoordinationMessage(id, message),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tripChatKeys.messages(id) });
    },
  });
}
