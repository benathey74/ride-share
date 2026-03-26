export const tripChatKeys = {
  all: ["trip-chat"] as const,
  messages: (tripInstanceId: string) =>
    [...tripChatKeys.all, tripInstanceId] as const,
};
