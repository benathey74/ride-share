"use client";

import { useEffect, useRef, useState } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { useController, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCoord } from "@/lib/maps/format-coord";
import { getPublicGoogleMapsApiKey } from "@/lib/maps/env";
import { loadGoogleMapsPlaces } from "@/lib/maps/load-google-maps";
import { cn } from "@/lib/utils";
import type { SelectedPlace } from "@/types/place";

export type RoutePlaceFieldGroup<T extends FieldValues> = {
  label: FieldPath<T>;
  placeId: FieldPath<T>;
  lat: FieldPath<T>;
  lng: FieldPath<T>;
};

type PlaceAutocompleteFieldProps<T extends FieldValues> = {
  control: Control<T>;
  fields: RoutePlaceFieldGroup<T>;
  htmlId: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  /** Maps script / init failure */
  mapsError?: string;
  /** Validation or auxiliary message under the field */
  helperText?: string;
  helperVariant?: "muted" | "destructive";
  /** Optional hook when a suggestion is committed (after form fields are updated). */
  onPlaceSelected?: (place: SelectedPlace) => void;
};

function clearPlaceGeometry<T extends FieldValues>(
  setValue: ReturnType<typeof useFormContext<T>>["setValue"],
  fields: RoutePlaceFieldGroup<T>,
) {
  setValue(fields.placeId, "" as never, { shouldValidate: false, shouldDirty: true });
  setValue(fields.lat, "" as never, { shouldValidate: false, shouldDirty: true });
  setValue(fields.lng, "" as never, { shouldValidate: false, shouldDirty: true });
}

export function PlaceAutocompleteField<T extends FieldValues>({
  control,
  fields,
  htmlId,
  label,
  placeholder = "Search for a place",
  disabled = false,
  mapsError,
  helperText,
  helperVariant = "muted",
  onPlaceSelected,
}: PlaceAutocompleteFieldProps<T>) {
  const { setValue } = useFormContext<T>();
  const { field } = useController({ control, name: fields.label });
  const acRef = useRef<google.maps.places.Autocomplete | null>(null);
  const onPlaceCbRef = useRef(onPlaceSelected);
  const [inputEl, setInputEl] = useState<HTMLInputElement | null>(null);

  useEffect(() => {
    onPlaceCbRef.current = onPlaceSelected;
  }, [onPlaceSelected]);

  const apiKeyPresent = Boolean(getPublicGoogleMapsApiKey());
  /** `idle` = script/autocomplete not attached yet (no sync setState in effect — see ESLint react-hooks/set-state-in-effect). */
  const [attachState, setAttachState] = useState<"idle" | "ready" | "error">("idle");

  useEffect(() => {
    if (disabled || !apiKeyPresent || !inputEl) return;

    let cancelled = false;

    async function run() {
      try {
        await loadGoogleMapsPlaces();
        if (cancelled || !inputEl) return;

        if (acRef.current) {
          google.maps.event.clearInstanceListeners(acRef.current);
          acRef.current = null;
        }

        const ac = new google.maps.places.Autocomplete(inputEl, {
          fields: ["formatted_address", "geometry", "name", "place_id"],
        });
        acRef.current = ac;

        ac.addListener("place_changed", () => {
          const place = ac.getPlace();
          const loc = place.geometry?.location;
          const pid = place.place_id;
          if (!loc || !pid) return;

          const display = (place.formatted_address ?? place.name ?? "").trim();
          if (!display) return;

          const latStr = formatCoord(loc.lat());
          const lngStr = formatCoord(loc.lng());

          setValue(fields.label, display as never, {
            shouldValidate: true,
            shouldDirty: true,
          });
          setValue(fields.placeId, pid as never, {
            shouldValidate: true,
            shouldDirty: true,
          });
          setValue(fields.lat, latStr as never, {
            shouldValidate: true,
            shouldDirty: true,
          });
          setValue(fields.lng, lngStr as never, {
            shouldValidate: true,
            shouldDirty: true,
          });
          onPlaceCbRef.current?.({
            label: display,
            placeId: pid,
            latitude: latStr,
            longitude: lngStr,
          });
        });

        if (!cancelled) setAttachState("ready");
      } catch {
        if (!cancelled) setAttachState("error");
      }
    }

    void run();

    return () => {
      cancelled = true;
      if (acRef.current) {
        google.maps.event.clearInstanceListeners(acRef.current);
        acRef.current = null;
      }
      setAttachState("idle");
    };
  }, [apiKeyPresent, disabled, fields, inputEl, setValue]);

  const mergedRef = (el: HTMLInputElement | null) => {
    field.ref(el);
    setInputEl(el);
  };

  const noKey = !apiKeyPresent;
  const mapsFailed = attachState === "error";
  const mapsLoading =
    apiKeyPresent && inputEl !== null && attachState === "idle";
  const inputDisabled =
    disabled || noKey || mapsFailed || (apiKeyPresent && attachState !== "ready");

  return (
    <div className="space-y-2">
      <Label htmlFor={htmlId}>{label}</Label>
      <Input
        id={htmlId}
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        disabled={inputDisabled}
        className={cn("rounded-2xl", mapsLoading && "opacity-90")}
        name={field.name}
        value={field.value ?? ""}
        ref={mergedRef}
        onBlur={field.onBlur}
        onChange={(e) => {
          field.onChange(e);
          clearPlaceGeometry(setValue, fields);
        }}
      />
      {noKey ? (
        <p className="text-xs text-amber-800 dark:text-amber-200">
          Add{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </code>{" "}
          to <code className="rounded bg-muted px-1 py-0.5 text-[11px]">.env.local</code> and restart
          the dev server. Place search stays disabled until the key is set.
        </p>
      ) : null}
      {mapsLoading ? (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          Loading place search…
        </p>
      ) : null}
      {mapsFailed || mapsError ? (
        <p className="text-xs text-destructive" role="alert">
          {mapsError ??
            "Could not load Google Maps. Check the API key, billing, and enabled APIs (Maps JavaScript API, Places API)."}
        </p>
      ) : null}
      {apiKeyPresent && attachState === "ready" ? (
        <p className="text-xs text-muted-foreground">
          Pick a row from the suggestions — typing alone does not set coordinates.
        </p>
      ) : null}
      {helperText ? (
        <p
          className={cn(
            "text-xs",
            helperVariant === "destructive" ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
