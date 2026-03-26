import { Exception } from '@adonisjs/core/exceptions'
import PassengerCorridorInterestService from '#services/passenger_corridor_interest_service'
import { expressCorridorInterestValidator } from '#validators/corridor_interest_validator'
import type { HttpContext } from '@adonisjs/core/http'

const passengerCorridorInterestService = new PassengerCorridorInterestService()

export default class PassengerCorridorInterestsController {
  async store({ currentUser, params, request, serialize }: HttpContext) {
    const routeTemplateId = Number(params.routeTemplateId)
    if (!Number.isFinite(routeTemplateId) || routeTemplateId < 1) {
      throw new Exception('Invalid route template', { status: 422 })
    }

    const payload = await request.validateUsing(expressCorridorInterestValidator)
    const result = await passengerCorridorInterestService.expressInterest(
      currentUser.id,
      routeTemplateId,
      payload.message?.trim() ? payload.message.trim() : null
    )

    return serialize({ ok: true, ...result })
  }
}
