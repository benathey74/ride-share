import { TripPassengerStatus, TripRequestStatus } from '#constants/trip'
import type PublicProfile from '#models/public_profile'
import type { PassengerRouteMatchHint } from '#services/passenger_route_corridor_metrics'
import type RouteTemplate from '#models/route_template'
import type TripInstance from '#models/trip_instance'
import type TripPassenger from '#models/trip_passenger'
import type TripRequest from '#models/trip_request'

/** Safe for passenger/driver shared UI — never includes real names. */
export type PublicIdentityDto = {
  alias: string
  avatar: string
  /** Alias for older clients that still expect `avatarEmoji`. */
  avatarEmoji: string
}

export type PickupPublicDto = {
  approximateLabel: string
  /**
   * Rider-submitted fuzz (same privacy class as approximateLabel). Lets maps place the blue circle
   * on the rider’s chosen area instead of only the template origin.
   */
  approximateArea?: {
    latitude: string
    longitude: string
    radiusMeters: number
  }
  exact?: {
    latitude: string
    longitude: string
    label?: string | null
  }
}

export const DEFAULT_TEMPLATE_PICKUP_RADIUS_M = 400

/**
 * Centralizes alias/avatar formatting, approximate pickup copy, exact-pickup visibility,
 * and public DTO shaping for trips and requests.
 */
export default class PrivacyViewService {
  /** Template-level pickup fuzz, or default when unset in DB. */
  templatePickupRadiusMeters(template: RouteTemplate | null | undefined): number {
    const v = template?.pickupRadiusMeters
    if (v != null && Number.isFinite(v) && v >= 50 && v <= 5000) {
      return v
    }
    return DEFAULT_TEMPLATE_PICKUP_RADIUS_M
  }

  formatPublicProfile(profile: PublicProfile | null): PublicIdentityDto | null {
    if (!profile) {
      return null
    }
    return {
      alias: profile.alias,
      avatar: profile.avatar,
      avatarEmoji: profile.avatar,
    }
  }

  approximatePickupLabel(areaLabel: string, radiusMeters: number): string {
    return `Near ${areaLabel} (~${radiusMeters}m)`
  }

  canSeeExactPassengerPickup(
    tripRequest: Pick<TripRequest, 'status' | 'riderUserId'>,
    viewerUserId: number,
    driverUserId: number
  ): boolean {
    if (tripRequest.status !== TripRequestStatus.ACCEPTED) {
      return false
    }
    return tripRequest.riderUserId === viewerUserId || driverUserId === viewerUserId
  }

  shapePickupFromTripRequest(
    tripRequest: TripRequest,
    viewerUserId: number,
    driverUserId: number
  ): PickupPublicDto {
    const approximateLabel = this.approximatePickupLabel(
      tripRequest.approxPickupLabel,
      tripRequest.approxPickupRadiusMeters
    )
    const approxLat = Number(tripRequest.approxPickupLat)
    const approxLng = Number(tripRequest.approxPickupLng)
    const hasApproxCoords = Number.isFinite(approxLat) && Number.isFinite(approxLng)
    const approxRadius = Math.max(
      50,
      Number.isFinite(tripRequest.approxPickupRadiusMeters)
        ? tripRequest.approxPickupRadiusMeters
        : DEFAULT_TEMPLATE_PICKUP_RADIUS_M
    )
    const approximateArea =
      hasApproxCoords
        ? {
            latitude: String(approxLat),
            longitude: String(approxLng),
            radiusMeters: approxRadius,
          }
        : undefined

    if (!this.canSeeExactPassengerPickup(tripRequest, viewerUserId, driverUserId)) {
      return { approximateLabel, ...(approximateArea ? { approximateArea } : {}) }
    }
    if (tripRequest.exactPickupLat !== null && tripRequest.exactPickupLng !== null) {
      return {
        approximateLabel,
        ...(approximateArea ? { approximateArea } : {}),
        exact: {
          latitude: tripRequest.exactPickupLat,
          longitude: tripRequest.exactPickupLng,
          label: tripRequest.exactPickupLabel,
        },
      }
    }
    return { approximateLabel, ...(approximateArea ? { approximateArea } : {}) }
  }

  /**
   * Rider viewing their own seat booking (trip_passengers row). Exact coords only when
   * confirmed and stored — never exposes other riders' data.
   */
  shapePickupFromTripPassengerForRider(
    passenger: TripPassenger,
    corridorOriginLabel: string,
    corridorRadiusM: number
  ): PickupPublicDto {
    const baseLabel = passenger.confirmedPickupLabel ?? corridorOriginLabel
    const approximateLabel = this.approximatePickupLabel(baseLabel, corridorRadiusM)
    if (
      passenger.status === TripPassengerStatus.CONFIRMED &&
      passenger.confirmedPickupLat !== null &&
      passenger.confirmedPickupLng !== null &&
      passenger.confirmedPickupLat !== '' &&
      passenger.confirmedPickupLng !== ''
    ) {
      return {
        approximateLabel,
        exact: {
          latitude: passenger.confirmedPickupLat,
          longitude: passenger.confirmedPickupLng,
          label: passenger.confirmedPickupLabel,
        },
      }
    }
    return { approximateLabel }
  }

  shapeTripRequestPublic(
    tripRequest: TripRequest,
    viewerUserId: number,
    driverUserId: number,
    riderPublicProfile: PublicProfile | null
  ) {
    return {
      id: String(tripRequest.id),
      tripInstanceId: String(tripRequest.tripInstanceId),
      status: tripRequest.status,
      rider: this.formatPublicProfile(riderPublicProfile),
      pickup: this.shapePickupFromTripRequest(tripRequest, viewerUserId, driverUserId),
      message: tripRequest.message,
      createdAt: tripRequest.createdAt,
      updatedAt: tripRequest.updatedAt,
      respondedAt: tripRequest.respondedAt,
    }
  }

  /** Driver-facing row for a request on their trip (pickup rules match trip_request status). */
  shapeTripRequestForDriver(
    tripRequest: TripRequest,
    driverUserId: number,
    riderPublicProfile: PublicProfile | null
  ) {
    return this.shapeTripRequestPublic(tripRequest, driverUserId, driverUserId, riderPublicProfile)
  }

  templateDepartureWindowLabel(scheduleType: string, departureTime: string): string {
    const t = departureTime.slice(0, 5)
    if (scheduleType === 'one_off') {
      return `Departs · ${t}`
    }
    return `Recurring · ${t}`
  }

  shapeRouteSuggestionRow(input: {
    templateId: number
    originLabel: string
    destinationLabel: string
    originLat: string
    originLng: string
    destinationLat: string
    destinationLng: string
    departureWindowLabel: string
    driverPublicProfile: PublicProfile | null
    pickupRadiusMeters?: number
    /** Template-level driving geometry (not trip-instance lifecycle). */
    routePolyline?: string | null
    totalDistanceMeters?: number | null
    totalDurationSeconds?: number | null
    /** Search-relative quality hints (stable keys); omitted when not searching or no hints. */
    matchHints?: PassengerRouteMatchHint[]
  }) {
    const radius = input.pickupRadiusMeters ?? DEFAULT_TEMPLATE_PICKUP_RADIUS_M
    return {
      routeTemplateId: String(input.templateId),
      name: `${input.originLabel} ↔ ${input.destinationLabel}`,
      host: this.formatPublicProfile(input.driverPublicProfile),
      departureWindowLabel: input.departureWindowLabel,
      pickupAreaLabel: input.originLabel,
      pickupFuzzRadiusM: radius,
      destinationLabel: input.destinationLabel,
      /** Corridor center — safe approximate anchor for seat requests (not rider exact pin). */
      approxPickupLat: input.originLat,
      approxPickupLng: input.originLng,
      /** Corridor destination — same visibility class as origin (published route). */
      destinationLat: input.destinationLat,
      destinationLng: input.destinationLng,
      routePolyline: input.routePolyline ?? null,
      totalDistanceMeters: input.totalDistanceMeters ?? null,
      totalDurationSeconds: input.totalDurationSeconds ?? null,
      matchHints: input.matchHints && input.matchHints.length > 0 ? input.matchHints : undefined,
    }
  }

  shapePassengerTripDetail(input: {
    trip: TripInstance
    viewerUserId: number
    driverPublicProfile: PublicProfile | null
    viewerRequests: TripRequest[]
    templateOriginLabel: string | null
    templatePickupRadiusM: number
  }) {
    const { trip, viewerUserId, driverPublicProfile, viewerRequests, templateOriginLabel } = input
    const driverUserId = trip.driverUserId

    return {
      tripInstanceId: String(trip.id),
      routeStatus: trip.routeStatus,
      tripDate: trip.tripDate,
      departureTime: trip.departureTime,
      seatsTotal: trip.seatsTotal,
      seatsRemaining: trip.seatsRemaining,
      host: this.formatPublicProfile(driverPublicProfile),
      destinationLabel: trip.routeTemplate?.destinationLabel ?? 'Destination (see route template)',
      route: {
        approximatePickupLabel: this.approximatePickupLabel(
          templateOriginLabel ?? 'Pickup area',
          input.templatePickupRadiusM
        ),
        /** Published corridor endpoints (not the rider’s exact pin). */
        originLat: trip.routeTemplate?.originLat ?? '',
        originLng: trip.routeTemplate?.originLng ?? '',
        destinationLat: trip.routeTemplate?.destinationLat ?? '',
        destinationLng: trip.routeTemplate?.destinationLng ?? '',
        pickupFuzzRadiusM: input.templatePickupRadiusM,
        /** Prefer instance geometry when present (concrete run), else template. */
        routePolyline: trip.routePolyline ?? trip.routeTemplate?.routePolyline ?? null,
        totalDistanceMeters:
          trip.totalDistanceMeters ?? trip.routeTemplate?.totalDistanceMeters ?? null,
        totalDurationSeconds:
          trip.totalDurationSeconds ?? trip.routeTemplate?.totalDurationSeconds ?? null,
      },
      myRequests: viewerRequests.map((r) =>
        this.shapeTripRequestPublic(r, viewerUserId, driverUserId, r.rider.publicProfile ?? null)
      ),
    }
  }

  /**
   * Public browse DTO for a trip instance: corridor + timing + seats only.
   * Never includes other riders, messages, or exact pickup. Seat-request defaults use the published
   * template origin (same privacy class as route search), not rider-specific pins.
   */
  shapePassengerTripBrowse(input: {
    trip: TripInstance
    driverPublicProfile: PublicProfile | null
    templateOriginLabel: string | null
    templatePickupRadiusM: number
    canRequestSeat: boolean
    viewerIsDriver: boolean
    viewerMayOpenPrivateDetail: boolean
    viewerSeatRequestStatus: string | null
  }) {
    const { trip, driverPublicProfile, templateOriginLabel, templatePickupRadiusM } = input
    const originLat = trip.routeTemplate?.originLat ?? ''
    const originLng = trip.routeTemplate?.originLng ?? ''

    return {
      tripInstanceId: String(trip.id),
      routeStatus: trip.routeStatus,
      tripDate: trip.tripDate,
      departureTime: trip.departureTime,
      seatsTotal: trip.seatsTotal,
      seatsRemaining: trip.seatsRemaining,
      host: this.formatPublicProfile(driverPublicProfile),
      destinationLabel: trip.routeTemplate?.destinationLabel ?? 'Destination (see route template)',
      route: {
        approximatePickupLabel: this.approximatePickupLabel(
          templateOriginLabel ?? 'Pickup area',
          templatePickupRadiusM
        ),
        originLat,
        originLng,
        destinationLat: trip.routeTemplate?.destinationLat ?? '',
        destinationLng: trip.routeTemplate?.destinationLng ?? '',
        pickupFuzzRadiusM: templatePickupRadiusM,
        routePolyline: trip.routePolyline ?? trip.routeTemplate?.routePolyline ?? null,
        totalDistanceMeters:
          trip.totalDistanceMeters ?? trip.routeTemplate?.totalDistanceMeters ?? null,
        totalDurationSeconds:
          trip.totalDurationSeconds ?? trip.routeTemplate?.totalDurationSeconds ?? null,
      },
      canRequestSeat: input.canRequestSeat,
      viewerIsDriver: input.viewerIsDriver,
      viewerMayOpenPrivateDetail: input.viewerMayOpenPrivateDetail,
      viewerSeatRequestStatus: input.viewerSeatRequestStatus,
      seatRequestDefaults: {
        approxPickupLabel: templateOriginLabel ?? 'Pickup area',
        approxPickupLat: originLat,
        approxPickupLng: originLng,
        approxPickupRadiusMeters: templatePickupRadiusM,
      },
    }
  }
}
