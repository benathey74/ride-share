import { Suspense } from "react";
import { SearchResultsScreen } from "@/features/passenger";

function SearchFallback() {
  return (
    <div className="space-y-6 p-1" aria-busy="true" aria-label="Loading search">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-muted/60" />
      <div className="h-40 animate-pulse rounded-3xl bg-muted/50" />
      <div className="h-32 animate-pulse rounded-3xl bg-muted/40" />
    </div>
  );
}

export default function PassengerSearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchResultsScreen />
    </Suspense>
  );
}
