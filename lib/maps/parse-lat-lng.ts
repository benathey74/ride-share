export type LatLngLiteral = { lat: number; lng: number };

/** Parses stored decimal strings into WGS84 numbers, or null if invalid. */
export function parseLatLng(latStr: string, lngStr: string): LatLngLiteral | null {
  const lat = Number(String(latStr).trim());
  const lng = Number(String(lngStr).trim());
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

export function hasValidLatLng(latStr: string, lngStr: string): boolean {
  return parseLatLng(latStr, lngStr) !== null;
}
