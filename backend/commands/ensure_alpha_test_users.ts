import { BaseCommand } from '@adonisjs/core/ace'
import { DateTime } from 'luxon'
import { DriverApprovalStatus, UserStatus } from '#constants/trip'
import DriverProfile from '#models/driver_profile'
import PassengerProfile from '#models/passenger_profile'
import PublicProfile from '#models/public_profile'
import User from '#models/user'

const ONBOARDING_DONE = DateTime.utc()

type AlphaUserSpec = {
  email: string
  /** Plain password (hashed on save). */
  password: string
  realName: string
  isAdmin: boolean
  canRide: boolean
  canDrive: boolean
  publicAlias: string
  publicAvatar: string
  publicRating: string
  completedTrips: number
  onTimeScore: string | null
  /** Only host gets a driver row */
  driver?: {
    vehicleMake: string
    vehicleModel: string
    vehicleColor: string
    plateNumber: string
    seatsTotal: number
    detourToleranceMinutes: number
  }
}

const ALPHA_USERS: AlphaUserSpec[] = [
  {
    email: 'admin@rides.local',
    password: 'Admin123!',
    realName: 'Internal Admin',
    isAdmin: true,
    canRide: true,
    canDrive: true,
    publicAlias: 'admin-nova',
    publicAvatar: '🛡️',
    publicRating: '5.00',
    completedTrips: 0,
    onTimeScore: null,
  },
  {
    email: 'host@rides.local',
    password: 'Host123!',
    realName: 'Driver Host',
    isAdmin: false,
    canRide: true,
    canDrive: true,
    publicAlias: 'mint-heron',
    publicAvatar: '🌿',
    publicRating: '4.90',
    completedTrips: 12,
    onTimeScore: '0.920',
    driver: {
      vehicleMake: 'Toyota',
      vehicleModel: 'Innova',
      vehicleColor: 'Blue',
      plateNumber: 'ABC-1234',
      seatsTotal: 4,
      detourToleranceMinutes: 12,
    },
  },
  {
    email: 'rider-a@rides.local',
    password: 'RiderA123!',
    realName: 'Rider A',
    isAdmin: false,
    canRide: true,
    canDrive: false,
    publicAlias: 'signal-otter',
    publicAvatar: '🎧',
    publicRating: '5.00',
    completedTrips: 3,
    onTimeScore: null,
  },
  {
    email: 'rider-b@rides.local',
    password: 'RiderB123!',
    realName: 'Rider B',
    isAdmin: false,
    canRide: true,
    canDrive: false,
    publicAlias: 'amber-kite',
    publicAvatar: '🪁',
    publicRating: '5.00',
    completedTrips: 1,
    onTimeScore: null,
  },
]

/**
 * Idempotent: upserts the four internal alpha users, public/passenger (and host driver) profiles.
 * Safe to run after `migration:fresh` or on a dirty DB.
 */
export default class EnsureAlphaTestUsers extends BaseCommand {
  static commandName = 'ensure:alpha-users'
  static description =
    'Upsert admin@rides.local, host@rides.local, rider-a/b with roles, onboarding, and profiles'

  /** Required so Lucid models have a DB connection. */
  static options = { startApp: true } as const

  async run() {
    this.logger.info('Ensuring alpha test users…')

    for (const spec of ALPHA_USERS) {
      const email = spec.email.trim().toLowerCase()

      let user = await User.findBy('email', email)
      if (!user) {
        user = new User()
        user.email = email
      }

      user.merge({
        password: spec.password,
        realName: spec.realName,
        status: UserStatus.ACTIVE,
        canRide: spec.canRide,
        canDrive: spec.canDrive,
        isAdmin: spec.isAdmin,
        onboardingCompletedAt: ONBOARDING_DONE,
      })
      await user.save()
      this.logger.success(`User ${user.id} — ${email}`)

      let pub = await PublicProfile.findBy('userId', user.id)
      if (!pub) {
        pub = new PublicProfile()
        pub.userId = user.id
      }
      pub.merge({
        alias: spec.publicAlias,
        avatar: spec.publicAvatar,
        rating: spec.publicRating,
        completedTrips: spec.completedTrips,
        onTimeScore: spec.onTimeScore,
      })
      await pub.save()
      this.logger.info(`  public_profile ok (alias ${spec.publicAlias})`)

      let pass = await PassengerProfile.findBy('userId', user.id)
      if (!pass) {
        pass = await PassengerProfile.create({ userId: user.id })
        this.logger.info(`  passenger_profile created`)
      } else {
        this.logger.info(`  passenger_profile exists`)
      }

      if (spec.driver) {
        let drv = await DriverProfile.findBy('userId', user.id)
        if (!drv) {
          drv = new DriverProfile()
          drv.userId = user.id
        }
        drv.merge({
          vehicleMake: spec.driver.vehicleMake,
          vehicleModel: spec.driver.vehicleModel,
          vehicleColor: spec.driver.vehicleColor,
          plateNumber: spec.driver.plateNumber,
          seatsTotal: spec.driver.seatsTotal,
          detourToleranceMinutes: spec.driver.detourToleranceMinutes,
          pickupRadiusMeters: drv.pickupRadiusMeters ?? 400,
          commuteNotes: drv.commuteNotes,
          approvalStatus: DriverApprovalStatus.APPROVED,
        })
        await drv.save()
        this.logger.info(`  driver_profile approved`)
      } else {
        const existingDriver = await DriverProfile.findBy('userId', user.id)
        if (existingDriver) {
          this.logger.warning(
            `  ${email} should not be a driver for alpha spec — driver_profile row exists (id ${existingDriver.id}); leaving in place. Delete manually if you need a pure passenger.`,
          )
        }
      }
    }

    this.logger.success(
      'Done. Sign in at /login with email + password (see FRONTEND_LOCAL_SETUP.md — e.g. admin@rides.local / Admin123!).',
    )
  }
}
