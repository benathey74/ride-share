import { PassengerTripDetailScreen } from "@/features/passenger";

type PageProps = {
  params: Promise<{ tripId: string }>;
};

export default async function PassengerTripDetailPage({ params }: PageProps) {
  const { tripId } = await params;
  return <PassengerTripDetailScreen tripInstanceId={tripId} />;
}
