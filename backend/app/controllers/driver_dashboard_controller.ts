import DriverDashboardService from '#services/driver_dashboard_service'
import type { HttpContext } from '@adonisjs/core/http'

const driverDashboardService = new DriverDashboardService()

export default class DriverDashboardController {
  async index({ currentUser, serialize }: HttpContext) {
    const dashboard = await driverDashboardService.dashboard(currentUser.id)
    return serialize({ dashboard })
  }
}
