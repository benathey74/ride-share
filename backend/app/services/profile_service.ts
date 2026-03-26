import { Exception } from '@adonisjs/core/exceptions'
import { DateTime } from 'luxon'
import { DriverApprovalStatus } from '#constants/trip'
import DriverProfile from '#models/driver_profile'
import PassengerProfile from '#models/passenger_profile'
import PublicProfile from '#models/public_profile'
import User from '#models/user'
import PrivacyViewService from '#services/privacy_view_service'

const privacy = new PrivacyViewService()

function isBlank(v: string | null | undefined) {
  return v == null || String(v).trim() === ''
}

export default class ProfileService {
  async getMe(userId: number) {
    const user = await User.query()
      .where('id', userId)
      .preload('publicProfile')
      .preload('driverProfile')
      .preload('passengerProfile')
      .firstOrFail()

    return {
      email: user.email,
      realName: user.realName,
      phone: user.phone,
      departmentTeam: user.departmentTeam,
      emergencyContactName: user.emergencyContactName,
      emergencyContactPhone: user.emergencyContactPhone,
      onboardingCompletedAt: user.onboardingCompletedAt?.toISO() ?? null,
      status: user.status,
      canDrive: user.canDrive,
      canRide: user.canRide,
      isAdmin: user.isAdmin,
      publicProfile: user.publicProfile ? privacy.formatPublicProfile(user.publicProfile) : null,
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
      passenger: user.passengerProfile
        ? {
            accessibilityNotes: user.passengerProfile.accessibilityNotes,
            usualCommuteDays: user.passengerProfile.usualCommuteDays ?? [],
            preferredMorningTime: user.passengerProfile.preferredMorningTime,
            preferredEveningTime: user.passengerProfile.preferredEveningTime,
            ridePreferences: user.passengerProfile.ridePreferences,
          }
        : null,
    }
  }

  async updateAccount(
    userId: number,
    payload: {
      realName?: string | null
      phone?: string | null
      accessibilityNotes?: string | null
      departmentTeam?: string | null
      emergencyContactName?: string | null
      emergencyContactPhone?: string | null
      completeOnboarding?: boolean
    }
  ) {
    const user = await User.findOrFail(userId)

    const nextName =
      payload.emergencyContactName !== undefined
        ? payload.emergencyContactName
        : user.emergencyContactName
    const nextPhone =
      payload.emergencyContactPhone !== undefined
        ? payload.emergencyContactPhone
        : user.emergencyContactPhone

    const nameSet = !isBlank(nextName)
    const phoneSet = !isBlank(nextPhone)
    if (nameSet !== phoneSet) {
      throw new Exception(
        'Provide both emergency contact name and phone, or leave both empty',
        { status: 422 }
      )
    }

    if (payload.realName !== undefined) {
      user.realName = payload.realName
    }
    if (payload.phone !== undefined) {
      user.phone = payload.phone
    }
    if (payload.departmentTeam !== undefined) {
      user.departmentTeam = payload.departmentTeam
    }
    if (payload.emergencyContactName !== undefined) {
      user.emergencyContactName = payload.emergencyContactName
    }
    if (payload.emergencyContactPhone !== undefined) {
      user.emergencyContactPhone = payload.emergencyContactPhone
    }
    if (payload.completeOnboarding === true) {
      user.onboardingCompletedAt = DateTime.utc()
    }

    await user.save()

    if (payload.accessibilityNotes !== undefined) {
      let passenger = await PassengerProfile.findBy('userId', userId)
      if (!passenger) {
        passenger = await PassengerProfile.create({
          userId,
          accessibilityNotes: payload.accessibilityNotes,
        })
      } else {
        passenger.accessibilityNotes = payload.accessibilityNotes
        await passenger.save()
      }
    }

    return this.getMe(userId)
  }

  async upsertPassengerProfile(
    userId: number,
    payload: {
      accessibilityNotes: string | null
      usualCommuteDays: number[]
      preferredMorningTime: string
      preferredEveningTime: string
      ridePreferences: string | null
    }
  ) {
    const user = await User.findOrFail(userId)
    user.canRide = true
    await user.save()

    let passenger = await PassengerProfile.findBy('userId', userId)
    if (!passenger) {
      passenger = await PassengerProfile.create({
        userId,
        accessibilityNotes: payload.accessibilityNotes,
        usualCommuteDays: payload.usualCommuteDays,
        preferredMorningTime: payload.preferredMorningTime,
        preferredEveningTime: payload.preferredEveningTime,
        ridePreferences: payload.ridePreferences,
      })
    } else {
      passenger.accessibilityNotes = payload.accessibilityNotes
      passenger.usualCommuteDays = payload.usualCommuteDays
      passenger.preferredMorningTime = payload.preferredMorningTime
      passenger.preferredEveningTime = payload.preferredEveningTime
      passenger.ridePreferences = payload.ridePreferences
      await passenger.save()
    }

    return this.getMe(userId)
  }

  async upsertDriverProfile(
    userId: number,
    payload: {
      vehicleMake: string
      vehicleModel: string
      vehicleColor: string
      plateNumber: string
      seatsTotal: number
      detourToleranceMinutes: number
      pickupRadiusMeters: number
      commuteNotes: string | null
    }
  ) {
    const user = await User.findOrFail(userId)
    user.canDrive = true
    await user.save()

    let dp = await DriverProfile.findBy('userId', userId)
    const keepApproved = dp?.approvalStatus === DriverApprovalStatus.APPROVED

    if (!dp) {
      await DriverProfile.create({
        userId,
        vehicleMake: payload.vehicleMake,
        vehicleModel: payload.vehicleModel,
        vehicleColor: payload.vehicleColor,
        plateNumber: payload.plateNumber,
        seatsTotal: payload.seatsTotal,
        detourToleranceMinutes: payload.detourToleranceMinutes,
        pickupRadiusMeters: payload.pickupRadiusMeters,
        commuteNotes: payload.commuteNotes,
        approvalStatus: DriverApprovalStatus.PENDING,
      })
    } else {
      dp.vehicleMake = payload.vehicleMake
      dp.vehicleModel = payload.vehicleModel
      dp.vehicleColor = payload.vehicleColor
      dp.plateNumber = payload.plateNumber
      dp.seatsTotal = payload.seatsTotal
      dp.detourToleranceMinutes = payload.detourToleranceMinutes
      dp.pickupRadiusMeters = payload.pickupRadiusMeters
      dp.commuteNotes = payload.commuteNotes
      if (!keepApproved) {
        dp.approvalStatus = DriverApprovalStatus.PENDING
      }
      await dp.save()
    }

    return this.getMe(userId)
  }

  async updatePublicProfile(userId: number, payload: { alias?: string; avatar?: string }) {
    if (payload.alias === undefined && payload.avatar === undefined) {
      throw new Exception('Nothing to update', { status: 422 })
    }

    let profile = await PublicProfile.findBy('userId', userId)

    if (!profile) {
      if (payload.alias === undefined || payload.avatar === undefined) {
        throw new Exception(
          'Alias and avatar are required the first time you set up your public profile',
          { status: 422 }
        )
      }
      const taken = await PublicProfile.query().where('alias', payload.alias).first()
      if (taken) {
        throw new Exception('Alias is already taken', { status: 422 })
      }
      profile = await PublicProfile.create({
        userId,
        alias: payload.alias,
        avatar: payload.avatar,
        rating: '5.00',
        completedTrips: 0,
        onTimeScore: null,
      })
      return {
        publicProfile: privacy.formatPublicProfile(profile),
      }
    }

    if (payload.alias !== undefined) {
      const taken = await PublicProfile.query()
        .where('alias', payload.alias)
        .whereNot('id', profile.id)
        .first()
      if (taken) {
        throw new Exception('Alias is already taken', { status: 422 })
      }
      profile.alias = payload.alias
    }

    if (payload.avatar !== undefined) {
      profile.avatar = payload.avatar
    }

    await profile.save()

    return {
      publicProfile: privacy.formatPublicProfile(profile),
    }
  }
}
