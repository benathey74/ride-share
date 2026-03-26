"use client";

import { useSearchParams } from "next/navigation";
import { Info } from "lucide-react";
import {
  DRIVER_GATE_QUERY_KEY,
  type DriverGateQueryValue,
} from "@/features/driver/lib/driver-access";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function copyForGate(gate: DriverGateQueryValue): { title: string; body: string } {
  switch (gate) {
    case "pending":
      return {
        title: "Driver area is locked for now",
        body: "You opened a driver-only screen before approval. Use this page to track status — passenger features still work from Home.",
      };
    case "rejected":
      return {
        title: "Driver area needs an updated profile",
        body: "Your application wasn’t approved yet. Update your vehicle details below, then try the driver tab again after an admin re-reviews you.",
      };
    case "revoked":
      return {
        title: "Driver access was revoked",
        body: "Driver routes and the dashboard stay off until an admin restores access. You can still ride as a passenger.",
      };
    default:
      return { title: "", body: "" };
  }
}

/**
 * Shown when `?driver_gate=` is present (set by {@link DriverAreaGate}).
 */
export function FinishDriverRedirectNotice() {
  const searchParams = useSearchParams();
  const raw = searchParams.get(DRIVER_GATE_QUERY_KEY);
  const gate: DriverGateQueryValue | null =
    raw === "pending" || raw === "rejected" || raw === "revoked" ? raw : null;
  if (!gate) return null;

  const { title, body } = copyForGate(gate);

  return (
    <Card className="rounded-3xl border-sky-500/30 bg-sky-500/[0.06]">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-900 dark:text-sky-100">
          <Info className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-sm font-semibold leading-snug">{title}</CardTitle>
          <CardDescription className="text-left text-xs leading-relaxed">{body}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}
