export const UserStatus = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
} as const

export const DriverApprovalStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REVOKED: 'revoked',
} as const

export const RouteTemplateStatus = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  ARCHIVED: 'archived',
} as const

export const TripInstanceStatus = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const TripRequestStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  CANCELLED: 'cancelled',
} as const

export const TripPassengerStatus = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
} as const

export const ModerationReportStatus = {
  OPEN: 'open',
  REVIEWING: 'reviewing',
  CLOSED: 'closed',
} as const

export const ModerationActionType = {
  SUSPEND: 'suspend',
  UNSUSPEND: 'unsuspend',
  REVOKE_DRIVER: 'revoke_driver',
  RESTORE_DRIVER: 'restore_driver',
  DRIVER_APPROVED: 'driver_approved',
  DRIVER_REJECTED: 'driver_rejected',
} as const
