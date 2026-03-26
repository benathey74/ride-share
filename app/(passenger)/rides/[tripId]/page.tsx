import { PassengerRideBrowseScreen } from "@/features/passenger";

type PageProps = {
  params: Promise<{ tripId: string }>;
};

/** Public ride browse — no seat booking required (home / search “View ride”). */
export default async function PassengerRideBrowsePage({ params }: PageProps) {
  const { tripId } = await params;
  return <PassengerRideBrowseScreen tripInstanceId={tripId} />;
}
