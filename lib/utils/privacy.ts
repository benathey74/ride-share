import type { PublicProfile } from "@/types/profile";

/**
 * Human-readable approximate pickup (never exact coordinates in public views).
 */
export function formatApproximatePickup(
  areaLabel: string,
  fuzzMeters: number,
): string {
  return `Near ${areaLabel} (~${fuzzMeters}m)`;
}

/**
 * Payload safe for cards, lists, and avatars (alias + emoji only).
 */
export function formatPublicIdentity(profile: PublicProfile): PublicProfile {
  return {
    alias: profile.alias,
    avatarEmoji: profile.avatarEmoji,
  };
}

/** Short label for badges / compact rows */
export function publicAliasLabel(profile: PublicProfile): string {
  return profile.alias;
}

/** Copy used by `PrivacyNotice` — keeps wording centralized. */
export const privacyNoticePhrases = {
  title: "Privacy-first",
  leadBeforeAlias: "Public UI shows ",
  aliasWord: "alias",
  betweenAliasAvatar: " and ",
  avatarWord: "avatar",
  afterAvatar:
    " only. Pickup stays approximate until a ride is accepted.",
} as const;
