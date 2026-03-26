import PassengerMyTripsService from '#services/passenger_my_trips_service'
import type { HttpContext } from '@adonisjs/core/http'

const passengerMyTripsService = new PassengerMyTripsService()

export default class PassengerMyTripsController {
  async index({ currentUser, serialize }: HttpContext) {
    const overview = await passengerMyTripsService.buildOverview(currentUser.id)
    return serialize(overview)
  }
}
