import ProfileService from '#services/profile_service'
import {
  putMeDriverProfileValidator,
  putMePassengerProfileValidator,
} from '#validators/me_onboarding_validators'
import {
  patchMeProfileValidator,
  patchMePublicProfileValidator,
} from '#validators/me_profile_validators'
import type { HttpContext } from '@adonisjs/core/http'

const profileService = new ProfileService()

export default class ProfileController {
  async show({ currentUser, serialize }: HttpContext) {
    const profile = await profileService.getMe(currentUser.id)
    return serialize({ profile })
  }

  async update({ currentUser, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(patchMeProfileValidator)
    const profile = await profileService.updateAccount(currentUser.id, payload)
    return serialize({ profile })
  }

  async updatePublic({ currentUser, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(patchMePublicProfileValidator)
    const data = await profileService.updatePublicProfile(currentUser.id, payload)
    return serialize(data)
  }

  /** PUT /api/v1/me/passenger-profile */
  async putPassenger({ currentUser, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(putMePassengerProfileValidator)
    const profile = await profileService.upsertPassengerProfile(currentUser.id, {
      accessibilityNotes: payload.accessibilityNotes ?? null,
      usualCommuteDays: payload.usualCommuteDays,
      preferredMorningTime: payload.preferredMorningTime,
      preferredEveningTime: payload.preferredEveningTime,
      ridePreferences: payload.ridePreferences ?? null,
    })
    return serialize({ profile })
  }

  /** PUT /api/v1/me/driver-profile */
  async putDriver({ currentUser, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(putMeDriverProfileValidator)
    const profile = await profileService.upsertDriverProfile(currentUser.id, {
      vehicleMake: payload.vehicleMake,
      vehicleModel: payload.vehicleModel,
      vehicleColor: payload.vehicleColor,
      plateNumber: payload.plateNumber,
      seatsTotal: payload.seatsTotal,
      detourToleranceMinutes: payload.detourToleranceMinutes,
      pickupRadiusMeters: payload.pickupRadiusMeters,
      commuteNotes: payload.commuteNotes ?? null,
    })
    return serialize({ profile })
  }
}
