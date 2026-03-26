import type { PassengerMyTripRow } from "@/types/trip";
import type { TripInstanceStatus, TripRequestStatus } from "@/types/trip";

/** Maps to `Badge` variants in `@/components/ui/badge`. */
export type StatusTone = "default" | "secondary" | "outline" | "accent";

export type StatusPresentation = {
  label: string;
  tone: StatusTone;
  /** Short “what happens next” line for riders/drivers. */
  helper: string;
};

export type TripRequestPresentationRole = "passenger" | "driver";

// --- Seat request (trip_requests.status) ---

export function tripRequestStatusPresentation(
  status: TripRequestStatus,
  role: TripRequestPresentationRole = "passenger",
): StatusPresentation {
  switch (status) {
    case "pending":
      return role === "driver"
        ? {
            label: "Needs your response",
            tone: "accent",
            helper: "Accept or decline this seat request.",
          }
        : {
            label: "Waiting for driver",
            tone: "secondary",
            helper: "The driver will accept or decline your seat request.",
          };
    case "accepted":
      return role === "driver"
        ? {
            label: "Accepted",
            tone: "default",
            helper: "This rider has a seat. Their details stay visible for this trip.",
          }
        : {
            label: "Accepted",
            tone: "default",
            helper: "You have a seat on this trip. Exact pickup shows below when the driver shares it.",
          };
    case "declined":
      return role === "driver"
        ? {
            label: "Declined",
            tone: "accent",
            helper: "You declined this request. The rider can look for another trip.",
          }
        : {
            label: "Declined",
            tone: "accent",
            helper: "The driver isn’t offering a seat on this trip. You can search for another route.",
          };
    case "cancelled":
      return {
        label: "Cancelled",
        tone: "outline",
        helper: "This seat request is closed.",
      };
    default:
      return {
        label: String(status),
        tone: "outline",
        helper: "Open trip details for the latest update.",
      };
  }
}

// --- Trip instance / route (trip_instances.route_status) ---

export function tripInstanceStatusPresentation(status: TripInstanceStatus): StatusPresentation {
  switch (status) {
    case "scheduled":
      return {
        label: "Scheduled",
        tone: "secondary",
        helper: "This trip hasn’t started yet.",
      };
    case "in_progress":
      return {
        label: "In progress",
        tone: "default",
        helper: "This trip is underway.",
      };
    case "completed":
      return {
        label: "Completed",
        tone: "outline",
        helper: "This run has finished.",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        tone: "accent",
        helper: "This trip is no longer running.",
      };
    default:
      return {
        label: String(status).replace(/_/g, " "),
        tone: "outline",
        helper: "See trip details for updates.",
      };
  }
}

// --- Driver profile approval (driver_profiles.approval_status) ---

export function driverApprovalStatusPresentation(status: string): StatusPresentation {
  switch (status) {
    case "pending":
      return {
        label: "Awaiting approval",
        tone: "secondary",
        helper: "An admin reviews your vehicle before you can drive for the workspace.",
      };
    case "approved":
      return {
        label: "Approved to drive",
        tone: "default",
        helper: "You can publish routes and manage seat requests.",
      };
    case "rejected":
      return {
        label: "Not approved",
        tone: "accent",
        helper: "Update your driver profile and resubmit, or contact a workspace admin.",
      };
    case "revoked":
      return {
        label: "Access revoked",
        tone: "accent",
        helper: "Driver features stay off until an admin restores access.",
      };
    default:
      return {
        label: status.replace(/_/g, " "),
        tone: "outline",
        helper: "Check trip or profile screens for details.",
      };
  }
}

/** Onboarding finish / driver gate cards (wizard context). */
export function driverGatePresentation(
  gate: "pending" | "rejected" | "revoked",
): { title: string; body: string; nextStep: string } {
  switch (gate) {
    case "pending":
      return {
        title: "Waiting on workspace review",
        body: "Your vehicle profile is submitted. Passenger features work now; driving stays locked until an admin approves you.",
        nextStep: "Use Home to find rides. When you’re approved, open Drive to publish routes.",
      };
    case "rejected":
      return {
        title: "Driver application not approved",
        body: "An admin did not approve this vehicle profile yet. Fix anything they noted, or reach out if you’re unsure why.",
        nextStep: "Update your driver details, save, then wait for a new review.",
      };
    case "revoked":
      return {
        title: "Driver access revoked",
        body: "An admin turned off driver access for this workspace. You can still ride as a passenger.",
        nextStep: "Contact a workspace admin if this should be restored.",
      };
  }
}

// --- Passenger my-trips row (structured; avoids parsing free-form statusLabel) ---

export function passengerMyTripRowPresentation(row: PassengerMyTripRow): StatusPresentation {
  const rs = row.routeStatus;
  const rq = row.requestStatus;

  if (rq != null) {
    if (rq === "pending") {
      if (rs === "cancelled") {
        return {
          label: "Trip cancelled",
          tone: "accent",
          helper: "This trip was cancelled; your pending request won’t be fulfilled.",
        };
      }
      if (rs === "completed") {
        return {
          label: "Trip completed",
          tone: "outline",
          helper: "This trip already finished; your pending request is inactive.",
        };
      }
      return tripRequestStatusPresentation("pending");
    }
    if (rq === "declined") return tripRequestStatusPresentation("declined");
    if (rq === "cancelled") return tripRequestStatusPresentation("cancelled");
    if (rq === "accepted") {
      if (rs === "completed") {
        return {
          label: "Completed",
          tone: "outline",
          helper: "This run has finished — thanks for sharing the ride.",
        };
      }
      if (rs === "cancelled") {
        return {
          label: "Trip cancelled",
          tone: "accent",
          helper: "This trip was cancelled. Your seat request is no longer active.",
        };
      }
      if (rs === "in_progress") return tripInstanceStatusPresentation("in_progress");
      return tripRequestStatusPresentation("accepted");
    }
  }

  return passengerHomeStatusLabelPresentation(row.statusLabel);
}

// --- Home next-pickup card (server `statusLabel` strings) ---

export function passengerHomeStatusLabelPresentation(raw: string): StatusPresentation {
  const key = raw.trim().toLowerCase();

  if (key === "no upcoming trips") {
    return {
      label: "No upcoming trips",
      tone: "outline",
      helper: "Search for a route or check My trips when you have a request in progress.",
    };
  }
  if (key === "request pending" || key === "pending") {
    return tripRequestStatusPresentation("pending");
  }
  if (key === "seat confirmed" || key === "accepted") {
    return tripRequestStatusPresentation("accepted");
  }
  if (key === "declined") {
    return tripRequestStatusPresentation("declined");
  }
  if (key === "cancelled" || key === "trip cancelled" || key === "seat cancelled") {
    return {
      label: key.includes("trip") ? "Trip cancelled" : "Cancelled",
      tone: "accent",
      helper: "This trip or seat request is no longer active.",
    };
  }
  if (key === "trip completed" || key === "completed") {
    return tripInstanceStatusPresentation("completed");
  }
  if (key === "in progress") {
    return tripInstanceStatusPresentation("in_progress");
  }
  if (key === "scheduled") {
    return tripInstanceStatusPresentation("scheduled");
  }

  return {
    label: raw.trim() || "Status",
    tone: "outline",
    helper: "Open trip details for the latest update.",
  };
}

// --- Driver dashboard summary badge (frontend-derived slot) ---

export type DriverDashboardStatusSlot = "pending_requests" | "trips_today" | "clear";

export function driverDashboardStatusPresentation(
  slot: DriverDashboardStatusSlot,
): StatusPresentation {
  switch (slot) {
    case "pending_requests":
      return {
        label: "Action needed",
        tone: "accent",
        helper: "You have seat requests waiting — open a trip to accept or decline.",
      };
    case "trips_today":
      return {
        label: "Scheduled",
        tone: "default",
        helper: "You have trips today. Open the queue before departure when riders request seats.",
      };
    case "clear":
      return {
        label: "All set",
        tone: "secondary",
        helper: "No pending rider requests right now.",
      };
  }
}

export function driverDashboardStatusSlot(
  pendingRequestCount: number,
  tripsToday: number,
): DriverDashboardStatusSlot {
  if (pendingRequestCount > 0) return "pending_requests";
  if (tripsToday > 0) return "trips_today";
  return "clear";
}
