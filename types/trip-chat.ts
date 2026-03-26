import type { PublicProfile } from "@/types/profile";

export type TripCoordinationMessage = {
  id: number;
  message: string;
  createdAt: string;
  fromViewer: boolean;
  sender: PublicProfile | null;
};
