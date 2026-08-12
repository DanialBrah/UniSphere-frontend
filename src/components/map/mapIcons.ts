import L from 'leaflet'

/**
 * Marker icons, built as `L.divIcon` from inline SVG.
 *
 * `divIcon` over image sprites because the pin has to vary on three independent axes — item type
 * (colour), category (glyph) and status (muted or not) — which as raster assets would be 100
 * files. It also means the pins inherit no colour from the tile layer and stay legible on both
 * the light and dark basemaps.
 *
 * Glyph paths are hand-written in lucide's 24×24 stroke idiom rather than imported from
 * `lucide-react`: those are React components, and rendering them to a string here would drag
 * `react-dom/server` into the map chunk.
 */

/** Amber for LOST, emerald for FOUND. */
export const LOST_COLOR = '#F59E0B'
export const FOUND_COLOR = '#10B981'

/** The picker pin on the report form uses the brand violet so it reads as "yours, being placed". */
const PICKER_COLOR = '#7C3AED'

type CategoryKey =
  | 'ELECTRONICS'
  | 'DOCUMENTS'
  | 'CARDS_AND_KEYS'
  | 'CLOTHING'
  | 'BAGS'
  | 'ACCESSORIES'
  | 'BOOKS'
  | 'SPORTS'
  | 'PETS'
  | 'OTHER'

/** 24×24 stroke glyphs, drawn centred in the pin head. */
const CATEGORY_GLYPH: Record<CategoryKey, string> = {
  ELECTRONICS: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
  DOCUMENTS:
    '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v5h6"/><path d="M8 13h8"/><path d="M8 17h5"/>',
  CARDS_AND_KEYS:
    '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.5 12.5 8-8"/><path d="m16 5 3 3"/>',
  CLOTHING: '<path d="M16 3 12 6 8 3 3 6l2 4 2-1v12h10V9l2 1 2-4z"/>',
  BAGS:
    '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  ACCESSORIES:
    '<circle cx="12" cy="12" r="5"/><path d="M12 9.5V12l1.5 1"/><path d="M8.5 7 9 3h6l.5 4"/><path d="M15.5 17 15 21H9l-.5-4"/>',
  BOOKS:
    '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  SPORTS: '<circle cx="12" cy="12" r="9"/><path d="M3.5 9h17"/><path d="M3.5 15h17"/>',
  PETS:
    '<circle cx="7" cy="9" r="2"/><circle cx="12" cy="7" r="2"/><circle cx="17" cy="9" r="2"/><path d="M12 12c-3 0-5 2-5 4.5 0 1.5 1 2.5 2.5 2.5h5c1.5 0 2.5-1 2.5-2.5C17 14 15 12 12 12z"/>',
  OTHER: '<path d="m21 8-9-5-9 5v8l9 5 9-5z"/><path d="m3 8 9 5 9-5"/><path d="M12 13v8"/>',
}

/** Classic teardrop, 32×42, tip at (16, 41). */
const PIN_PATH = 'M16 1C8.82 1 3 6.82 3 14c0 9.25 13 27 13 27s13-17.75 13-27C29 6.82 23.18 1 16 1Z'

const ICON_SIZE: L.PointExpression = [32, 42]
const ICON_ANCHOR: L.PointExpression = [16, 41]
const POPUP_ANCHOR: L.PointExpression = [0, -38]

interface PinOptions {
  color: string
  category: CategoryKey
  /** Dashed outline — the map's visual shorthand for a coarsened, approximate position. */
  approximate?: boolean
  /** Fades and desaturates closed items so an open one stands out. */
  muted?: boolean
}

function pinSvg({ color, category, approximate = false, muted = false }: PinOptions): string {
  const glyph = CATEGORY_GLYPH[category] ?? CATEGORY_GLYPH.OTHER
  const dash = approximate ? ' stroke-dasharray="4 3"' : ''

  return `
<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg"
     style="${muted ? 'opacity:.55;filter:saturate(.35)' : ''}"
     aria-hidden="true" focusable="false">
  <path d="${PIN_PATH}" fill="${color}" stroke="#ffffff" stroke-width="2"${dash}/>
  <circle cx="16" cy="14" r="8.5" fill="#ffffff" fill-opacity=".92"/>
  <g transform="translate(8 6) scale(.6667)" fill="none" stroke="${color}"
     stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${glyph}</g>
</svg>`.trim()
}

/**
 * `className: ''` matters — Leaflet's default is `leaflet-div-icon`, which paints a white box with
 * a border behind the SVG.
 */
function toDivIcon(html: string): L.DivIcon {
  return L.divIcon({
    html,
    className: '',
    iconSize: ICON_SIZE,
    iconAnchor: ICON_ANCHOR,
    popupAnchor: POPUP_ANCHOR,
  })
}

/**
 * Icons are pure functions of their inputs and a map re-renders them on every pan, so they are
 * memoised by a composite key rather than rebuilt per marker per frame.
 */
const iconCache = new Map<string, L.DivIcon>()

export function createItemIcon(options: PinOptions): L.DivIcon {
  const key = `${options.color}|${options.category}|${options.approximate}|${options.muted}`
  const cached = iconCache.get(key)
  if (cached) return cached

  const icon = toDivIcon(pinSvg(options))
  iconCache.set(key, icon)
  return icon
}

let pickerIcon: L.DivIcon | null = null

/** The draggable pin on the report form's location picker. */
export function createPickerIcon(): L.DivIcon {
  pickerIcon ??= toDivIcon(
    `
<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg"
     aria-hidden="true" focusable="false">
  <path d="${PIN_PATH}" fill="${PICKER_COLOR}" stroke="#ffffff" stroke-width="2"/>
  <circle cx="16" cy="14" r="4.5" fill="#ffffff"/>
</svg>`.trim(),
  )
  return pickerIcon
}
