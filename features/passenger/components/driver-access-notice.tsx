"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CarFront } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DRIVER_ACCESS_NEED_PROFILE,
  DRIVER_ACCESS_QUERY_KEY,
} from "@/features/driver/lib/driver-access";
import { ROUTES } from "@/lib/constants/routes";

/**
 * Shown when driver-only routes redirect here with `?driver_access=need_profile`.
 */
export function PassengerDriverAccessNotice() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const raw = searchParams.get(DRIVER_ACCESS_QUERY_KEY);
  if (raw !== DRIVER_ACCESS_NEED_PROFILE) return null;

  const dismiss = () => {
    router.replace(ROUTES.home);
  };

  return (
    <Card className="rounded-3xl border-primary/25 bg-primary/[0.06]">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
          <CarFront className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-base">Driving isn’t set up yet</CardTitle>
          <CardDescription className="text-left text-sm leading-relaxed">
            The Drive area needs a vehicle profile and (in most workspaces) admin approval. Finish
            driver onboarding below — or stay on Home to keep using passenger features only.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-0 sm:flex-row">
        <Button asChild className="rounded-2xl">
          <Link href={ROUTES.onboarding.driver}>Continue driver setup</Link>
        </Button>
        <Button type="button" variant="secondary" className="rounded-2xl" onClick={dismiss}>
          Dismiss
        </Button>
      </CardContent>
    </Card>
  );
}
