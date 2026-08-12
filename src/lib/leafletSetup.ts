/**
 * Leaflet's default marker icon resolves its PNGs by string-concatenating `L.Icon.Default.imagePath`
 * onto a filename. That works when Leaflet is served from a CDN and breaks completely under a
 * bundler, which fingerprints and relocates the assets. The fix is the documented one: delete the
 * cached `_getIconUrl` and hand Leaflet the URLs Vite resolved for us.
 *
 * Import this module for its side effect once, before any map renders. `MapCanvas` does that, so
 * nothing else needs to.
 *
 * Most Lost & Found markers use a custom `divIcon` (see `components/map/mapIcons.ts`), but the
 * draggable pin in the location picker and any future default `<Marker>` rely on this.
 */
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

/**
 * `_getIconUrl` is a private memo on the prototype and is absent from Leaflet's public types.
 * A narrow structural type keeps the `delete` honest without reaching for `any`, which the repo's
 * strict tsconfig and eslint config both reject.
 */
type IconDefaultPrototype = L.Icon.Default & { _getIconUrl?: () => string }

let applied = false

export function setupLeafletIcons(): void {
  if (applied) return
  applied = true

  delete (L.Icon.Default.prototype as IconDefaultPrototype)._getIconUrl

  L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
  })
}

setupLeafletIcons()
