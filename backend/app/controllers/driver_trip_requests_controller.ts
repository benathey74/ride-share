import DriverTripRequestService from '#services/driver_trip_request_service'
import type { HttpContext } from '@adonisjs/core/http'

const driverTripRequestService = new DriverTripRequestService()

export default class DriverTripRequestsController {
  async listForTrip({ currentUser, params, serialize }: HttpContext) {
    const tripInstanceId = Number(params.id)
    const data = await driverTripRequestService.listForTripInstance(currentUser.id, tripInstanceId)
    return serialize(data)
  }

  async accept({ currentUser, params, serialize }: HttpContext) {
    const tripRequestId = Number(params.id)
    const tripRequest = await driverTripRequestService.accept(currentUser.id, tripRequestId)
    return serialize({ tripRequest })
  }

  async decline({ currentUser, params, serialize }: HttpContext) {
    const tripRequestId = Number(params.id)
    const tripRequest = await driverTripRequestService.decline(currentUser.id, tripRequestId)
    return serialize({ tripRequest })
  }
}
