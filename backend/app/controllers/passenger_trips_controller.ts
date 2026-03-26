import PassengerTripRequestService from '#services/passenger_trip_request_service'
import type { HttpContext } from '@adonisjs/core/http'

const passengerTripRequestService = new PassengerTripRequestService()

export default class PassengerTripsController {
  /**
   * Public browse view — any onboarded passenger; no seat request required.
   */
  async browse({ currentUser, params, serialize }: HttpContext) {
    const tripInstanceId = Number(params.id)
    const trip = await passengerTripRequestService.getTripBrowseForRider(
      currentUser.id,
      tripInstanceId
    )
    return serialize({ trip })
  }

  /**
   * Private booked-trip detail — rider must have a trip_request or trip_passenger row.
   */
  async show({ currentUser, params, serialize }: HttpContext) {
    const tripInstanceId = Number(params.id)
    const trip = await passengerTripRequestService.getTripForRider(currentUser.id, tripInstanceId)
    return serialize({ trip })
  }
}
