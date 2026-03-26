import env from '#start/env'

export type DrivingRouteGeometry = {
  encodedPolyline: string
  distanceMeters: number
  durationSeconds: number
}

type DirectionsResponse = {
  status: string
  routes?: Array<{
    overview_polyline?: { points?: string }
    legs?: Array<{ distance?: { value: number }; duration?: { value: number } }>
  }>
  error_message?: string
}

/**
 * Fetches driving directions between two WGS84 points and returns overview polyline + totals.
 * Returns `null` when the key is missing, the request fails, or Google returns no route.
 */
export async function fetchDrivingRouteGeometry(input: {
  originLat: number
  originLng: number
  destinationLat: number
  destinationLng: number
}): Promise<DrivingRouteGeometry | null> {
  const apiKey = env.get('GOOGLE_MAPS_SERVER_API_KEY')
  const keyTrim = apiKey?.trim()
  if (!keyTrim) {
    return null
  }

  const origin = `${input.originLat},${input.originLng}`
  const destination = `${input.destinationLat},${input.destinationLng}`
  const params = new URLSearchParams({
    origin,
    destination,
    mode: 'driving',
    key: keyTrim,
  })

  const url = `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`

  let json: DirectionsResponse
  try {
    const res = await fetch(url)
    json = (await res.json()) as DirectionsResponse
  } catch {
    return null
  }

  if (json.status !== 'OK' || !json.routes?.length) {
    return null
  }

  const route = json.routes[0]
  const encoded = route.overview_polyline?.points
  if (!encoded) {
    return null
  }

  let distanceMeters = 0
  let durationSeconds = 0
  for (const leg of route.legs ?? []) {
    distanceMeters += leg.distance?.value ?? 0
    durationSeconds += leg.duration?.value ?? 0
  }

  return {
    encodedPolyline: encoded,
    distanceMeters,
    durationSeconds,
  }
}
