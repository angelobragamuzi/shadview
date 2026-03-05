"use client";

import { CATEGORY_LABELS, MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, STATUS_LABELS } from "@/lib/constants";
import { ProtocolQuickViewDialog } from "@/components/occurrences/protocol-quick-view-dialog";
import { getMapThemeFromDocument, getMapThemeStyles } from "@/lib/map-theme";
import { loadGoogleMapsApi } from "@/lib/google-maps";
import { formatDate } from "@/lib/occurrence-utils";
import type { OccurrenceWithRelations } from "@/types";
import { X } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";

export type OccurrenceMapMode = "heatmap" | "markers";
export type OccurrenceBaseMapType = "roadmap" | "satellite";

interface HeatPoint {
  lat: number;
  lng: number;
  count: number;
}

interface CoordinatePoint {
  lat: number;
  lng: number;
}

function crossProduct(origin: CoordinatePoint, first: CoordinatePoint, second: CoordinatePoint) {
  return (
    (first.lng - origin.lng) * (second.lat - origin.lat) -
    (first.lat - origin.lat) * (second.lng - origin.lng)
  );
}

function buildConvexHull(points: CoordinatePoint[]) {
  if (points.length <= 1) {
    return [...points];
  }

  const sorted = [...points].sort((left, right) => {
    if (left.lng === right.lng) {
      return left.lat - right.lat;
    }
    return left.lng - right.lng;
  });

  const lower: CoordinatePoint[] = [];
  for (const point of sorted) {
    while (
      lower.length >= 2 &&
      crossProduct(lower[lower.length - 2], lower[lower.length - 1], point) <= 0
    ) {
      lower.pop();
    }
    lower.push(point);
  }

  const upper: CoordinatePoint[] = [];
  for (let index = sorted.length - 1; index >= 0; index -= 1) {
    const point = sorted[index];
    while (
      upper.length >= 2 &&
      crossProduct(upper[upper.length - 2], upper[upper.length - 1], point) <= 0
    ) {
      upper.pop();
    }
    upper.push(point);
  }

  lower.pop();
  upper.pop();
  return [...lower, ...upper];
}

function expandPolygonAroundCenter(points: CoordinatePoint[], scale: number) {
  const center = points.reduce(
    (acc, point) => ({
      lat: acc.lat + point.lat,
      lng: acc.lng + point.lng,
    }),
    { lat: 0, lng: 0 },
  );

  center.lat /= points.length;
  center.lng /= points.length;

  return points.map((point) => ({
    lat: center.lat + (point.lat - center.lat) * scale,
    lng: center.lng + (point.lng - center.lng) * scale,
  }));
}

function smoothClosedPolygon(points: CoordinatePoint[], iterations = 2) {
  let current = [...points];
  if (current.length < 3) {
    return current;
  }

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const next: CoordinatePoint[] = [];

    for (let index = 0; index < current.length; index += 1) {
      const first = current[index];
      const second = current[(index + 1) % current.length];
      next.push({
        lat: first.lat * 0.75 + second.lat * 0.25,
        lng: first.lng * 0.75 + second.lng * 0.25,
      });
      next.push({
        lat: first.lat * 0.25 + second.lat * 0.75,
        lng: first.lng * 0.25 + second.lng * 0.75,
      });
    }

    current = next;
  }

  return current;
}

function metersToLatDegrees(meters: number) {
  return meters / 111_320;
}

function metersToLngDegrees(meters: number, latitude: number) {
  return meters / (111_320 * Math.max(Math.cos((latitude * Math.PI) / 180), 0.2));
}

function buildCircleAroundPoint(
  center: CoordinatePoint,
  radiusMeters: number,
  segments = 12,
) {
  const points: CoordinatePoint[] = [];

  for (let index = 0; index < segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    const latOffset = metersToLatDegrees(radiusMeters) * Math.sin(angle);
    const lngOffset = metersToLngDegrees(radiusMeters, center.lat) * Math.cos(angle);
    points.push({
      lat: center.lat + latOffset,
      lng: center.lng + lngOffset,
    });
  }

  return points;
}

function buildNeighborhoodContour(points: CoordinatePoint[]): CoordinatePoint[] {
  if (points.length === 0) {
    return [];
  }

  const uniquePoints = Array.from(
    new Map(
      points.map((point) => [
        `${point.lat.toFixed(6)}-${point.lng.toFixed(6)}`,
        point,
      ]),
    ).values(),
  );

  if (uniquePoints.length === 1) {
    return buildCircleAroundPoint(uniquePoints[0], 170, 20);
  }

  if (uniquePoints.length === 2) {
    const capsulePoints = [
      ...buildCircleAroundPoint(uniquePoints[0], 220, 16),
      ...buildCircleAroundPoint(uniquePoints[1], 220, 16),
    ];
    return smoothClosedPolygon(buildConvexHull(capsulePoints), 1);
  }

  const hull = buildConvexHull(uniquePoints);
  if (hull.length < 3) {
    return buildCircleAroundPoint(uniquePoints[0], 220, 24);
  }

  const scale =
    uniquePoints.length <= 4 ? 1.36 : uniquePoints.length <= 7 ? 1.28 : 1.2;
  const expandedHull = expandPolygonAroundCenter(hull, scale);
  return smoothClosedPolygon(expandedHull, 2);
}

function buildHeatPoints(occurrences: OccurrenceWithRelations[]): HeatPoint[] {
  const bucket = new Map<string, HeatPoint>();

  for (const occurrence of occurrences) {
    const lat = Number(occurrence.latitude.toFixed(3));
    const lng = Number(occurrence.longitude.toFixed(3));
    const key = `${lat}-${lng}`;
    const current = bucket.get(key) ?? { lat, lng, count: 0 };
    current.count += 1;
    bucket.set(key, current);
  }

  return Array.from(bucket.values());
}

function fitMapToCoordinates(map: google.maps.Map, points: CoordinatePoint[]) {
  if (points.length === 0) {
    map.setCenter(MAP_DEFAULT_CENTER);
    map.setZoom(MAP_DEFAULT_ZOOM);
    return;
  }

  const bounds = new google.maps.LatLngBounds();
  for (const point of points) {
    bounds.extend(point);
  }

  if (points.length === 1) {
    map.setCenter(points[0]);
    map.setZoom(15);
    return;
  }

  map.fitBounds(bounds, 48);
}

export function HeatmapOccurrencesMap({
  occurrences,
  className,
  mode = "heatmap",
  mapType = "roadmap",
  highlightedNeighborhood = null,
  highlightedNeighborhoodPoints = null,
  onManageOccurrence,
}: {
  occurrences: OccurrenceWithRelations[];
  className?: string;
  mode?: OccurrenceMapMode;
  mapType?: OccurrenceBaseMapType;
  highlightedNeighborhood?: string | null;
  highlightedNeighborhoodPoints?: CoordinatePoint[] | null;
  onManageOccurrence?: (occurrence: OccurrenceWithRelations) => void;
}) {
  const { resolvedTheme } = useTheme();
  const mapTheme = resolvedTheme === "dark" ? "dark" : "light";
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);
  const neighborhoodOutlineRef = useRef<google.maps.Polygon | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const markerListenersRef = useRef<google.maps.MapsEventListener[]>([]);
  const occurrencesRef = useRef(occurrences);
  const hasAutoSelectedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [selectedOccurrence, setSelectedOccurrence] = useState<OccurrenceWithRelations | null>(
    null,
  );
  const [protocolPreviewOccurrence, setProtocolPreviewOccurrence] =
    useState<OccurrenceWithRelations | null>(null);

  const heatPoints = useMemo(() => buildHeatPoints(occurrences), [occurrences]);

  useEffect(() => {
    occurrencesRef.current = occurrences;
  }, [occurrences]);

  const clearMarkers = () => {
    for (const listener of markerListenersRef.current) {
      listener.remove();
    }
    markerListenersRef.current = [];

    for (const marker of markersRef.current) {
      marker.setMap(null);
    }
    markersRef.current = [];
  };

  const clearNeighborhoodOutline = () => {
    neighborhoodOutlineRef.current?.setMap(null);
    neighborhoodOutlineRef.current = null;
  };

  useEffect(() => {
    let mounted = true;

    const initializeMap = async () => {
      try {
        const googleApi = await loadGoogleMapsApi();
        if (!mounted || !containerRef.current) {
          return;
        }

        if (!mapRef.current) {
          const initialPoint = occurrencesRef.current[0]
            ? {
                lat: occurrencesRef.current[0].latitude,
                lng: occurrencesRef.current[0].longitude,
              }
            : MAP_DEFAULT_CENTER;

          mapRef.current = new googleApi.maps.Map(containerRef.current, {
            center: initialPoint,
            zoom: occurrencesRef.current.length > 0 ? 14 : MAP_DEFAULT_ZOOM,
            mapTypeId: mapType,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            clickableIcons: false,
            styles:
              mapType === "roadmap" ? getMapThemeStyles(getMapThemeFromDocument()) : null,
          });
        }

        if (!heatmapRef.current) {
          heatmapRef.current = new googleApi.maps.visualization.HeatmapLayer({
            map: mapRef.current,
            radius: 28,
            opacity: 0.7,
            dissipating: true,
          });
        }

        setMapReady(true);
        fitMapToCoordinates(
          mapRef.current,
          occurrencesRef.current.map((item) => ({
            lat: item.latitude,
            lng: item.longitude,
          })),
        );
      } catch (mapError) {
        const message =
          mapError instanceof Error ? mapError.message : "Não foi possível carregar o mapa.";
        setError(message);
      }
    };

    void initializeMap();

    return () => {
      mounted = false;
      setMapReady(false);
      clearMarkers();
      clearNeighborhoodOutline();
      heatmapRef.current?.setMap(null);
      heatmapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    mapRef.current.setOptions({
      styles: mapType === "roadmap" ? getMapThemeStyles(mapTheme) : null,
    });
  }, [mapTheme, mapReady, mapType]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) {
      return;
    }

    mapRef.current.setMapTypeId(mapType);
  }, [mapType, mapReady]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) {
      return;
    }

    clearNeighborhoodOutline();

    if (!highlightedNeighborhood || occurrences.length === 0) {
      return;
    }

    const contourSourcePoints =
      highlightedNeighborhoodPoints && highlightedNeighborhoodPoints.length > 0
        ? highlightedNeighborhoodPoints
        : occurrences.map((occurrence) => ({
            lat: occurrence.latitude,
            lng: occurrence.longitude,
          }));

    const contourPath = buildNeighborhoodContour(contourSourcePoints);

    if (contourPath.length < 3) {
      return;
    }

    neighborhoodOutlineRef.current = new google.maps.Polygon({
      map: mapRef.current,
      paths: contourPath,
      clickable: false,
      strokeColor: mapTheme === "dark" ? "#93c5fd" : "#1d4ed8",
      strokeOpacity: 1,
      strokeWeight: 3,
      fillColor: mapTheme === "dark" ? "#2563eb" : "#3b82f6",
      fillOpacity: mapTheme === "dark" ? 0.28 : 0.2,
      zIndex: 2,
    });
  }, [
    highlightedNeighborhood,
    highlightedNeighborhoodPoints,
    mapReady,
    mapTheme,
    occurrences,
  ]);

  useEffect(() => {
    if (mode !== "markers") {
      setSelectedOccurrence(null);
      hasAutoSelectedRef.current = false;
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== "markers") {
      return;
    }

    if (occurrences.length === 0) {
      setSelectedOccurrence(null);
      hasAutoSelectedRef.current = false;
      return;
    }

    if (!hasAutoSelectedRef.current) {
      setSelectedOccurrence(occurrences[0]);
      hasAutoSelectedRef.current = true;
      return;
    }

    if (
      selectedOccurrence &&
      !occurrences.some((occurrence) => occurrence.id === selectedOccurrence.id)
    ) {
      setSelectedOccurrence(occurrences[0]);
    }
  }, [mode, occurrences, selectedOccurrence]);

  useEffect(() => {
    if (!mapReady) {
      return;
    }

    const map = mapRef.current;
    const heatmap = heatmapRef.current;
    if (!map || !heatmap) {
      return;
    }

    clearMarkers();

    if (occurrences.length === 0) {
      heatmap.setData([]);
      heatmap.setMap(mode === "heatmap" ? map : null);
      fitMapToCoordinates(map, []);
      setSelectedOccurrence(null);
      return;
    }

    if (mode === "heatmap") {
      heatmap.setMap(map);
      heatmap.setData(
        heatPoints.map((point) => ({
          location: new google.maps.LatLng(point.lat, point.lng),
          weight: point.count,
        })),
      );
      fitMapToCoordinates(
        map,
        heatPoints.map((point) => ({
          lat: point.lat,
          lng: point.lng,
        })),
      );
      return;
    }

    heatmap.setData([]);
    heatmap.setMap(null);

    for (const occurrence of occurrences) {
      const marker = new google.maps.Marker({
        map,
        position: {
          lat: occurrence.latitude,
          lng: occurrence.longitude,
        },
        title: occurrence.title,
      });

      const listener = marker.addListener("click", () => {
        setSelectedOccurrence(occurrence);
      });

      markersRef.current.push(marker);
      markerListenersRef.current.push(listener);
    }

    fitMapToCoordinates(
      map,
      occurrences.map((item) => ({
        lat: item.latitude,
        lng: item.longitude,
      })),
    );
  }, [heatPoints, mode, occurrences, mapReady]);

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
      <div className="relative h-full w-full">
        <div ref={containerRef} className="h-full w-full rounded-xl" />

        {mode === "markers" && selectedOccurrence ? (
          <aside className="absolute right-3 top-3 z-20 w-[300px] max-w-[calc(100%-1.5rem)] rounded-lg border border-border bg-card/95 p-3 shadow-lg backdrop-blur">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                {selectedOccurrence.title}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedOccurrence(null)}
                className="rounded p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Fechar detalhes"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">
              {selectedOccurrence.description}
            </p>
            <div className="mt-3 space-y-1 text-xs">
              <p>
                <span className="font-medium text-foreground">Categoria:</span>{" "}
                {CATEGORY_LABELS[selectedOccurrence.category]}
              </p>
              <p>
                <span className="font-medium text-foreground">Status:</span>{" "}
                {STATUS_LABELS[selectedOccurrence.status]}
              </p>
              <p>
                <span className="font-medium text-foreground">Bairro:</span>{" "}
                {selectedOccurrence.neighborhood ?? "Não informado"}
              </p>
              <p>
                <span className="font-medium text-foreground">Abertura:</span>{" "}
                {formatDate(selectedOccurrence.created_at)}
              </p>
            </div>
            <div className="mt-3 grid gap-2">
              <a
                href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${selectedOccurrence.latitude},${selectedOccurrence.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full justify-center rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-primary transition hover:bg-accent"
              >
                Ver no Street View
              </a>
              <button
                type="button"
                onClick={() => setProtocolPreviewOccurrence(selectedOccurrence)}
                className="inline-flex w-full justify-center rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-accent"
              >
                Ver protocolo
              </button>
              <Link
                href={`/dashboard/occurrences?occurrenceId=${selectedOccurrence.id}`}
                className="inline-flex w-full justify-center rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                onClick={(event) => {
                  if (onManageOccurrence) {
                    event.preventDefault();
                    onManageOccurrence(selectedOccurrence);
                  }
                }}
              >
                Gerenciar ocorrência
              </Link>
            </div>
          </aside>
        ) : null}

        <ProtocolQuickViewDialog
          occurrence={protocolPreviewOccurrence}
          open={Boolean(protocolPreviewOccurrence)}
          onOpenChange={(open) => {
            if (!open) {
              setProtocolPreviewOccurrence(null);
            }
          }}
        />
      </div>
    </div>
  );
}
