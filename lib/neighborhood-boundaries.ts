export interface NeighborhoodBoundaryPoint {
  lat: number;
  lng: number;
}

function normalizeNeighborhood(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

const CARATINGA_BOUNDARY_SEEDS: Record<string, NeighborhoodBoundaryPoint[]> = {
  "dario grossi": [
    { lat: -19.7827858, lng: -42.1400503 },
    { lat: -19.7794908, lng: -42.1379479 },
    { lat: -19.7814992, lng: -42.1409237 },
    { lat: -19.7811135, lng: -42.1412312 },
    { lat: -19.7827327, lng: -42.141218 },
    { lat: -19.7799217, lng: -42.1437011 },
  ],
  "santa zita": [
    { lat: -19.7878617, lng: -42.1302199 },
    { lat: -19.7872097, lng: -42.1308068 },
    { lat: -19.7914254, lng: -42.1309072 },
    { lat: -19.7888172, lng: -42.1309004 },
    { lat: -19.7909283, lng: -42.1252603 },
  ],
  limoeiro: [
    { lat: -19.797381, lng: -42.141335 },
    { lat: -19.7964924, lng: -42.145574 },
    { lat: -19.8017941, lng: -42.1379607 },
    { lat: -19.797014, lng: -42.1411198 },
    { lat: -19.7985585, lng: -42.1438736 },
    { lat: -19.7963609, lng: -42.1417601 },
  ],
  esperanca: [
    { lat: -19.7895056, lng: -42.1507858 },
    { lat: -19.79122, lng: -42.1499319 },
    { lat: -19.7885203, lng: -42.1546179 },
    { lat: -19.7863717, lng: -42.1510211 },
    { lat: -19.787972, lng: -42.1561182 },
  ],
};

export function getNeighborhoodBoundarySeedPoints(
  neighborhoodLabel: string | null | undefined,
) {
  if (!neighborhoodLabel) {
    return [];
  }

  return CARATINGA_BOUNDARY_SEEDS[normalizeNeighborhood(neighborhoodLabel)] ?? [];
}
