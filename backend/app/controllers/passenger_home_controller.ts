import PassengerRouteSuggestionService from '#services/passenger_route_suggestion_service'
import type { HttpContext } from '@adonisjs/core/http'

const passengerRouteSuggestionService = new PassengerRouteSuggestionService()

export default class PassengerHomeController {
  async index({ currentUser, serialize }: HttpContext) {
    const home = await passengerRouteSuggestionService.buildHome(currentUser.id)
    return serialize({ home })
  }
}
