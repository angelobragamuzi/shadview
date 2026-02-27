"use client";

import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, STATUS_LABELS } from "@/lib/constants";
import { loadGoogleMapsApi } from "@/lib/google-maps";
import { formatDate } from "@/lib/occurrence-utils";
import type { Occurrence } from "@/types";
import { useEffect, useRef, useState } from "react";

function buildInfoWindowContent(occurrence: Occurrence) {
  const wrapper = document.createElement("div");
  wrapper.style.minWidth = "220px";
  wrapper.style.padding = "4px 2px";

  const title = document.createElement("p");
  title.textContent = occurrence.title;
  title.style.margin = "0 0 6px";
  title.style.fontSize = "14px";
  title.style.fontWeight = "600";

  const status = document.createElement("p");
  status.textContent = `Status: ${STATUS_LABELS[occurrence.status]}`;
  status.style.margin = "0 0 4px";
  status.style.fontSize = "12px";

  const createdAt = document.createElement("p");
  createdAt.textContent = `Abertura: ${formatDate(occurrence.created_at)}`;
  createdAt.style.margin = "0 0 4px";
  createdAt.style.fontSize = "12px";
  createdAt.style.color = "#64748b";

  const neighborhood = document.createElement("p");
  neighborhood.textContent = `Bairro: ${occurrence.neighborhood ?? "Não informado"}`;
  neighborhood.style.margin = "0 0 8px";
  neighborhood.style.fontSize = "12px";
  neighborhood.style.color = "#64748b";

  const link = document.createElement("a");
  link.href = `/occurrence/${occurrence.id}`;
  link.textContent = "Acompanhar protocolo";
  link.style.fontSize = "12px";
  link.style.fontWeight = "600";
  link.style.color = "#1d4ed8";
  link.style.textDecoration = "none";

  wrapper.append(title, status, createdAt, neighborhood, link);
  return wrapper;
}

export function PublicOccurrencesMap({
  occurrences,
  className,
}: {
  occurrences: Occurrence[];
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

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
            center: MAP_DEFAULT_CENTER,
            zoom: MAP_DEFAULT_ZOOM,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            clickableIcons: false,
          });
          infoWindowRef.current = new googleApi.maps.InfoWindow();
        }

        setMapReady(true);
      } catch (mapError) {
        const message =
          mapError instanceof Error
            ? mapError.message
            : "Não foi possível carregar o mapa público.";
        setError(message);
      }
    };

    void initializeMap();

    return () => {
      mounted = false;
      setMapReady(false);
      for (const marker of markersRef.current) {
        google.maps.event.clearInstanceListeners(marker);
        marker.setMap(null);
      }
      markersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!mapReady) {
      return;
    }

    const map = mapRef.current;
    if (!map) {
      return;
    }

    for (const marker of markersRef.current) {
      google.maps.event.clearInstanceListeners(marker);
      marker.setMap(null);
    }
    markersRef.current = [];

    if (occurrences.length === 0) {
      map.setCenter(MAP_DEFAULT_CENTER);
      map.setZoom(MAP_DEFAULT_ZOOM);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    for (const occurrence of occurrences) {
      const marker = new google.maps.Marker({
        map,
        position: {
          lat: occurrence.latitude,
          lng: occurrence.longitude,
        },
        title: occurrence.title,
      });

      marker.addListener("click", () => {
        if (!infoWindowRef.current) {
          return;
        }
        infoWindowRef.current.setContent(buildInfoWindowContent(occurrence));
        infoWindowRef.current.open({
          map,
          anchor: marker,
        });
      });

      markersRef.current.push(marker);
      bounds.extend({
        lat: occurrence.latitude,
        lng: occurrence.longitude,
      });
    }

    if (occurrences.length === 1) {
      map.setCenter({
        lat: occurrences[0].latitude,
        lng: occurrences[0].longitude,
      });
      map.setZoom(15);
    } else {
      map.fitBounds(bounds, 48);
    }
  }, [occurrences, mapReady]);

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
