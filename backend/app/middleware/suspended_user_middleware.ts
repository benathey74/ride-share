import { UserStatus } from '#constants/trip'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Blocks suspended accounts from using the API (after `DevIdentityMiddleware`).
 */
export default class SuspendedUserMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (ctx.currentUser.status === UserStatus.SUSPENDED) {
      return ctx.response.forbidden({ message: 'Account suspended' })
    }
    return next()
  }
}
