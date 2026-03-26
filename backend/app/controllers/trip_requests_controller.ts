import PassengerTripRequestService from '#services/passenger_trip_request_service'
import { createTripRequestValidator } from '#validators/passenger_trip_request_validator'
import type { HttpContext } from '@adonisjs/core/http'

const passengerTripRequestService = new PassengerTripRequestService()

export default class TripRequestsController {
  async store({ currentUser, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(createTripRequestValidator)
    const tripRequest = await passengerTripRequestService.createForRider(currentUser.id, payload)
    return serialize({ tripRequest })
  }
}
