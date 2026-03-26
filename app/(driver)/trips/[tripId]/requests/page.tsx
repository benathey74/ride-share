import { DriverTripRequestsScreen } from "@/features/driver";

type PageProps = {
  params: Promise<{ tripId: string }>;
};

export default async function DriverTripRequestsPage({ params }: PageProps) {
  const { tripId } = await params;
  return <DriverTripRequestsScreen tripInstanceId={tripId} />;
}
