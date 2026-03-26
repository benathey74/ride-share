import type RouteTemplate from '#models/route_template'
import PrivacyViewService from '#services/privacy_view_service'
import { computePassengerRouteCorridorMetrics } from '#services/passenger_route_corridor_metrics'

const privacy = new PrivacyViewService()

/** Minimum corridor match radius when template pickup radius is small (meters). */
export const MIN_PICKUP_MATCH_M = 2500
/** How close the rider's destination must be to the template destination or route tail (meters). */
export const DESTINATION_MATCH_M = 12_000

export type PassengerRouteSearchCoords = {
  pickupLat: number
  pickupLng: number
  destLat: number
  destLng: number
}

/** Re-export for callers that already import from this module. */
export { haversineMeters } from '#services/geo_haversine'

function firstQsValue(v: string | string[] | undefined): string {
  if (v === undefined) return ''
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? ''
}

/**
 * Parses optional GET query params. When all four coordinates parse as finite numbers,
 * returns a filter; otherwise returns null (list all active templates — backward compatible).
 */
export function parsePassengerRouteSearchQuery(
  raw: Record<string, string | string[] | undefined>
): PassengerRouteSearchCoords | null {
  const pickupLat = firstQsValue(raw.pickupLat)
  const pickupLng = firstQsValue(raw.pickupLng)
  const destLat = firstQsValue(raw.destinationLat)
  const destLng = firstQsValue(raw.destinationLng)
  if (!pickupLat || !pickupLng || !destLat || !destLng) {
    return null
  }
  const plat = Number(pickupLat)
  const plng = Number(pickupLng)
  const dlat = Number(destLat)
  const dlng = Number(destLng)
  if (![plat, plng, dlat, dlng].every(Number.isFinite)) {
    return null
  }
  return { pickupLat: plat, pickupLng: plng, destLat: dlat, destLng: dlng }
}

/**
 * True when the rider’s pickup is within the expanded pickup cap along the **origin or the stored
 * polyline corridor**, and the destination is within cap of the **template destination or the final
 * segment of the polyline** (approximate drop-off band).
 */
export function templateMatchesPassengerSearch(
  template: RouteTemplate,
  search: PassengerRouteSearchCoords
): boolean {
  const oLat = Number(template.originLat)
  const oLng = Number(template.originLng)
  const dLat = Number(template.destinationLat)
  const dLng = Number(template.destinationLng)
  if (![oLat, oLng, dLat, dLng].every(Number.isFinite)) {
    return false
  }

  const metrics = computePassengerRouteCorridorMetrics(template, search)
  const pickupAllowM = Math.max(privacy.templatePickupRadiusMeters(template), MIN_PICKUP_MATCH_M)

  return metrics.pickupEffectiveM <= pickupAllowM && metrics.destEffectiveM <= DESTINATION_MATCH_M
}
