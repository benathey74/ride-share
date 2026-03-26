/**
 * Fallback route geometry when `GOOGLE_MAPS_SERVER_API_KEY` is unset (e.g. CI, fresh seed).
 * Uses a straight-line path in WGS84 (encoded like Directions overview) and rough driving
 * distance/duration estimates — good enough for map previews and alpha demos, not navigation.
 */

function encodeSigned(sNum: number): string {
  let sgnNum = sNum << 1
  if (sNum < 0) {
    sgnNum = ~sgnNum
  }
  let result = ''
  while (sgnNum >= 0x20) {
    result += String.fromCharCode((0x20 | (sgnNum & 0x1f)) + 63)
    sgnNum >>= 5
  }
  result += String.fromCharCode(sgnNum + 63)
  return result
}

function encodePath(points: Array<{ lat: number; lng: number }>): string {
  let lastLat = 0
  let lastLng = 0
  let enc = ''
  for (const p of points) {
    const lat = Math.round(p.lat * 1e5)
    const lng = Math.round(p.lng * 1e5)
    const dLat = lat - lastLat
    const dLng = lng - lastLng
    lastLat = lat
    lastLng = lng
    enc += encodeSigned(dLat) + encodeSigned(dLng)
  }
  return enc
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function interpolate(
  oLat: number,
  oLng: number,
  dLat: number,
  dLng: number,
  segments: number,
): Array<{ lat: number; lng: number }> {
  const out: Array<{ lat: number; lng: number }> = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    out.push({
      lat: oLat + (dLat - oLat) * t,
      lng: oLng + (dLng - oLng) * t,
    })
  }
  return out
}

export type SyntheticRouteGeometry = {
  encodedPolyline: string
  distanceMeters: number
  durationSeconds: number
}

/** Straight-line polyline + inflated distance (~1.35× geodesic) and ~30 km/h implied duration. */
export function buildSyntheticDrivingRouteGeometry(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
): SyntheticRouteGeometry {
  const path = interpolate(originLat, originLng, destLat, destLng, 28)
  const crow = haversineMeters(originLat, originLng, destLat, destLng)
  const distanceMeters = Math.max(1, Math.round(crow * 1.35))
  const speedMs = (30 * 1000) / 3600
  const durationSeconds = Math.max(60, Math.round(distanceMeters / speedMs))
  return {
    encodedPolyline: encodePath(path),
    distanceMeters,
    durationSeconds,
  }
}
