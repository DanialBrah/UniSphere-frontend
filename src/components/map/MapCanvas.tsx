import { MapContainer, TileLayer } from 'react-leaflet'
import type { ReactNode } from 'react'
import 'leaflet/dist/leaflet.css'
import '../../lib/leafletSetup'
import { useThemeStore } from '../../stores/themeStore'
import {
  MAP_ATTRIBUTION,
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  MAP_MAX_ZOOM,
  MAP_TILE_URL,
  MAP_TILE_URL_DARK,
  type LatLngTuple,
} from '../../lib/mapConfig'

interface MapCanvasProps {
  center?: LatLngTuple
  zoom?: number
  /** Must resolve to a definite height — a percentage height collapses without a sized parent. */
  className?: string
  scrollWheelZoom?: boolean
  /**
   * Turns off dragging, zooming and the zoom control together, for display-only maps showing a
   * single pin. There is nothing to navigate to on those, and panning only loses the pin.
   */
  interactive?: boolean
  /** Markers, popups, circles and the viewport/fit-bounds helpers. */
  children?: ReactNode
}

/**
 * The base map every surface builds on: `/lost-found`'s map tab, `/map`, the report form's
 * location picker, and `/bus` when it lands.
 *
 * `leaflet.css` is imported here rather than in `main.tsx` so Vite emits it into the map chunk.
 * Every route that renders a map is lazily loaded, which keeps ~150 KB of Leaflet plus its
 * stylesheet out of the initial bundle for users who never open one.
 */
export function MapCanvas({
  center = MAP_DEFAULT_CENTER,
  zoom = MAP_DEFAULT_ZOOM,
  className = 'h-full w-full',
  scrollWheelZoom = true,
  interactive = true,
  children,
}: Readonly<MapCanvasProps>) {
  const isDark = useThemeStore((s) => s.isDark)

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      maxZoom={MAP_MAX_ZOOM}
      scrollWheelZoom={interactive && scrollWheelZoom}
      dragging={interactive}
      doubleClickZoom={interactive}
      touchZoom={interactive}
      boxZoom={interactive}
      keyboard={interactive}
      zoomControl={interactive}
      className={`${className} rounded-2xl z-0`}
    >
      {/*
        OSM ships no dark basemap, so dark mode swaps the URL outright rather than applying a CSS
        filter — an inverted raster tile renders unreadable label text. Keying on the theme forces
        a remount, because react-leaflet treats `url` as a construct-time option and a plain prop
        change would leave the old tiles on screen.
      */}
      <TileLayer
        key={isDark ? 'dark' : 'light'}
        url={isDark ? MAP_TILE_URL_DARK : MAP_TILE_URL}
        attribution={MAP_ATTRIBUTION}
        maxZoom={MAP_MAX_ZOOM}
      />
      {children}
    </MapContainer>
  )
}
