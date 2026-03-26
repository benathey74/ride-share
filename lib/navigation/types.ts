import type { LucideIcon } from "lucide-react";

export type NavIconKey =
  | "home"
  | "search"
  | "trips"
  | "dashboard"
  | "driverRoutes"
  | "admin"
  | "profile";

export type BottomNavItem = {
  /** Stable key when `href` changes by driver status (defaults to `href`). */
  id?: string;
  href: string;
  label: string;
  icon: NavIconKey;
  /** Tiny status chip on the icon (mobile). */
  badge?: string;
  /** Runs synchronously before navigation (e.g. persist wizard role for onboarding). */
  onBeforeNavigate?: () => void;
  /** Highlights on driver onboarding, finish, and guarded driver routes. */
  driveSlot?: boolean;
  /** Highlights on `/trips/*` and `/rides/*` (private trip + public ride overview). */
  riderTripSlot?: boolean;
};

export type NavIconMap = Record<NavIconKey, LucideIcon>;
