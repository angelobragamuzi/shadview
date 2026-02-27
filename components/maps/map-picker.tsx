"use client";

import { loadGoogleMapsApi } from "@/lib/google-maps";
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from "@/lib/constants";
import type { Coordinates } from "@/services/geolocation-service";
import { useEffect, useRef, useState } from "react";

export function MapPicker({
  value,
  onChange,
  className,
}: {
  value: Coordinates | null;
  onChange: (value: Coordinates) => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    let mounted = true;

    const initializeMap = async () => {
      try {
        const googleApi = await loadGoogleMapsApi();
        if (!mounted || !containerRef.current) {
          return;
        }

        if (!mapRef.current) {
          mapRef.current = new googleApi.maps.Map(containerRef.current, {
            center: valueRef.current ?? MAP_DEFAULT_CENTER,
            zoom: valueRef.current ? 16 : MAP_DEFAULT_ZOOM,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            clickableIcons: false,
          });

          clickListenerRef.current = mapRef.current.addListener(
            "click",
            (event: google.maps.MapMouseEvent) => {
              if (!event.latLng) {
                return;
              }

              onChangeRef.current({
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
              });
            },
          );
        }
      } catch (mapError) {
        const message =
          mapError instanceof Error
            ? mapError.message
            : "Não foi possível carregar o mapa.";
        setError(message);
      }
    };

    void initializeMap();

    return () => {
      mounted = false;
      clickListenerRef.current?.remove();
      clickListenerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    if (!value) {
      markerRef.current?.setMap(null);
      markerRef.current = null;
      map.setCenter(MAP_DEFAULT_CENTER);
      map.setZoom(MAP_DEFAULT_ZOOM);
      return;
    }

    if (!markerRef.current) {
      markerRef.current = new google.maps.Marker({
        map,
        position: value,
      });
    } else {
      markerRef.current.setPosition(value);
    }

    map.panTo(value);
  }, [value]);

  if (error) {
    return (
      <div className={className}>
        <div className="flex h-full w-full items-center justify-center rounded-xl border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={containerRef} className="h-full w-full rounded-xl" />
    </div>
  );
}
