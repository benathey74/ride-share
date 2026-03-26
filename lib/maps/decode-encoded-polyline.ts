import type { LatLngLiteral } from "@/lib/maps/parse-lat-lng";

/**
 * Decodes a Google-encoded polyline string to lat/lng points (no Maps API required).
 * @see https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
export function decodeGoogleEncodedPolyline(encoded: string): LatLngLiteral[] {
  const trimmed = encoded.trim();
  if (!trimmed) return [];

  const path: LatLngLiteral[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < trimmed.length) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = trimmed.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = trimmed.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    path.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return path;
}
