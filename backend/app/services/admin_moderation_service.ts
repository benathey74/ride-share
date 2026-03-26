import { Exception } from '@adonisjs/core/exceptions'
import db from '@adonisjs/lucid/services/db'
import DriverProfile from '#models/driver_profile'
import ModerationAction from '#models/moderation_action'
import ModerationReport from '#models/moderation_report'
import User from '#models/user'
import {
  DriverApprovalStatus,
  ModerationActionType,
  ModerationReportStatus,
  UserStatus,
} from '#constants/trip'

export default class AdminModerationService {
  async dashboard() {
    const [usersRow, openRow, suspendedRow, driversRow] = await Promise.all([
      db.from('users').count('* as c'),
      db.from('moderation_reports').where('status', ModerationReportStatus.OPEN).count('* as c'),
      db.from('users').where('status', UserStatus.SUSPENDED).count('* as c'),
      db
        .from('driver_profiles')
        .where('approval_status', DriverApprovalStatus.APPROVED)
        .count('* as c'),
    ])

    return {
      totals: {
        users: Number(usersRow[0].c),
        openReports: Number(openRow[0].c),
        suspendedUsers: Number(suspendedRow[0].c),
        approvedDrivers: Number(driversRow[0].c),
      },
    }
  }

  async listUsers() {
    const users = await User.query()
      .preload('publicProfile')
      .preload('driverProfile')
      .orderBy('id', 'asc')

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      realName: u.realName,
      phone: u.phone,
      status: u.status,
      canDrive: u.canDrive,
      canRide: u.canRide,
      isAdmin: u.isAdmin,
      alias: u.publicProfile?.alias ?? null,
      avatar: u.publicProfile?.avatar ?? null,
      driverApprovalStatus: u.driverProfile?.approvalStatus ?? null,
      driver: u.driverProfile
        ? {
            vehicleMake: u.driverProfile.vehicleMake,
            vehicleModel: u.driverProfile.vehicleModel,
            vehicleColor: u.driverProfile.vehicleColor,
            plateNumber: u.driverProfile.plateNumber,
            seatsTotal: u.driverProfile.seatsTotal,
            detourToleranceMinutes: u.driverProfile.detourToleranceMinutes,
            pickupRadiusMeters: u.driverProfile.pickupRadiusMeters,
            commuteNotes: u.driverProfile.commuteNotes,
          }
        : null,
    }))
  }

  async listReports() {
    const rows = await ModerationReport.query().orderBy('created_at', 'desc').limit(100)
    return rows.map((r) => ({
      id: r.id,
      reportedByUserId: r.reportedByUserId,
      reportedUserId: r.reportedUserId,
      tripInstanceId: r.tripInstanceId,
      reason: r.reason,
      details: r.details,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }))
  }

  async suspendUser(moderatorUserId: number, targetUserId: number, reason?: string) {
    if (moderatorUserId === targetUserId) {
      throw new Exception('Cannot suspend yourself', { status: 422 })
    }

    const target = await User.findOrFail(targetUserId)
    target.status = UserStatus.SUSPENDED
    await target.save()

    await ModerationAction.create({
      adminUserId: moderatorUserId,
      targetUserId,
      actionType: ModerationActionType.SUSPEND,
      reason: reason ?? null,
      metadataJson: null,
    })

    return { userId: target.id, status: target.status }
  }

  async revokeDriver(moderatorUserId: number, targetUserId: number, reason?: string) {
    const driverProfile = await DriverProfile.findBy('userId', targetUserId)
    if (!driverProfile) {
      throw new Exception('User does not have a driver profile', { status: 422 })
    }

    driverProfile.approvalStatus = DriverApprovalStatus.REVOKED
    await driverProfile.save()

    const user = await User.findOrFail(targetUserId)
    user.canDrive = false
    await user.save()

    await ModerationAction.create({
      adminUserId: moderatorUserId,
      targetUserId,
      actionType: ModerationActionType.REVOKE_DRIVER,
      reason: reason ?? null,
      metadataJson: { driverProfileId: driverProfile.id },
    })

    return { userId: targetUserId, driverApprovalStatus: driverProfile.approvalStatus }
  }

  async approveDriver(moderatorUserId: number, targetUserId: number, reason?: string) {
    if (moderatorUserId === targetUserId) {
      throw new Exception('Cannot approve yourself via admin', { status: 422 })
    }

    const driverProfile = await DriverProfile.findBy('userId', targetUserId)
    if (!driverProfile) {
      throw new Exception('User does not have a driver profile', { status: 422 })
    }

    driverProfile.approvalStatus = DriverApprovalStatus.APPROVED
    await driverProfile.save()

    const user = await User.findOrFail(targetUserId)
    user.canDrive = true
    await user.save()

    await ModerationAction.create({
      adminUserId: moderatorUserId,
      targetUserId,
      actionType: ModerationActionType.DRIVER_APPROVED,
      reason: reason ?? null,
      metadataJson: { driverProfileId: driverProfile.id },
    })

    return { userId: targetUserId, driverApprovalStatus: driverProfile.approvalStatus }
  }

  async rejectDriver(moderatorUserId: number, targetUserId: number, reason?: string) {
    if (moderatorUserId === targetUserId) {
      throw new Exception('Cannot reject yourself via admin', { status: 422 })
    }

    const driverProfile = await DriverProfile.findBy('userId', targetUserId)
    if (!driverProfile) {
      throw new Exception('User does not have a driver profile', { status: 422 })
    }

    driverProfile.approvalStatus = DriverApprovalStatus.REJECTED
    await driverProfile.save()

    const user = await User.findOrFail(targetUserId)
    user.canDrive = false
    await user.save()

    await ModerationAction.create({
      adminUserId: moderatorUserId,
      targetUserId,
      actionType: ModerationActionType.DRIVER_REJECTED,
      reason: reason ?? null,
      metadataJson: { driverProfileId: driverProfile.id },
    })

    return { userId: targetUserId, driverApprovalStatus: driverProfile.approvalStatus }
  }
}
