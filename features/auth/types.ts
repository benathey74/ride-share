export type AuthAccount = {
  id: number;
  email: string;
  isAdmin: boolean;
  canRide: boolean;
  canDrive: boolean;
  onboardingCompletedAt: string | null;
  status?: string;
};

export type IntendedRole = "passenger" | "driver" | "both";
