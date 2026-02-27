import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

let mapsConfigured = false;
let mapsLoadingPromise: Promise<typeof google> | null = null;

function getGoogleMapsApiKey() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Chave da API Google Maps não configurada. Defina NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.",
    );
  }

  return apiKey;
}

function configureGoogleMaps() {
  if (!mapsConfigured) {
    setOptions({
      key: getGoogleMapsApiKey(),
      v: "weekly",
      language: "pt-BR",
      region: "BR",
      libraries: ["visualization"],
    });
    mapsConfigured = true;
  }
}

export async function loadGoogleMapsApi(): Promise<typeof google> {
  if (typeof window === "undefined") {
    throw new Error("Google Maps só pode ser carregado no navegador.");
  }

  configureGoogleMaps();

  if (!mapsLoadingPromise) {
    mapsLoadingPromise = Promise.all([
      importLibrary("maps"),
      importLibrary("visualization"),
    ]).then(() => window.google);
  }

  return mapsLoadingPromise;
}
