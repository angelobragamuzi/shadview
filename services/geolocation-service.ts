import { loadGoogleMapsApi } from "@/lib/google-maps";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PostalCodeAddress {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface AddressForGeocode {
  street: string;
  addressNumber: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
}

function normalizePostalCode(value: string) {
  return value.replace(/\D/g, "");
}

export function formatPostalCode(value: string) {
  const digits = normalizePostalCode(value).slice(0, 8);
  if (digits.length <= 5) {
    return digits;
  }
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export async function lookupAddressByPostalCode(
  postalCode: string,
): Promise<PostalCodeAddress | null> {
  const normalized = normalizePostalCode(postalCode);
  if (normalized.length !== 8) {
    return null;
  }

  const response = await fetch(`https://viacep.com.br/ws/${normalized}/json/`);
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    erro?: boolean;
    logradouro?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
  };

  if (data.erro) {
    return null;
  }

  return {
    street: data.logradouro ?? "",
    neighborhood: data.bairro ?? "",
    city: data.localidade ?? "",
    state: data.uf ?? "",
  };
}

export async function geocodeAddress(
  address: AddressForGeocode,
): Promise<Coordinates | null> {
  try {
    const googleApi = await loadGoogleMapsApi();
    const geocoder = new googleApi.maps.Geocoder();
    const query = [
      `${address.street}, ${address.addressNumber}`,
      address.neighborhood,
      `${address.city} - ${address.state.toUpperCase()}`,
      address.postalCode,
      "Brasil",
    ]
      .filter(Boolean)
      .join(", ");

    const response = await geocoder.geocode({
      address: query,
    });

    const location = response.results[0]?.geometry?.location;
    if (!location) {
      return null;
    }

    return {
      lat: location.lat(),
      lng: location.lng(),
    };
  } catch {
    return null;
  }
}
