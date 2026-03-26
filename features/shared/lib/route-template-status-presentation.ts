import type { StatusPresentation, StatusTone } from "@/features/shared/lib/status-presentation";

/**
 * Lifecycle of a **route template** (saved corridor + schedule pattern), not a trip instance.
 * Matches backend `RouteTemplateStatus` in `backend/app/constants/trip.ts`.
 */
export type RouteTemplateLifecycleStatus = "active" | "paused" | "archived";

function presentation(
  label: string,
  tone: StatusTone,
  helper: string,
): StatusPresentation {
  return { label, tone, helper };
}

/**
 * Maps API `route_templates.status` strings to badge copy and “what this means” for drivers.
 * Does not use trip-instance or seat-request mappings.
 */
export function routeTemplateStatusPresentation(raw: string): StatusPresentation {
  const key = raw.trim().toLowerCase();

  switch (key) {
    case "active":
      return presentation(
        "Active",
        "default",
        "Eligible for passenger search and new trip scheduling when your driver profile is approved.",
      );
    case "paused":
      return presentation(
        "Paused",
        "secondary",
        "Not treated as a live offer for new rider discovery while in this state.",
      );
    case "archived":
      return presentation(
        "Archived",
        "outline",
        "Retained for your records; not used as a live offer for new trips.",
      );
    default:
      return presentation(
        raw.trim() || "Unknown",
        "outline",
        "Unrecognized template status from the server — check again after a refresh.",
      );
  }
}
