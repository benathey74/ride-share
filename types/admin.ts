/** Nested driver profile on admin user rows (when a driver_profile exists). */
export type AdminUserDriverDetails = {
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleColor: string | null;
  plateNumber: string | null;
  seatsTotal: number;
  detourToleranceMinutes: number;
  pickupRadiusMeters: number | null;
  commuteNotes: string | null;
};

/** GET /api/v1/admin/dashboard → `data.dashboard.totals` */
export type AdminDashboardTotals = {
  users: number;
  openReports: number;
  suspendedUsers: number;
  approvedDrivers: number;
};

/** Normalized dashboard payload for the admin UI. */
export type AdminDashboardData = {
  totals: AdminDashboardTotals;
};

/** GET /api/v1/admin/users → row shape (moderation view; not public profiles). */
export type AdminUserRow = {
  id: number;
  email: string;
  realName: string | null;
  phone: string | null;
  status: string;
  canDrive: boolean;
  canRide: boolean;
  isAdmin: boolean;
  alias: string | null;
  avatar: string | null;
  driverApprovalStatus: string | null;
  driver: AdminUserDriverDetails | null;
};

/** GET /api/v1/admin/reports */
export type AdminReportRow = {
  id: number;
  reportedByUserId: number;
  reportedUserId: number;
  tripInstanceId: number | null;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
};
