import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { getPublicGoogleMapsApiKey } from "@/lib/maps/env";

let loadPromise: Promise<void> | null = null;
let mapLibPromise: Promise<void> | null = null;

function assertBrowserMapsKey(): string {
  if (typeof window === "undefined") {
    throw new Error("Google Maps can only load in the browser");
  }
  const apiKey = getPublicGoogleMapsApiKey();
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing or empty");
  }
  return apiKey;
}

/**
 * Loads the Maps JavaScript API with the Places library (singleton per page session).
 * Uses `@googlemaps/js-api-loader` v2 `setOptions` + `importLibrary`.
 */
export function loadGoogleMapsPlaces(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser"));
  }
  if (window.google?.maps?.places) {
    return Promise.resolve();
  }
  let apiKey: string;
  try {
    apiKey = assertBrowserMapsKey();
  } catch (e) {
    return Promise.reject(e);
  }
  if (!loadPromise) {
    loadPromise = (async () => {
      setOptions({
        key: apiKey,
        v: "weekly",
        libraries: ["places"],
      });
      await importLibrary("places");
    })();
  }
  return loadPromise;
}

/**
 * Loads the Maps JavaScript `maps` library for `Map`, `Marker`, `Circle`, etc.
 * Safe to call after or before {@link loadGoogleMapsPlaces} — `setOptions` is idempotent.
 */
export function loadGoogleMapsMapLibraries(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser"));
  }
  if (window.google?.maps?.Map) {
    return Promise.resolve();
  }
  let apiKey: string;
  try {
    apiKey = assertBrowserMapsKey();
  } catch (e) {
    return Promise.reject(e);
  }
  if (!mapLibPromise) {
    mapLibPromise = (async () => {
      setOptions({
        key: apiKey,
        v: "weekly",
        libraries: ["places"],
      });
      await importLibrary("maps");
    })();
  }
  return mapLibPromise;
}
