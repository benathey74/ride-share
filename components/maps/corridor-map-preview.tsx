"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { decodeGoogleEncodedPolyline } from "@/lib/maps/decode-encoded-polyline";
import { getPublicGoogleMapsApiKey } from "@/lib/maps/env";
import { loadGoogleMapsMapLibraries } from "@/lib/maps/load-google-maps";
import type { LatLngLiteral } from "@/lib/maps/parse-lat-lng";
import { cn } from "@/lib/utils";

export type CorridorMapPreviewProps = {
  origin: LatLngLiteral;
  destination: LatLngLiteral;
  /** Green marker — start of published corridor. */
  originTitle?: string;
  /** Amber marker — route destination. */
  destinationTitle?: string;
  /** Google-encoded driving polyline (e.g. Directions overview); optional until backend stores it. */
  encodedPolyline?: string | null;
  /**
   * When true and no encoded polyline decodes, draws a straight geodesic between origin and
   * destination as a lighter “corridor estimate” (not road-accurate).
   */
  straightLineFallback?: boolean;
  approximatePickup?: { center: LatLngLiteral; radiusMeters: number } | null;
  exactPickup?: LatLngLiteral | null;
  exactPickupTitle?: string;
  variant?: "default" | "compact";
  /** Taller map for booked trip / trust surfaces. */
  emphasis?: boolean;
  className?: string;
  helperText?: string;
};

/** Static placeholder when coords or API are unavailable (reuse outside this component). */
export function CorridorMapPlaceholder({
  title,
  helperText,
  className,
}: {
  title: string;
  helperText?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted/80 via-muted/40 to-primary/10 px-4 text-center ring-1 ring-border",
        className,
      )}
      role="img"
      aria-label={title}
    >
      <MapPin className="h-7 w-7 text-muted-foreground" aria-hidden />
      <p className="text-sm font-medium text-foreground">{title}</p>
      {helperText ? (
        <p className="max-w-sm text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}

/**
 * Embedded Google Map: corridor markers, optional approximate pickup circle (privacy),
 * optional exact pickup marker when allowed.
 */
export function CorridorMapPreview({
  origin,
  destination,
  originTitle = "Route start",
  destinationTitle = "Destination",
  encodedPolyline,
  straightLineFallback = true,
  approximatePickup,
  exactPickup,
  exactPickupTitle = "Confirmed pickup",
  variant = "default",
  emphasis = false,
  helperText,
  className,
}: CorridorMapPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loadError, setLoadError] = useState(false);

  const noKey = !getPublicGoogleMapsApiKey();
  const heightClass =
    variant === "compact"
      ? "h-[104px] min-h-[104px]"
      : emphasis
        ? "h-[220px] min-h-[220px] sm:h-[260px]"
        : "h-[200px] min-h-[200px] sm:h-[220px]";

  useEffect(() => {
    if (noKey) return;
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;
    let mapInstance: google.maps.Map | null = null;
    const markers: google.maps.Marker[] = [];
    let circle: google.maps.Circle | null = null;
    let routeLine: google.maps.Polyline | null = null;
    let resizeObs: ResizeObserver | null = null;
    let bounds: google.maps.LatLngBounds | null = null;
    const pad = variant === "compact" ? 20 : 40;

    void (async () => {
      try {
        await loadGoogleMapsMapLibraries();
        if (cancelled || !el) return;

        mapInstance = new google.maps.Map(el, {
          center: origin,
          zoom: 11,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: "cooperative",
          keyboardShortcuts: false,
        });

        const mk = (pos: LatLngLiteral, title: string, color: string) => {
          const marker = new google.maps.Marker({
            map: mapInstance,
            position: pos,
            title,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: variant === "compact" ? 7 : 8,
              fillColor: color,
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
          });
          markers.push(marker);
        };

        let polyPath: LatLngLiteral[] | null = null;
        let routeIsFallbackStraight = false;
        if (encodedPolyline?.trim()) {
          const decoded = decodeGoogleEncodedPolyline(encodedPolyline.trim()).filter(
            (p) => Number.isFinite(p.lat) && Number.isFinite(p.lng),
          );
          if (decoded.length > 1) polyPath = decoded;
        }
        if (!polyPath && straightLineFallback) {
          polyPath = [origin, destination];
          routeIsFallbackStraight = true;
        }
        if (polyPath) {
          routeLine = new google.maps.Polyline({
            path: polyPath,
            geodesic: true,
            strokeColor: "#0f766e",
            strokeOpacity: routeIsFallbackStraight ? 0.42 : 0.92,
            strokeWeight: variant === "compact" ? 3 : routeIsFallbackStraight ? 3 : 4,
            map: mapInstance,
            zIndex: 0,
          });
        }

        mk(origin, originTitle, "#15803d");
        mk(destination, destinationTitle, "#b45309");

        if (exactPickup) {
          mk(exactPickup, exactPickupTitle, "#2563eb");
        } else if (approximatePickup && approximatePickup.radiusMeters > 0) {
          circle = new google.maps.Circle({
            map: mapInstance,
            center: approximatePickup.center,
            radius: approximatePickup.radiusMeters,
            fillColor: "#2563eb",
            fillOpacity: 0.1,
            strokeColor: "#2563eb",
            strokeOpacity: 0.45,
            strokeWeight: 1,
          });
        }

        bounds = new google.maps.LatLngBounds();
        if (polyPath) {
          for (const p of polyPath) bounds.extend(p);
        }
        bounds.extend(origin);
        bounds.extend(destination);
        if (exactPickup) bounds.extend(exactPickup);
        if (circle) {
          const cb = circle.getBounds();
          if (cb) bounds.union(cb);
          else if (approximatePickup) bounds.extend(approximatePickup.center);
        } else if (!exactPickup && approximatePickup) {
          bounds.extend(approximatePickup.center);
        }

        mapInstance.fitBounds(bounds, { top: pad, right: pad, bottom: pad, left: pad });

        resizeObs = new ResizeObserver(() => {
          if (mapInstance && bounds && !cancelled) {
            google.maps.event.trigger(mapInstance, "resize");
            mapInstance.fitBounds(bounds, { top: pad, right: pad, bottom: pad, left: pad });
          }
        });
        resizeObs.observe(el);
      } catch {
        if (!cancelled) setLoadError(true);
      }
    })();

    return () => {
      cancelled = true;
      resizeObs?.disconnect();
      routeLine?.setMap(null);
      circle?.setMap(null);
      markers.forEach((m) => m.setMap(null));
      mapInstance = null;
    };
    // Scalar deps only — `origin`/`destination` objects may be new references each parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- approximatePickup identity omitted on purpose
  }, [
    approximatePickup?.center.lat,
    approximatePickup?.center.lng,
    approximatePickup?.radiusMeters,
    destination.lat,
    destination.lng,
    destinationTitle,
    encodedPolyline,
    straightLineFallback,
    exactPickup?.lat,
    exactPickup?.lng,
    exactPickupTitle,
    noKey,
    origin.lat,
    origin.lng,
    originTitle,
    variant,
    emphasis,
  ]);

  if (noKey) {
    return (
      <div className={cn("overflow-hidden rounded-2xl", className)}>
        <CorridorMapPlaceholder
          className={heightClass}
          title="Map preview unavailable"
          helperText={
            helperText ??
            "Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local and restart the dev server to load live maps."
          }
        />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={cn("overflow-hidden rounded-2xl", className)}>
        <CorridorMapPlaceholder
          className={heightClass}
          title="Could not load map"
          helperText={
            helperText ??
            "Check the API key, billing, and Maps JavaScript API. Corridor markers will appear here when the map loads."
          }
        />
      </div>
    );
  }

  return (
    <div
      className={cn("overflow-hidden rounded-2xl ring-1 ring-border", heightClass, className)}
      role="region"
      aria-label="Map: route path, start and destination markers, and pickup when shown"
    >
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
