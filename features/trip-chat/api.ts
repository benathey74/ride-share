import type { TripCoordinationMessage } from "@/types/trip-chat";
import { toPublicProfile } from "@/features/passenger/api";
import { apiGetJson, apiPostJson, unwrapData } from "@/lib/api/client";

function mapWireTripCoordinationMessage(raw: unknown): TripCoordinationMessage {
  const r = raw as Record<string, unknown>;
  return {
    id: Number(r.id ?? 0),
    message: String(r.message ?? ""),
    createdAt:
      typeof r.createdAt === "string"
        ? r.createdAt
        : r.createdAt != null
          ? String(r.createdAt)
          : "",
    fromViewer: Boolean(r.fromViewer),
    sender: toPublicProfile((r.sender as Parameters<typeof toPublicProfile>[0]) ?? null),
  };
}

export async function fetchTripCoordinationMessages(
  tripInstanceId: string,
): Promise<TripCoordinationMessage[]> {
  const id = tripInstanceId.trim();
  const json = await apiGetJson(`/api/v1/chat/trips/${encodeURIComponent(id)}/messages`);
  const data = unwrapData<{ messages: unknown[] }>(json);
  const list = Array.isArray(data.messages) ? data.messages : [];
  return list.map(mapWireTripCoordinationMessage);
}

export async function postTripCoordinationMessage(
  tripInstanceId: string,
  message: string,
): Promise<TripCoordinationMessage> {
  const id = tripInstanceId.trim();
  const json = await apiPostJson(
    `/api/v1/chat/trips/${encodeURIComponent(id)}/messages`,
    { message: message.trim() },
  );
  const data = unwrapData<{ message: unknown }>(json);
  return mapWireTripCoordinationMessage(data.message);
}
