import { parsePassengerRouteSearchQuery } from '#services/passenger_route_search_filter'
import PassengerRouteSuggestionService from '#services/passenger_route_suggestion_service'
import type { HttpContext } from '@adonisjs/core/http'

const passengerRouteSuggestionService = new PassengerRouteSuggestionService()

export default class PassengerRouteSuggestionsController {
  async index({ currentUser, request, serialize }: HttpContext) {
    const search = parsePassengerRouteSearchQuery(request.qs())
    const routes = await passengerRouteSuggestionService.listSuggestions(search, currentUser.id)
    return serialize({ routes })
  }
}
