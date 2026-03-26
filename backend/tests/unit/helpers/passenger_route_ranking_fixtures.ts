import { DateTime } from 'luxon'
import type RouteTemplate from '#models/route_template'
import type TripInstance from '#models/trip_instance'
import { TripInstanceStatus } from '#constants/trip'
import { DESTINATION_MATCH_M } from '#services/passenger_route_search_filter'
import type { PassengerRouteSearchCoords } from '#services/passenger_route_search_filter'
import type { RouteSuggestionRankInput } from '#services/passenger_route_suggestion_ranking'

/** Fixed anchor for repeatable geo tests (~San Francisco). */
export const ANCHOR_ORIGIN_LAT = 37.7749
export const ANCHOR_ORIGIN_LNG = -122.4194
/** Second point ~1.2 km away — used as template destination. */
export const ANCHOR_DEST_LAT = 37.7858
export const ANCHOR_DEST_LNG = -122.408

/** Approximate north offset in degrees for a given distance in meters (mid-latitude). */
export function offsetNorthMeters(lat: number, meters: number): number {
  return lat + meters / 111_320
}

export type PlainSchedule = { dayOfWeek: number; isActive: boolean }

/**
 * Minimal `RouteTemplate` shape used by ranking (no DB).
 * Coordinates are strings, matching Lucid column types.
 */
export function makeRouteTemplate(
  overrides: {
    id?: number
    originLat?: number
    originLng?: number
    destinationLat?: number
    destinationLng?: number
    scheduleType?: string
    schedules?: PlainSchedule[]
  } = {}
): RouteTemplate {
  const {
    id = 1,
    originLat = ANCHOR_ORIGIN_LAT,
    originLng = ANCHOR_ORIGIN_LNG,
    destinationLat = ANCHOR_DEST_LAT,
    destinationLng = ANCHOR_DEST_LNG,
    scheduleType = 'one_off',
    schedules = [],
  } = overrides

  return {
    id,
    originLat: String(originLat),
    originLng: String(originLng),
    destinationLat: String(destinationLat),
    destinationLng: String(destinationLng),
    scheduleType,
    schedules: schedules as RouteTemplate['schedules'],
  } as RouteTemplate
}

/**
 * Minimal `TripInstance` for ranking (departure parsing uses `tripDate` + `departureTime`).
 */
export function makeTripInstance(
  overrides: {
    tripDate?: DateTime
    departureTime?: string
    seatsTotal?: number
    seatsRemaining?: number
    routeStatus?: string
  } = {}
): TripInstance {
  const {
    tripDate = DateTime.fromObject({ year: 2026, month: 1, day: 7 }, { zone: 'utc' }),
    departureTime = '08:00:00',
    seatsTotal = 4,
    seatsRemaining = 2,
    routeStatus = TripInstanceStatus.SCHEDULED,
  } = overrides

  return {
    tripDate,
    departureTime,
    seatsTotal,
    seatsRemaining,
    routeStatus,
  } as TripInstance
}

export function makeSearch(
  overrides: {
    pickupLat?: number
    pickupLng?: number
    destLat?: number
    destLng?: number
  } = {}
): PassengerRouteSearchCoords {
  return {
    pickupLat: overrides.pickupLat ?? ANCHOR_ORIGIN_LAT,
    pickupLng: overrides.pickupLng ?? ANCHOR_ORIGIN_LNG,
    destLat: overrides.destLat ?? ANCHOR_DEST_LAT,
    destLng: overrides.destLng ?? ANCHOR_DEST_LNG,
  }
}

const DEFAULT_NOW = DateTime.fromObject({ year: 2026, month: 1, day: 6, hour: 12 }, { zone: 'utc' })

/**
 * Baseline rank input: search aligned with template origin/destination, bookable scheduled trip,
 * generous caps. Override fields for focused assertions.
 */
export function buildRankInput(
  overrides: Partial<Omit<RouteSuggestionRankInput, 'template' | 'search' | 'nextTrip'>> & {
    template?: RouteTemplate
    search?: PassengerRouteSearchCoords | null
    nextTrip?: TripInstance | null
  } = {}
): RouteSuggestionRankInput {
  const {
    template = makeRouteTemplate(),
    search = makeSearch(),
    nextTrip = makeTripInstance(),
    now = DEFAULT_NOW,
    pickupAllowMeters = 2500,
    destinationMatchMaxMeters = DESTINATION_MATCH_M,
    corridorPickupRadiusMeters = 400,
  } = overrides

  return {
    template,
    search,
    nextTrip,
    now,
    pickupAllowMeters,
    destinationMatchMaxMeters,
    corridorPickupRadiusMeters,
  }
}
