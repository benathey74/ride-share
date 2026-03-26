import { Exception } from '@adonisjs/core/exceptions'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import TripPassenger from '#models/trip_passenger'
import TripRequest from '#models/trip_request'
import TripInstance from '#models/trip_instance'
import { TripPassengerStatus, TripRequestStatus } from '#constants/trip'
import PrivacyViewService from '#services/privacy_view_service'

const privacy = new PrivacyViewService()

export default class DriverTripRequestService {
  async listForTripInstance(driverUserId: number, tripInstanceId: number) {
    const trip = await TripInstance.query()
      .where('id', tripInstanceId)
      .where('driver_user_id', driverUserId)
      .preload('routeTemplate')
      .firstOrFail()

    const requests = await TripRequest.query()
      .where('trip_instance_id', trip.id)
      .preload('rider', (q) => q.preload('publicProfile'))
      .orderBy('created_at', 'asc')

    const tpl = trip.routeTemplate
    const tripRoute = {
      originLat: tpl?.originLat ?? '',
      originLng: tpl?.originLng ?? '',
      destinationLat: tpl?.destinationLat ?? '',
      destinationLng: tpl?.destinationLng ?? '',
      routePolyline: trip.routePolyline ?? tpl?.routePolyline ?? null,
      pickupFuzzRadiusM: privacy.templatePickupRadiusMeters(tpl ?? null),
    }

    return {
      tripInstanceId: String(trip.id),
      tripRoute,
      requests: requests.map((req) =>
        privacy.shapeTripRequestForDriver(req, driverUserId, req.rider.publicProfile ?? null)
      ),
    }
  }

  async accept(driverUserId: number, tripRequestId: number) {
    return db.transaction(async (trx) => {
      const tripRequest = await TripRequest.query({ client: trx })
        .where('id', tripRequestId)
        .preload('tripInstance')
        .preload('rider', (q) => q.preload('publicProfile'))
        .firstOrFail()

      const trip = tripRequest.tripInstance

      if (trip.driverUserId !== driverUserId) {
        throw new Exception('Not authorized to manage this request', { status: 403 })
      }

      if (tripRequest.status !== TripRequestStatus.PENDING) {
        throw new Exception('Request is not pending', { status: 422 })
      }

      if (trip.seatsRemaining < 1) {
        throw new Exception('No seats remaining', { status: 422 })
      }

      const existingSeat = await TripPassenger.query({ client: trx })
        .where('trip_instance_id', tripRequest.tripInstanceId)
        .where('rider_user_id', tripRequest.riderUserId)
        .where('status', TripPassengerStatus.CONFIRMED)
        .first()

      if (existingSeat) {
        throw new Exception('Passenger already on this trip', { status: 422 })
      }

      tripRequest.exactPickupLabel = tripRequest.approxPickupLabel
      tripRequest.exactPickupLat = tripRequest.approxPickupLat
      tripRequest.exactPickupLng = tripRequest.approxPickupLng
      tripRequest.status = TripRequestStatus.ACCEPTED
      tripRequest.respondedAt = DateTime.utc()
      tripRequest.useTransaction(trx)
      await tripRequest.save()

      trip.exactPickupUnlocked = true
      trip.seatsRemaining -= 1
      trip.useTransaction(trx)
      await trip.save()

      await TripPassenger.create(
        {
          tripInstanceId: tripRequest.tripInstanceId,
          riderUserId: tripRequest.riderUserId,
          tripRequestId: tripRequest.id,
          status: TripPassengerStatus.CONFIRMED,
          seatCount: 1,
          confirmedPickupLabel: tripRequest.exactPickupLabel,
          confirmedPickupLat: tripRequest.exactPickupLat,
          confirmedPickupLng: tripRequest.exactPickupLng,
        },
        { client: trx }
      )

      return privacy.shapeTripRequestForDriver(
        tripRequest,
        driverUserId,
        tripRequest.rider.publicProfile ?? null
      )
    })
  }

  async decline(driverUserId: number, tripRequestId: number) {
    const tripRequest = await TripRequest.query()
      .where('id', tripRequestId)
      .preload('tripInstance')
      .preload('rider', (q) => q.preload('publicProfile'))
      .firstOrFail()

    if (tripRequest.tripInstance.driverUserId !== driverUserId) {
      throw new Exception('Not authorized to manage this request', { status: 403 })
    }

    if (tripRequest.status !== TripRequestStatus.PENDING) {
      throw new Exception('Request is not pending', { status: 422 })
    }

    tripRequest.status = TripRequestStatus.DECLINED
    tripRequest.respondedAt = DateTime.utc()
    await tripRequest.save()

    return privacy.shapeTripRequestForDriver(
      tripRequest,
      driverUserId,
      tripRequest.rider.publicProfile ?? null
    )
  }

  async cancelPassengerSeat(driverUserId: number, tripPassengerId: number) {
    return db.transaction(async (trx) => {
      const row = await TripPassenger.query({ client: trx })
        .where('id', tripPassengerId)
        .preload('tripInstance')
        .firstOrFail()

      const trip = row.tripInstance
      if (trip.driverUserId !== driverUserId) {
        throw new Exception('Not authorized', { status: 403 })
      }

      if (row.status !== TripPassengerStatus.CONFIRMED) {
        throw new Exception('Passenger booking is not active', { status: 422 })
      }

      row.status = TripPassengerStatus.CANCELLED
      row.useTransaction(trx)
      await row.save()

      trip.seatsRemaining += 1
      trip.useTransaction(trx)
      await trip.save()

      return { tripPassengerId: String(row.id), status: row.status }
    })
  }
}
