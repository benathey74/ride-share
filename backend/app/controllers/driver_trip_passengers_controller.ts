import DriverTripRequestService from '#services/driver_trip_request_service'
import type { HttpContext } from '@adonisjs/core/http'

const driverTripRequestService = new DriverTripRequestService()

export default class DriverTripPassengersController {
  async cancel({ currentUser, params, serialize }: HttpContext) {
    const tripPassengerId = Number(params.id)
    const result = await driverTripRequestService.cancelPassengerSeat(
      currentUser.id,
      tripPassengerId
    )
    return serialize({ result })
  }
}
