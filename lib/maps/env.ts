/**
 * Browser-only Maps key (inlined at build time). See `.env.example` and FRONTEND_LOCAL_SETUP.md.
 */
export function getPublicGoogleMapsApiKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (typeof key !== "string" || !key.trim()) return undefined;
  return key.trim();
}
