import User from '#models/user'
import { authLoginValidator } from '#validators/auth_login_validator'
import { errors } from '@adonisjs/auth'
import type { HttpContext } from '@adonisjs/core/http'

function serializeAccount(user: User) {
  return {
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
    canRide: user.canRide,
    canDrive: user.canDrive,
    onboardingCompletedAt: user.onboardingCompletedAt?.toISO() ?? null,
    status: user.status,
  }
}

/**
 * Session-based login, logout, and current user for the SPA (cookie + credentials).
 */
export default class AuthSessionsController {
  async login({ request, response, auth }: HttpContext) {
    const { email, password } = await request.validateUsing(authLoginValidator)
    const normalized = email.trim().toLowerCase()

    let user: User
    try {
      user = await User.verifyCredentials(normalized, password)
    } catch (e) {
      if (e instanceof errors.E_INVALID_CREDENTIALS) {
        return response.unauthorized({ message: 'Invalid email or password' })
      }
      throw e
    }

    await auth.use('web').login(user)

    return response.ok({ data: serializeAccount(user) })
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').check()
    if (auth.use('web').isAuthenticated) {
      await auth.use('web').logout()
    }
    return response.ok({ data: { ok: true } })
  }

  async me({ auth, response }: HttpContext) {
    await auth.use('web').check()
    if (!auth.use('web').isAuthenticated) {
      return response.unauthorized({ message: 'Not authenticated' })
    }
    const user = auth.use('web').user!
    return response.ok({ data: serializeAccount(user) })
  }
}
