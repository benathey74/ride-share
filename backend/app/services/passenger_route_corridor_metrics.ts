import type RouteTemplate from '#models/route_template'
import { haversineMeters } from '#services/geo_haversine'
import type { CorridorLatLng } from '#services/route_corridor_geometry'
import {
  decodeGoogleEncodedPolyline,
  minDistanceMetersPointToPolyline,
  slicePolylineTailByLength,
} from '#services/route_corridor_geometry'
import type { PassengerRouteSearchCoords } from '#services/passenger_route_search_filter'

/** Last fraction of polyline length used as “destination / drop-off corridor” anchor. */
export const DESTINATION_TAIL_LENGTH_FRACTION = 0.32

export type PassengerRouteCorridorMetrics = {
  pickupDistOriginM: number
  /** Min distance from rider pickup to driving polyline; null if no usable polyline. */
  pickupDistCorridorM: number | null
  destDistAnchorM: number
  /** Min distance from rider destination to tail of polyline; null if no usable polyline. */
  destDistTailM: number | null
  /** `min(origin, corridor)` — used for threshold + pickup score. */
  pickupEffectiveM: number
  /** `min(template dest, tail)` — used for threshold + destination score. */
  destEffectiveM: number
  hasPolyline: boolean
}

function templatePolylinePoints(template: RouteTemplate): CorridorLatLng[] | null {
  const raw = template.routePolyline?.trim()
  if (!raw) {
    return null
  }
  const pts = decodeGoogleEncodedPolyline(raw)
  return pts.length >= 2 ? pts : null
}

/**
 * Corridor-aware distances for filter + ranking. When `route_polyline` is missing or degenerate,
 * falls back to origin/destination anchors only (same as legacy behavior).
 */
export function computePassengerRouteCorridorMetrics(
  template: RouteTemplate,
  search: PassengerRouteSearchCoords
): PassengerRouteCorridorMetrics {
  const oLat = Number(template.originLat)
  const oLng = Number(template.originLng)
  const dLat = Number(template.destinationLat)
  const dLng = Number(template.destinationLng)

  const pickupDistOriginM = haversineMeters(search.pickupLat, search.pickupLng, oLat, oLng)
  const destDistAnchorM = haversineMeters(search.destLat, search.destLng, dLat, dLng)

  const poly = templatePolylinePoints(template)
  if (!poly) {
    return {
      pickupDistOriginM,
      pickupDistCorridorM: null,
      destDistAnchorM,
      destDistTailM: null,
      pickupEffectiveM: pickupDistOriginM,
      destEffectiveM: destDistAnchorM,
      hasPolyline: false,
    }
  }

  const pickupDistCorridorM = minDistanceMetersPointToPolyline(
    search.pickupLat,
    search.pickupLng,
    poly
  )
  const tail = slicePolylineTailByLength(poly, DESTINATION_TAIL_LENGTH_FRACTION)
  const destDistTailM = minDistanceMetersPointToPolyline(search.destLat, search.destLng, tail)

  return {
    pickupDistOriginM,
    pickupDistCorridorM,
    destDistAnchorM,
    destDistTailM,
    pickupEffectiveM: Math.min(pickupDistOriginM, pickupDistCorridorM),
    destEffectiveM: Math.min(destDistAnchorM, destDistTailM),
    hasPolyline: true,
  }
}

export type PassengerRouteMatchHint = 'corridor_pickup' | 'pickup_zone' | 'corridor_destination'

/**
 * Lightweight, privacy-safe hints for UI (relative to the rider’s own search only).
 */
export function derivePassengerRouteMatchHints(
  metrics: PassengerRouteCorridorMetrics,
  corridorPickupRadiusMeters: number
): PassengerRouteMatchHint[] {
  const hints: PassengerRouteMatchHint[] = []
  const r = Math.max(50, corridorPickupRadiusMeters)

  if (metrics.pickupEffectiveM <= r) {
    hints.push('pickup_zone')
  }

  if (
    metrics.hasPolyline &&
    metrics.pickupDistCorridorM !== null &&
    metrics.pickupDistCorridorM + 75 < metrics.pickupDistOriginM
  ) {
    hints.push('corridor_pickup')
  }

  if (
    metrics.hasPolyline &&
    metrics.destDistTailM !== null &&
    metrics.destDistTailM + 120 < metrics.destDistAnchorM
  ) {
    hints.push('corridor_destination')
  }

  return hints
}
