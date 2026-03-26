import User from '#models/user'
import MemberDriverModerationNoticeService from '#services/member_driver_moderation_notice_service'
import PrivacyViewService from '#services/privacy_view_service'
import SavedPlacesService from '#services/saved_places_service'

const privacy = new PrivacyViewService()
const savedPlacesService = new SavedPlacesService()
const memberDriverNotice = new MemberDriverModerationNoticeService()

/**
 * Aggregates account, public/passenger/driver profiles, and saved places for the onboarding client.
 * All data is owner-scoped; nothing here is a shared/public rider DTO.
 */
export default class OnboardingService {
  async getSnapshot(userId: number) {
    const user = await User.query()
      .where('id', userId)
      .preload('publicProfile')
      .preload('driverProfile')
      .preload('passengerProfile')
      .firstOrFail()

    const savedPlaces = await savedPlacesService.listForUser(userId)

    const driverApprovalStatus = user.driverProfile?.approvalStatus ?? null
    const driverModerationNotice = await memberDriverNotice.resolveForDriverStatus(
      userId,
      driverApprovalStatus,
    )

    return {
      account: {
        email: user.email,
        realName: user.realName,
        phone: user.phone,
        departmentTeam: user.departmentTeam,
        emergencyContactName: user.emergencyContactName,
        emergencyContactPhone: user.emergencyContactPhone,
        onboardingCompletedAt: user.onboardingCompletedAt?.toISO() ?? null,
        canRide: user.canRide,
        canDrive: user.canDrive,
        isAdmin: user.isAdmin,
        status: user.status,
      },
      publicProfile: user.publicProfile ? privacy.formatPublicProfile(user.publicProfile) : null,
      passenger: user.passengerProfile
        ? {
            accessibilityNotes: user.passengerProfile.accessibilityNotes,
            usualCommuteDays: user.passengerProfile.usualCommuteDays ?? [],
            preferredMorningTime: user.passengerProfile.preferredMorningTime,
            preferredEveningTime: user.passengerProfile.preferredEveningTime,
            ridePreferences: user.passengerProfile.ridePreferences,
          }
        : null,
      driver: user.driverProfile
        ? {
            approvalStatus: user.driverProfile.approvalStatus,
            vehicleMake: user.driverProfile.vehicleMake,
            vehicleModel: user.driverProfile.vehicleModel,
            vehicleColor: user.driverProfile.vehicleColor,
            plateNumber: user.driverProfile.plateNumber,
            seatsTotal: user.driverProfile.seatsTotal,
            detourToleranceMinutes: user.driverProfile.detourToleranceMinutes,
            pickupRadiusMeters: user.driverProfile.pickupRadiusMeters,
            commuteNotes: user.driverProfile.commuteNotes,
          }
        : null,
      ...(driverModerationNotice ? { driverModerationNotice } : {}),
      savedPlaces,
    }
  }
}
