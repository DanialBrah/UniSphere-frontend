/**
 * Map configuration, read once from the environment.
 *
 * Every value has a working fallback, so the map renders with none of the VITE_MAP_* variables
 * set. Vite inlines these into the client bundle at build time — see `.env.example` for why
 * that means none of them may ever hold a secret.
 *
 * Whichever tile hosts these point at must also appear in the `img-src` directive of the CSP
 * in `vercel.json`, or production silently renders a grey grid.
 */

/** OpenStreetMap raster tiles. Free and keyless; their tile policy discourages heavy traffic. */
const FALLBACK_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

/** OSM has no dark basemap, so dark mode swaps to CARTO's — also free and keyless. */
const FALLBACK_TILE_URL_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

const FALLBACK_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

/** Campus centre — matches the coordinates the backend's LostFoundSeeder plants demo items around. */
const FALLBACK_CENTER: LatLngTuple = [3.0678, 101.5006]

const FALLBACK_ZOOM = 16
const FALLBACK_MAX_ZOOM = 19

export type LatLngTuple = [number, number]

/** Trims and rejects empty strings so a blank `VITE_MAP_TILE_URL=` falls back instead of breaking. */
function readString(raw: string | undefined, fallback: string): string {
  const trimmed = raw?.trim()
  return trimmed ? trimmed : fallback
}

function readNumber(raw: string | undefined, fallback: number): number {
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

/**
 * Parses a `"lat,lng"` pair. A malformed value falls back rather than throwing — a typo in an
 * env var set in a hosting dashboard should not take down every page that renders a map.
 */
export function parseCenter(raw: string | undefined, fallback: LatLngTuple): LatLngTuple {
  const parts = raw?.split(',')
  if (parts?.length !== 2) return fallback

  const lat = Number(parts[0])
  const lng = Number(parts[1])
  const isValid =
    Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180

  return isValid ? [lat, lng] : fallback
}

export const MAP_TILE_URL = readString(import.meta.env.VITE_MAP_TILE_URL, FALLBACK_TILE_URL)
export const MAP_TILE_URL_DARK = readString(
  import.meta.env.VITE_MAP_TILE_URL_DARK,
  FALLBACK_TILE_URL_DARK,
)
export const MAP_ATTRIBUTION = readString(
  import.meta.env.VITE_MAP_ATTRIBUTION,
  FALLBACK_ATTRIBUTION,
)
export const MAP_DEFAULT_CENTER = parseCenter(
  import.meta.env.VITE_MAP_DEFAULT_CENTER,
  FALLBACK_CENTER,
)
export const MAP_DEFAULT_ZOOM = readNumber(import.meta.env.VITE_MAP_DEFAULT_ZOOM, FALLBACK_ZOOM)
export const MAP_MAX_ZOOM = readNumber(import.meta.env.VITE_MAP_MAX_ZOOM, FALLBACK_MAX_ZOOM)

/** Zoom used when dropping the user onto a single known point (picker, detail page). */
export const MAP_FOCUS_ZOOM = 17
