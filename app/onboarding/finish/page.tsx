import { Suspense } from "react";
import { MobileHeader } from "@/components/layout/mobile-header";
import { FinishScreen } from "@/features/onboarding/screens/finish-screen";

function FinishFallback() {
  return (
    <div className="flex flex-1 flex-col" aria-busy="true" aria-label="Loading">
      <MobileHeader title="Finish" />
      <div className="flex flex-1 flex-col gap-4 px-4 py-5 md:px-5">
        <div className="h-48 animate-pulse rounded-3xl bg-muted/50" />
      </div>
    </div>
  );
}

export default function OnboardingFinishPage() {
  return (
    <Suspense fallback={<FinishFallback />}>
      <FinishScreen />
    </Suspense>
  );
}
