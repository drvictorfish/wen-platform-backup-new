import { haversineKm } from '@/lib/delivery'

export interface CityInfo {
  slug: string
  name: string
  state: string
  hqLat: number
  hqLng: number
  serviceRadiusKm: number
  priceMultiplier: number
}

/** Row shape as it comes back from Supabase (snake_case, numeric-as-string). */
interface CityRow {
  slug: string
  name: string
  state: string
  hq_lat: number | string
  hq_lng: number | string
  service_radius_km: number | string
  price_multiplier: number | string
}

export function mapCityRow(row: CityRow): CityInfo {
  return {
    slug: row.slug,
    name: row.name,
    state: row.state,
    hqLat: Number(row.hq_lat),
    hqLng: Number(row.hq_lng),
    serviceRadiusKm: Number(row.service_radius_km),
    priceMultiplier: Number(row.price_multiplier),
  }
}

/**
 * Finds which (if any) of WEN's active cities contains this point — the
 * nearest one whose service radius covers it, in case of overlap. Returns
 * null if the point isn't served by any city yet. Used both client-side
 * (checkout, for an early "not available" warning) and server-side (the
 * authoritative check — see /api/orders) since a buyer's actual delivery
 * city, and therefore which price_multiplier applies, is always determined
 * from their real coordinates, never a client-sent city name.
 */
export function resolveCityByPoint(cities: CityInfo[], lat: number, lng: number): CityInfo | null {
  let best: { city: CityInfo; dist: number } | null = null
  for (const city of cities) {
    const dist = haversineKm(city.hqLat, city.hqLng, lat, lng)
    if (dist <= city.serviceRadiusKm && (!best || dist < best.dist)) {
      best = { city, dist }
    }
  }
  return best?.city ?? null
}

/** A combined bounding box across every active city's service area, for
 * biasing address-autocomplete results — wide enough to cover all of
 * them without excluding the rest of the country. */
export function combinedServiceAreaBox(cities: CityInfo[]): { minLat: number; maxLat: number; minLng: number; maxLng: number } | null {
  if (cities.length === 0) return null
  const KM_PER_DEGREE_LAT = 111
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity
  for (const city of cities) {
    const padDeg = (city.serviceRadiusKm / KM_PER_DEGREE_LAT) + 0.15 // a little extra breathing room
    minLat = Math.min(minLat, city.hqLat - padDeg)
    maxLat = Math.max(maxLat, city.hqLat + padDeg)
    minLng = Math.min(minLng, city.hqLng - padDeg)
    maxLng = Math.max(maxLng, city.hqLng + padDeg)
  }
  return { minLat, maxLat, minLng, maxLng }
}

let citiesCache: CityInfo[] | null = null
let citiesPromise: Promise<CityInfo[]> | null = null

/** Client-side fetch of active cities, cached for the life of the tab. */
export function fetchCities(): Promise<CityInfo[]> {
  if (citiesCache) return Promise.resolve(citiesCache)
  if (!citiesPromise) {
    citiesPromise = fetch('/api/cities')
      .then(res => res.json())
      .then((data: { cities?: CityInfo[] }) => {
        citiesCache = data.cities ?? []
        return citiesCache
      })
      .catch(() => [])
  }
  return citiesPromise
}
