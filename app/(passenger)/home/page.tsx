import { Suspense } from "react";
import { HomeScreen } from "@/features/passenger";

function HomeSuspenseFallback() {
  return (
    <div className="space-y-6 md:space-y-7" aria-busy="true" aria-label="Loading home">
      <div className="h-48 animate-pulse rounded-[2rem] bg-muted/60" />
      <div className="h-36 animate-pulse rounded-3xl bg-muted/50" />
    </div>
  );
}

export default function PassengerHomePage() {
  return (
    <Suspense fallback={<HomeSuspenseFallback />}>
      <HomeScreen />
    </Suspense>
  );
}
