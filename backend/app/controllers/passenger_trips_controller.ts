import PassengerTripRequestService from '#services/passenger_trip_request_service'
import type { HttpContext } from '@adonisjs/core/http'

const passengerTripRequestService = new PassengerTripRequestService()

export default class PassengerTripsController {
  async show({ currentUser, params, serialize }: HttpContext) {
    const tripInstanceId = Number(params.id)
    const trip = await passengerTripRequestService.getTripForRider(currentUser.id, tripInstanceId)
    return serialize({ trip })
  }
}
