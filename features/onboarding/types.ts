/** Wizard-only intent (not persisted on the server). */
export type OnboardingRole = "passenger" | "driver" | "both";

export type OnboardingPublicProfileDto = {
  alias: string;
  avatar: string;
  avatarEmoji: string;
};

export type OnboardingAccountDto = {
  email: string;
  realName: string | null;
  phone: string | null;
  departmentTeam: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  onboardingCompletedAt: string | null;
  canRide: boolean;
  canDrive: boolean;
  isAdmin: boolean;
  status: string;
};

export type OnboardingPassengerDto = {
  accessibilityNotes: string | null;
  usualCommuteDays: number[];
  preferredMorningTime: string | null;
  preferredEveningTime: string | null;
  ridePreferences: string | null;
};

export type OnboardingDriverDto = {
  approvalStatus: string;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleColor: string | null;
  plateNumber: string | null;
  seatsTotal: number;
  detourToleranceMinutes: number;
  pickupRadiusMeters: number | null;
  commuteNotes: string | null;
};

export type SavedPlaceRow = {
  id: number;
  kind: string;
  label: string;
  placeId: string;
  lat: string;
  lng: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string | null;
};

/** Member-visible notice from GET /api/v1/me/onboarding when driver status is rejected or revoked. */
export type MemberFacingDriverModerationNotice = {
  kind: "rejected" | "revoked";
  /** Sanitized message for the member; null if admin left reason blank. */
  message: string | null;
};

/** GET /api/v1/me/onboarding */
export type OnboardingSnapshot = {
  account: OnboardingAccountDto;
  publicProfile: OnboardingPublicProfileDto | null;
  passenger: OnboardingPassengerDto | null;
  driver: OnboardingDriverDto | null;
  /** Present when `driver.approvalStatus` is `rejected` or `revoked` (sanitized admin optional reason). */
  driverModerationNotice?: MemberFacingDriverModerationNotice | null;
  savedPlaces: SavedPlaceRow[];
};

export type SavedPlacePutItem = {
  kind: "home" | "work" | "pickup" | "custom";
  label: string;
  placeId: string;
  lat: string;
  lng: string;
  isDefault: boolean;
};
