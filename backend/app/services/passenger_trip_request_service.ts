import { Exception } from '@adonisjs/core/exceptions'
import TripInstance from '#models/trip_instance'
import TripPassenger from '#models/trip_passenger'
import TripRequest from '#models/trip_request'
import { TripInstanceStatus, TripRequestStatus } from '#constants/trip'
import PrivacyViewService from '#services/privacy_view_service'

const privacy = new PrivacyViewService()

export default class PassengerTripRequestService {
  /**
   * Trip detail is only available if the rider has a seat request or passenger record on the trip.
   */
  async riderCanAccessTrip(riderUserId: number, tripInstanceId: number): Promise<boolean> {
    const tr = await TripRequest.query()
      .where('trip_instance_id', tripInstanceId)
      .where('rider_user_id', riderUserId)
      .first()
    if (tr) return true
    const tp = await TripPassenger.query()
      .where('trip_instance_id', tripInstanceId)
      .where('rider_user_id', riderUserId)
      .first()
    return !!tp
  }

  async createForRider(
    riderUserId: number,
    payload: {
      tripInstanceId: number
      approxPickupLabel: string
      approxPickupLat: string
      approxPickupLng: string
      approxPickupRadiusMeters?: number
      message?: string | null
    }
  ) {
    const trip = await TripInstance.findOrFail(payload.tripInstanceId)

    if (
      trip.routeStatus === TripInstanceStatus.CANCELLED ||
      trip.routeStatus === TripInstanceStatus.COMPLETED
    ) {
      throw new Exception('Trip is not accepting requests', { status: 422 })
    }

    if (trip.driverUserId === riderUserId) {
      throw new Exception('You cannot request your own trip', { status: 422 })
    }

    if (trip.seatsRemaining < 1) {
      throw new Exception('No seats remaining on this trip', { status: 422 })
    }

    const existing = await TripRequest.query()
      .where('trip_instance_id', trip.id)
      .where('rider_user_id', riderUserId)
      .where('status', TripRequestStatus.PENDING)
      .first()

    if (existing) {
      throw new Exception('You already have a pending request for this trip', { status: 422 })
    }

    const tripRequest = await TripRequest.create({
      tripInstanceId: trip.id,
      riderUserId,
      status: TripRequestStatus.PENDING,
      approxPickupLabel: payload.approxPickupLabel,
      approxPickupLat: payload.approxPickupLat,
      approxPickupLng: payload.approxPickupLng,
      approxPickupRadiusMeters: payload.approxPickupRadiusMeters ?? 400,
      message: payload.message ?? null,
    })

    await tripRequest.load('rider', (q) => q.preload('publicProfile'))

    return privacy.shapeTripRequestPublic(
      tripRequest,
      riderUserId,
      trip.driverUserId,
      tripRequest.rider.publicProfile ?? null
    )
  }

  async getTripForRider(riderUserId: number, tripInstanceId: number) {
    const exists = await TripInstance.query().where('id', tripInstanceId).first()
    if (!exists) {
      throw new Exception('Trip not found', { status: 404 })
    }

    const allowed = await this.riderCanAccessTrip(riderUserId, tripInstanceId)
    if (!allowed) {
      throw new Exception('You do not have access to this trip', { status: 403 })
    }

    const trip = await TripInstance.query()
      .where('id', tripInstanceId)
      .preload('driver', (q) => q.preload('publicProfile'))
      .preload('routeTemplate')
      .firstOrFail()

    const viewerRequests = await TripRequest.query()
      .where('trip_instance_id', trip.id)
      .where('rider_user_id', riderUserId)
      .preload('rider', (q) => q.preload('publicProfile'))

    return privacy.shapePassengerTripDetail({
      trip,
      viewerUserId: riderUserId,
      driverPublicProfile: trip.driver.publicProfile ?? null,
      viewerRequests,
      templateOriginLabel: trip.routeTemplate?.originLabel ?? null,
      templatePickupRadiusM: privacy.templatePickupRadiusMeters(trip.routeTemplate ?? null),
    })
  }
}
