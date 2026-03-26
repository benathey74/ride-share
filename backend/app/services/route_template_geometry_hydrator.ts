import RouteTemplate from '#models/route_template'
import { fetchDrivingRouteGeometry } from '#services/google_directions_route_service'
import { buildSyntheticDrivingRouteGeometry } from '#services/synthetic_route_geometry'

export type HydratedGeometry = {
  routePolyline: string
  totalDistanceMeters: number
  totalDurationSeconds: number
  source: 'directions_api' | 'synthetic'
}

/**
 * Fills `route_polyline`, distance, and duration on a template row.
 * Prefers Google Directions when `GOOGLE_MAPS_SERVER_API_KEY` is set; otherwise uses a
 * synthetic straight-line polyline so maps always have something to draw in dev/alpha.
 */
export async function resolveRouteTemplateGeometry(input: {
  originLat: number
  originLng: number
  destinationLat: number
  destinationLng: number
}): Promise<HydratedGeometry> {
  const fromApi = await fetchDrivingRouteGeometry(input)
  if (fromApi) {
    return {
      routePolyline: fromApi.encodedPolyline,
      totalDistanceMeters: fromApi.distanceMeters,
      totalDurationSeconds: fromApi.durationSeconds,
      source: 'directions_api',
    }
  }
  const syn = buildSyntheticDrivingRouteGeometry(
    input.originLat,
    input.originLng,
    input.destinationLat,
    input.destinationLng,
  )
  return {
    routePolyline: syn.encodedPolyline,
    totalDistanceMeters: syn.distanceMeters,
    totalDurationSeconds: syn.durationSeconds,
    source: 'synthetic',
  }
}

/** Persists geometry on an existing `RouteTemplate` model instance. */
export async function hydrateRouteTemplateGeometry(template: RouteTemplate): Promise<HydratedGeometry> {
  const oLat = Number.parseFloat(template.originLat)
  const oLng = Number.parseFloat(template.originLng)
  const dLat = Number.parseFloat(template.destinationLat)
  const dLng = Number.parseFloat(template.destinationLng)
  if (
    !Number.isFinite(oLat) ||
    !Number.isFinite(oLng) ||
    !Number.isFinite(dLat) ||
    !Number.isFinite(dLng)
  ) {
    throw new Error('Route template has invalid endpoint coordinates')
  }
  const geom = await resolveRouteTemplateGeometry({
    originLat: oLat,
    originLng: oLng,
    destinationLat: dLat,
    destinationLng: dLng,
  })
  template.merge({
    routePolyline: geom.routePolyline,
    totalDistanceMeters: geom.totalDistanceMeters,
    totalDurationSeconds: geom.totalDurationSeconds,
  })
  await template.save()
  return geom
}
