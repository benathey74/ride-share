/**
 * Public identity — safe to render in shared UI (never real names).
 */
export type PublicProfile = {
  alias: string;
  avatarEmoji: string;
};

/**
 * Authenticated user's editable public profile + optional internal notes (UI form).
 */
export type MeProfile = PublicProfile & {
  bio?: string;
};
