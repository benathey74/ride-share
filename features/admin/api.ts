import type {
  AdminDashboardData,
  AdminDashboardTotals,
  AdminReportRow,
  AdminUserDriverDetails,
  AdminUserRow,
} from "@/types/admin";
import { apiGetJson, apiPostJson, unwrapData } from "@/lib/api/client";

function toTotals(raw: unknown): AdminDashboardTotals {
  const t = raw as Record<string, unknown>;
  return {
    users: Number(t.users ?? 0),
    openReports: Number(t.openReports ?? 0),
    suspendedUsers: Number(t.suspendedUsers ?? 0),
    approvedDrivers: Number(t.approvedDrivers ?? 0),
  };
}

function parseAdminUserDriver(raw: unknown): AdminUserDriverDetails | null {
  if (raw == null || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  return {
    vehicleMake: d.vehicleMake != null ? String(d.vehicleMake) : null,
    vehicleModel: d.vehicleModel != null ? String(d.vehicleModel) : null,
    vehicleColor: d.vehicleColor != null ? String(d.vehicleColor) : null,
    plateNumber: d.plateNumber != null ? String(d.plateNumber) : null,
    seatsTotal: Number(d.seatsTotal ?? 0),
    detourToleranceMinutes: Number(d.detourToleranceMinutes ?? 0),
    pickupRadiusMeters:
      d.pickupRadiusMeters === null || d.pickupRadiusMeters === undefined
        ? null
        : Number(d.pickupRadiusMeters),
    commuteNotes: d.commuteNotes != null ? String(d.commuteNotes) : null,
  };
}

function toUserRow(raw: unknown): AdminUserRow {
  const u = raw as Record<string, unknown>;
  return {
    id: Number(u.id ?? 0),
    email: String(u.email ?? ""),
    realName: u.realName != null ? String(u.realName) : null,
    phone: u.phone != null ? String(u.phone) : null,
    status: String(u.status ?? ""),
    canDrive: Boolean(u.canDrive),
    canRide: Boolean(u.canRide),
    isAdmin: Boolean(u.isAdmin),
    alias: u.alias != null ? String(u.alias) : null,
    avatar: u.avatar != null ? String(u.avatar) : null,
    driverApprovalStatus:
      u.driverApprovalStatus != null ? String(u.driverApprovalStatus) : null,
    driver: parseAdminUserDriver(u.driver),
  };
}

function toReportRow(raw: unknown): AdminReportRow {
  const r = raw as Record<string, unknown>;
  return {
    id: Number(r.id ?? 0),
    reportedByUserId: Number(r.reportedByUserId ?? 0),
    reportedUserId: Number(r.reportedUserId ?? 0),
    tripInstanceId:
      r.tripInstanceId === null || r.tripInstanceId === undefined
        ? null
        : Number(r.tripInstanceId),
    reason: String(r.reason ?? ""),
    details: r.details != null ? String(r.details) : null,
    status: String(r.status ?? ""),
    createdAt:
      typeof r.createdAt === "string"
        ? r.createdAt
        : r.createdAt != null
          ? String(r.createdAt)
          : "",
    updatedAt:
      r.updatedAt === null || r.updatedAt === undefined
        ? null
        : typeof r.updatedAt === "string"
          ? r.updatedAt
          : String(r.updatedAt),
  };
}

/**
 * GET /api/v1/admin/dashboard — `{ data: { dashboard: { totals } } }`.
 */
export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const json = await apiGetJson("/api/v1/admin/dashboard");
  const { dashboard } = unwrapData<{ dashboard: { totals?: unknown } }>(json);
  return { totals: toTotals(dashboard?.totals ?? dashboard) };
}

/**
 * GET /api/v1/admin/users — `{ data: { users } }`.
 */
export async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  const json = await apiGetJson("/api/v1/admin/users");
  const { users } = unwrapData<{ users: unknown[] }>(json);
  if (!Array.isArray(users)) return [];
  return users.map(toUserRow);
}

/**
 * GET /api/v1/admin/reports — `{ data: { reports } }`.
 */
export async function fetchAdminReports(): Promise<AdminReportRow[]> {
  const json = await apiGetJson("/api/v1/admin/reports");
  const { reports } = unwrapData<{ reports: unknown[] }>(json);
  if (!Array.isArray(reports)) return [];
  return reports.map(toReportRow);
}

export type AdminModerationBody = {
  reason?: string;
};

/**
 * POST /api/v1/admin/users/:id/suspend — `{ data: { result } }`.
 */
export async function suspendAdminUser(
  userId: string,
  body: AdminModerationBody = {},
): Promise<void> {
  await apiPostJson(`/api/v1/admin/users/${encodeURIComponent(userId)}/suspend`, {
    ...(body.reason?.trim() ? { reason: body.reason.trim() } : {}),
  });
}

/**
 * POST /api/v1/admin/users/:id/revoke-driver — `{ data: { result } }`.
 */
export async function revokeAdminDriver(
  userId: string,
  body: AdminModerationBody = {},
): Promise<void> {
  await apiPostJson(`/api/v1/admin/users/${encodeURIComponent(userId)}/revoke-driver`, {
    ...(body.reason?.trim() ? { reason: body.reason.trim() } : {}),
  });
}

/**
 * POST /api/v1/admin/users/:id/approve-driver
 */
export async function approveAdminDriver(
  userId: string,
  body: AdminModerationBody = {},
): Promise<void> {
  await apiPostJson(`/api/v1/admin/users/${encodeURIComponent(userId)}/approve-driver`, {
    ...(body.reason?.trim() ? { reason: body.reason.trim() } : {}),
  });
}

/**
 * POST /api/v1/admin/users/:id/reject-driver
 */
export async function rejectAdminDriver(
  userId: string,
  body: AdminModerationBody = {},
): Promise<void> {
  await apiPostJson(`/api/v1/admin/users/${encodeURIComponent(userId)}/reject-driver`, {
    ...(body.reason?.trim() ? { reason: body.reason.trim() } : {}),
  });
}
