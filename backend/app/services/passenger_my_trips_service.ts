import TripInstance from '#models/trip_instance'
import TripPassenger from '#models/trip_passenger'
import TripRequest from '#models/trip_request'
import {
  TripInstanceStatus,
  TripPassengerStatus,
  TripRequestStatus,
} from '#constants/trip'
import PrivacyViewService, { type PickupPublicDto } from '#services/privacy_view_service'

const privacy = new PrivacyViewService()

/** One row in GET /passenger/my-trips — public-safe, no real names. */
export type PassengerMyTripOverviewRow = {
  key: string
  tripInstanceId: string
  tripRequestId: string | null
  requestStatus: string | null
  routeStatus: string
  host: ReturnType<PrivacyViewService['formatPublicProfile']>
  tripDate: string
  departureTime: string
  originLabel: string
  destinationLabel: string
  pickup: PickupPublicDto
  statusLabel: string
}

export type PassengerMyTripsOverviewResult = {
  pendingRequests: PassengerMyTripOverviewRow[]
  upcomingTrips: PassengerMyTripOverviewRow[]
  pastTrips: PassengerMyTripOverviewRow[]
}

export default class PassengerMyTripsService {
  async buildOverview(riderUserId: number): Promise<PassengerMyTripsOverviewResult> {
    const pendingRequests: PassengerMyTripOverviewRow[] = []
    const upcomingTrips: PassengerMyTripOverviewRow[] = []
    const pastTrips: PassengerMyTripOverviewRow[] = []

    const requests = await TripRequest.query()
      .where('rider_user_id', riderUserId)
      .preload('tripInstance', (q) =>
        q.preload('driver', (d) => d.preload('publicProfile')).preload('routeTemplate')
      )
      .orderBy('updated_at', 'desc')

    const passengers = await TripPassenger.query()
      .where('rider_user_id', riderUserId)
      .preload('tripInstance', (q) =>
        q.preload('driver', (d) => d.preload('publicProfile')).preload('routeTemplate')
      )
      .orderBy('updated_at', 'desc')

    for (const tr of requests) {
      const trip = tr.tripInstance
      const row = this.rowFromTripRequest(tr, trip)
      this.pushToBucket(row, trip, tr.status, pendingRequests, upcomingTrips, pastTrips)
    }

    for (const tp of passengers) {
      if (tp.tripRequestId !== null) {
        const linkedRequest = requests.find((r) => r.id === tp.tripRequestId)
        if (linkedRequest) {
          continue
        }
      }
      const trip = tp.tripInstance
      const row = this.rowFromTripPassengerOnly(tp, trip)
      this.pushToBucketForPassenger(row, trip, tp, upcomingTrips, pastTrips)
    }

    return {
      pendingRequests: this.sortRows(pendingRequests),
      upcomingTrips: this.sortRows(upcomingTrips),
      pastTrips: this.sortRows(pastTrips),
    }
  }

  /** Most recent trip date first, then later departure within the same day. */
  private sortRows(rows: PassengerMyTripOverviewRow[]): PassengerMyTripOverviewRow[] {
    return [...rows].sort((a, b) => {
      const byDate = b.tripDate.localeCompare(a.tripDate)
      if (byDate !== 0) return byDate
      return b.departureTime.localeCompare(a.departureTime)
    })
  }

  private rowFromTripRequest(tr: TripRequest, trip: TripInstance): PassengerMyTripOverviewRow {
    const driverUserId = trip.driverUserId
    const pickup = privacy.shapePickupFromTripRequest(tr, tr.riderUserId, driverUserId)
    const template = trip.routeTemplate ?? null
    const originLabel = template?.originLabel ?? 'Pickup area'
    const destinationLabel = template?.destinationLabel ?? 'Destination'

    return {
      key: `req-${tr.id}`,
      tripInstanceId: String(trip.id),
      tripRequestId: String(tr.id),
      requestStatus: tr.status,
      routeStatus: trip.routeStatus,
      host: privacy.formatPublicProfile(trip.driver.publicProfile ?? null),
      tripDate: trip.tripDate.toISODate() ?? '',
      departureTime: trip.departureTime.slice(0, 5),
      originLabel,
      destinationLabel,
      pickup,
      statusLabel: this.statusLabelForRequest(trip, tr),
    }
  }

  private rowFromTripPassengerOnly(tp: TripPassenger, trip: TripInstance): PassengerMyTripOverviewRow {
    const template = trip.routeTemplate ?? null
    const corridorRadius = privacy.templatePickupRadiusMeters(template)
    const originLabel = template?.originLabel ?? 'Pickup area'
    const destinationLabel = template?.destinationLabel ?? 'Destination'
    const pickup = privacy.shapePickupFromTripPassengerForRider(tp, originLabel, corridorRadius)

    const pseudoStatus =
      tp.status === TripPassengerStatus.CONFIRMED
        ? TripRequestStatus.ACCEPTED
        : TripRequestStatus.CANCELLED

    return {
      key: `seat-${tp.id}`,
      tripInstanceId: String(trip.id),
      tripRequestId: tp.tripRequestId !== null ? String(tp.tripRequestId) : null,
      requestStatus: pseudoStatus,
      routeStatus: trip.routeStatus,
      host: privacy.formatPublicProfile(trip.driver.publicProfile ?? null),
      tripDate: trip.tripDate.toISODate() ?? '',
      departureTime: trip.departureTime.slice(0, 5),
      originLabel,
      destinationLabel,
      pickup,
      statusLabel: this.statusLabelForPassenger(trip, tp),
    }
  }

  private statusLabelForRequest(trip: TripInstance, tr: TripRequest): string {
    if (tr.status === TripRequestStatus.PENDING) return 'Pending'
    if (tr.status === TripRequestStatus.DECLINED) return 'Declined'
    if (tr.status === TripRequestStatus.CANCELLED) return 'Cancelled'
    if (tr.status === TripRequestStatus.ACCEPTED) {
      if (trip.routeStatus === TripInstanceStatus.COMPLETED) return 'Trip completed'
      if (trip.routeStatus === TripInstanceStatus.CANCELLED) return 'Trip cancelled'
      if (trip.routeStatus === TripInstanceStatus.IN_PROGRESS) return 'In progress'
      return 'Seat confirmed'
    }
    return tr.status
  }

  private statusLabelForPassenger(trip: TripInstance, tp: TripPassenger): string {
    if (tp.status === TripPassengerStatus.CANCELLED) return 'Seat cancelled'
    if (trip.routeStatus === TripInstanceStatus.COMPLETED) return 'Trip completed'
    if (trip.routeStatus === TripInstanceStatus.CANCELLED) return 'Trip cancelled'
    if (trip.routeStatus === TripInstanceStatus.IN_PROGRESS) return 'In progress'
    return 'Seat confirmed'
  }

  private pushToBucket(
    row: PassengerMyTripOverviewRow,
    trip: TripInstance,
    requestStatus: string,
    pending: PassengerMyTripOverviewRow[],
    upcoming: PassengerMyTripOverviewRow[],
    past: PassengerMyTripOverviewRow[]
  ) {
    const bucket = this.classifyBucket(trip, requestStatus)
    if (bucket === 'pending') pending.push(row)
    else if (bucket === 'upcoming') upcoming.push(row)
    else past.push(row)
  }

  private pushToBucketForPassenger(
    row: PassengerMyTripOverviewRow,
    trip: TripInstance,
    tp: TripPassenger,
    upcoming: PassengerMyTripOverviewRow[],
    past: PassengerMyTripOverviewRow[]
  ) {
    if (tp.status === TripPassengerStatus.CANCELLED) {
      past.push(row)
      return
    }
    if (
      trip.routeStatus === TripInstanceStatus.COMPLETED ||
      trip.routeStatus === TripInstanceStatus.CANCELLED
    ) {
      past.push(row)
      return
    }
    upcoming.push(row)
  }

  /**
   * Pending: open request on an active trip.
   * Past: declined/cancelled request, or dead trip, or pending on cancelled/completed trip.
   */
  private classifyBucket(
    trip: TripInstance,
    requestStatus: string
  ): 'pending' | 'upcoming' | 'past' {
    const terminalTrip =
      trip.routeStatus === TripInstanceStatus.COMPLETED ||
      trip.routeStatus === TripInstanceStatus.CANCELLED

    if (requestStatus === TripRequestStatus.DECLINED || requestStatus === TripRequestStatus.CANCELLED) {
      return 'past'
    }

    if (requestStatus === TripRequestStatus.PENDING) {
      if (terminalTrip) return 'past'
      return 'pending'
    }

    if (requestStatus === TripRequestStatus.ACCEPTED) {
      if (terminalTrip) return 'past'
      if (
        trip.routeStatus === TripInstanceStatus.SCHEDULED ||
        trip.routeStatus === TripInstanceStatus.IN_PROGRESS
      ) {
        return 'upcoming'
      }
      return 'past'
    }

    return 'past'
  }
}
