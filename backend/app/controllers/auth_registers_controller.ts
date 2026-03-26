import { DriverApprovalStatus, UserStatus } from '#constants/trip'
import DriverProfile from '#models/driver_profile'
import PassengerProfile from '#models/passenger_profile'
import PublicProfile from '#models/public_profile'
import User from '#models/user'
import { authRegisterValidator } from '#validators/auth_register_validator'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { randomBytes } from 'node:crypto'

function suggestedAlias(email: string) {
  const local = email.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20) || 'user'
  return `${local}-${randomBytes(4).toString('hex')}`
}

function roleToFlags(role: 'passenger' | 'driver' | 'both') {
  if (role === 'passenger') return { canRide: true, canDrive: false }
  if (role === 'driver') return { canRide: false, canDrive: true }
  return { canRide: true, canDrive: true }
}

/**
 * Email/password registration with intended passenger/driver/both role.
 * Logs the user in via session on success.
 */
export default class AuthRegistersController {
  async store({ request, response, auth }: HttpContext) {
    const { email, password, intendedRole } = await request.validateUsing(authRegisterValidator)
    const normalized = email.trim().toLowerCase()

    const existing = await User.findBy('email', normalized)
    if (existing) {
      return response.conflict({ message: 'An account with this email already exists' })
    }

    const { canRide, canDrive } = roleToFlags(intendedRole)

    const user = await db.transaction(async (trx) => {
      const u = await User.create(
        {
          email: normalized,
          password,
          realName: null,
          phone: null,
          departmentTeam: null,
          emergencyContactName: null,
          emergencyContactPhone: null,
          onboardingCompletedAt: null,
          status: UserStatus.ACTIVE,
          canRide,
          canDrive,
          isAdmin: false,
        },
        { client: trx },
      )

      let alias = suggestedAlias(normalized)
      for (let i = 0; i < 5; i++) {
        const taken = await PublicProfile.query({ client: trx }).where('alias', alias).first()
        if (!taken) break
        alias = suggestedAlias(normalized)
      }

      await PublicProfile.create(
        {
          userId: u.id,
          alias,
          avatar: '🙂',
          rating: '5.00',
          completedTrips: 0,
          onTimeScore: null,
        },
        { client: trx },
      )

      if (canRide) {
        await PassengerProfile.create({ userId: u.id }, { client: trx })
      }

      if (canDrive) {
        await DriverProfile.create(
          {
            userId: u.id,
            seatsTotal: 4,
            detourToleranceMinutes: 10,
            approvalStatus: DriverApprovalStatus.PENDING,
          },
          { client: trx },
        )
      }

      return u
    })

    try {
      await auth.use('web').login(user)
    } catch {
      return response.internalServerError({ message: 'Account created but session could not be started' })
    }

    return response.created({
      data: {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        canRide: user.canRide,
        canDrive: user.canDrive,
        onboardingCompletedAt: user.onboardingCompletedAt?.toISO() ?? null,
      },
    })
  }
}
