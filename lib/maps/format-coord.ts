/** Stable decimal strings for API validators (max length well under 32). */
export function formatCoord(value: number): string {
  return String(Number(value.toFixed(7)));
}
