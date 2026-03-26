import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import PassengerRouteCorridorInterest from '#models/passenger_route_corridor_interest'
import TripInstance from '#models/trip_instance'
import TripRequest from '#models/trip_request'
import { TripRequestStatus } from '#constants/trip'
import PrivacyViewService from '#services/privacy_view_service'

const privacy = new PrivacyViewService()

export default class DriverDashboardService {
  async dashboard(driverUserId: number) {
    const today = DateTime.utc().toISODate()!

    const todaysTrips = await TripInstance.query()
      .where('driver_user_id', driverUserId)
      .where('trip_date', today)
      .preload('routeTemplate')
      .orderBy('departure_time', 'asc')

    const pendingRequests = await TripRequest.query()
      .where('status', TripRequestStatus.PENDING)
      .whereHas('tripInstance', (q) => {
        q.where('driver_user_id', driverUserId)
      })
      .preload('tripInstance', (q) => q.preload('routeTemplate'))
      .preload('rider', (q) => q.preload('publicProfile'))
      .orderBy('created_at', 'asc')

    const tripIds = todaysTrips.map((t) => t.id)
    let acceptedPassengersToday = 0
    if (tripIds.length) {
      const row = await db
        .from('trip_requests')
        .whereIn('trip_instance_id', tripIds)
        .where('status', TripRequestStatus.ACCEPTED)
        .count('* as count')
      acceptedPassengersToday = Number(row[0].count)
    }

    const corridorInterests = await PassengerRouteCorridorInterest.query()
      .whereHas('routeTemplate', (q) => {
        q.where('driver_user_id', driverUserId)
      })
      .preload('routeTemplate')
      .preload('rider', (q) => q.preload('publicProfile'))
      .orderBy('updated_at', 'desc')
      .limit(25)

    return {
      summary: {
        tripsToday: todaysTrips.length,
        seatsOffered: todaysTrips.reduce((sum, t) => sum + t.seatsTotal, 0),
        acceptedPassengersToday,
      },
      todaysTrips: todaysTrips.map((trip) => ({
        id: String(trip.id),
        tripDate: trip.tripDate,
        departureTime: trip.departureTime,
        routeStatus: trip.routeStatus,
        seatsTotal: trip.seatsTotal,
        seatsRemaining: trip.seatsRemaining,
        destinationLabel: trip.routeTemplate?.destinationLabel ?? 'Destination',
      })),
      pendingRequests: pendingRequests.map((req) => ({
        id: String(req.id),
        tripInstanceId: String(req.tripInstanceId),
        status: req.status,
        requestedAt: req.createdAt,
        rider: privacy.formatPublicProfile(req.rider.publicProfile ?? null),
        pickup: privacy.shapeTripRequestForDriver(
          req,
          driverUserId,
          req.rider.publicProfile ?? null
        ).pickup,
        destinationLabel:
          req.tripInstance.routeTemplate?.destinationLabel ?? 'Destination',
      })),
      corridorInterests: corridorInterests.map((row) => {
        const rt = row.routeTemplate
        const corridorLabel = rt
          ? `${rt.originLabel} → ${rt.destinationLabel}`
          : 'Corridor'
        const updated = row.updatedAt ?? row.createdAt
        return {
          id: String(row.id),
          routeTemplateId: String(row.routeTemplateId),
          corridorLabel,
          rider: privacy.formatPublicProfile(row.rider.publicProfile ?? null),
          message: row.message,
          updatedAt: updated.toISO() ?? '',
        }
      }),
    }
  }
}
