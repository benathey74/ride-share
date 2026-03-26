import DriverRouteTemplateService from '#services/driver_route_template_service'
import { createRouteTemplateValidator } from '#validators/create_route_template_validator'
import type { HttpContext } from '@adonisjs/core/http'

const driverRouteTemplateService = new DriverRouteTemplateService()

export default class DriverRouteTemplatesController {
  async index({ currentUser, serialize }: HttpContext) {
    const templates = await driverRouteTemplateService.listForDriver(currentUser.id)
    return serialize({ templates })
  }

  async store({ currentUser, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(createRouteTemplateValidator)
    const template = await driverRouteTemplateService.create(currentUser.id, payload)
    return serialize({ template })
  }
}
