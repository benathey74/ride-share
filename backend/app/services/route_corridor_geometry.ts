import { haversineMeters } from '#services/geo_haversine'

export type CorridorLatLng = { lat: number; lng: number }

/**
 * Decodes a Google-encoded polyline to WGS84 points.
 * @see https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
export function decodeGoogleEncodedPolyline(encoded: string): CorridorLatLng[] {
  const trimmed = encoded.trim()
  if (!trimmed) return []

  const path: CorridorLatLng[] = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < trimmed.length) {
    let b: number
    let shift = 0
    let result = 0
    do {
      b = trimmed.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1
    lat += dlat

    shift = 0
    result = 0
    do {
      b = trimmed.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1
    lng += dlng

    path.push({ lat: lat / 1e5, lng: lng / 1e5 })
  }

  return path
}

/**
 * Local tangent-plane distance from P to closest point on segment AB (meters).
 * Adequate for carpool corridor matching (<~200 km segments).
 */
function distancePointToSegmentMeters(
  latP: number,
  lngP: number,
  latA: number,
  lngA: number,
  latB: number,
  lngB: number
): number {
  const lat0 = (latP + latA + latB) / 3
  const lng0 = (lngP + lngA + lngB) / 3
  const cos0 = Math.cos((lat0 * Math.PI) / 180)
  const R = 6_371_000
  const x = (lng: number) => ((R * ((lng - lng0) * Math.PI)) / 180) * cos0
  const y = (lat: number) => (R * ((lat - lat0) * Math.PI)) / 180

  const px = x(lngP)
  const py = y(latP)
  const ax = x(lngA)
  const ay = y(latA)
  const bx = x(lngB)
  const by = y(latB)
  const abx = bx - ax
  const aby = by - ay
  const apx = px - ax
  const apy = py - ay
  const ab2 = abx * abx + aby * aby
  const t = ab2 < 1e-6 ? 0 : Math.max(0, Math.min(1, (apx * abx + apy * aby) / ab2))
  const cx = ax + t * abx
  const cy = ay + t * aby
  return Math.hypot(px - cx, py - cy)
}

/** Minimum distance from a point to any segment of the polyline (meters). */
export function minDistanceMetersPointToPolyline(
  lat: number,
  lng: number,
  points: CorridorLatLng[]
): number {
  if (points.length === 0) {
    return Number.POSITIVE_INFINITY
  }
  if (points.length === 1) {
    return haversineMeters(lat, lng, points[0].lat, points[0].lng)
  }
  let minM = Number.POSITIVE_INFINITY
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    const d = distancePointToSegmentMeters(lat, lng, a.lat, a.lng, b.lat, b.lng)
    if (d < minM) {
      minM = d
    }
  }
  return minM
}

/**
 * Keeps vertices from the start of the tail portion (last `tailFraction` of path length).
 */
export function slicePolylineTailByLength(
  points: CorridorLatLng[],
  tailFraction: number
): CorridorLatLng[] {
  if (points.length < 2) {
    return points
  }
  const f = Math.min(0.5, Math.max(0.08, tailFraction))
  const segLens: number[] = []
  let total = 0
  for (let i = 0; i < points.length - 1; i++) {
    const L = haversineMeters(points[i].lat, points[i].lng, points[i + 1].lat, points[i + 1].lng)
    segLens.push(L)
    total += L
  }
  if (total <= 1) {
    return points.slice(-2)
  }
  const target = total * f
  let acc = 0
  let startIdx = 0
  for (let i = segLens.length - 1; i >= 0; i--) {
    acc += segLens[i]!
    if (acc >= target) {
      startIdx = i
      break
    }
  }
  return points.slice(startIdx)
}
