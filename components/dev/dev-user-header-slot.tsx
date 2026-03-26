"use client";

import { DevUserSwitcher } from "@/components/dev/dev-user-switcher";

/** Renders in app headers in development only. */
export function DevUserHeaderSlot() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }
  return <DevUserSwitcher layout="compact" />;
}
