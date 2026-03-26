import { DriverApprovalStatus } from '#constants/trip'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import DriverProfile from '#models/driver_profile'

/**
 * User must be flagged as a driver, have a profile, and be approved (not revoked/rejected).
 */
export default class DriverAllowedMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.currentUser
    if (!user.canDrive) {
      return ctx.response.forbidden({ message: 'Driving is not enabled for this account' })
    }

    const driverProfile = await DriverProfile.findBy('userId', user.id)
    if (!driverProfile || driverProfile.approvalStatus !== DriverApprovalStatus.APPROVED) {
      return ctx.response.forbidden({ message: 'Driver access is not available for this account' })
    }

    return next()
  }
}
