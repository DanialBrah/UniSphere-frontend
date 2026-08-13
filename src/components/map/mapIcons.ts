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

// ── Events ───────────────────────────────────────────────────────────────────
//
// Category drives both colour and glyph here — unlike Lost & Found, Events has no secondary "type"
// axis, and scanning for e.g. TECH vs SOCIAL events on a crowded campus map is a real use case.
// `/events/map` only ever returns PUBLISHED pins, so there is no non-terminal status to mute and no
// `approximate` variant — event coordinates are never privacy-coarsened.

type EventCategoryKey =
  | 'ACADEMIC'
  | 'CAREER'
  | 'WORKSHOP'
  | 'SOCIAL'
  | 'SPORTS'
  | 'CULTURAL'
  | 'TECH'
  | 'CLUB'
  | 'ORIENTATION'
  | 'OTHER'

/**
 * Deliberately outside Lost & Found's amber/emerald band and the shared picker violet, so the two
 * layers read as distinct "colonies" of pins when both are shown together on the campus map.
 */
const EVENT_CATEGORY_COLOR: Record<EventCategoryKey, string> = {
  ACADEMIC: '#2563EB',
  CAREER: '#0891B2',
  WORKSHOP: '#9333EA',
  SOCIAL: '#DB2777',
  SPORTS: '#E11D48',
  CULTURAL: '#C026D3',
  TECH: '#4F46E5',
  CLUB: '#0D9488',
  ORIENTATION: '#0284C7',
  OTHER: '#64748B',
}

const EVENT_CATEGORY_GLYPH: Record<EventCategoryKey, string> = {
  ACADEMIC: '<path d="m22 10-10-5L2 10l10 5 10-5Z"/><path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/>',
  CAREER:
    '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  WORKSHOP:
    '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  SOCIAL:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  SPORTS:
    '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  CULTURAL: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  TECH:
    '<rect x="9" y="9" width="6" height="6"/><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M15 2v2M9 2v2M15 20v2M9 20v2M20 15h2M20 9h2M2 15h2M2 9h2"/>',
  CLUB: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
  ORIENTATION:
    '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  OTHER: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
}

function eventPinSvg(category: EventCategoryKey): string {
  const color = EVENT_CATEGORY_COLOR[category] ?? EVENT_CATEGORY_COLOR.OTHER
  const glyph = EVENT_CATEGORY_GLYPH[category] ?? EVENT_CATEGORY_GLYPH.OTHER

  return `
<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg"
     aria-hidden="true" focusable="false">
  <path d="${PIN_PATH}" fill="${color}" stroke="#ffffff" stroke-width="2"/>
  <circle cx="16" cy="14" r="8.5" fill="#ffffff" fill-opacity=".92"/>
  <g transform="translate(8 6) scale(.6667)" fill="none" stroke="${color}"
     stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${glyph}</g>
</svg>`.trim()
}

const eventIconCache = new Map<string, L.DivIcon>()

export function createEventIcon(category: string): L.DivIcon {
  const key = isEventCategoryKey(category) ? category : 'OTHER'
  const cached = eventIconCache.get(key)
  if (cached) return cached

  const icon = toDivIcon(eventPinSvg(key))
  eventIconCache.set(key, icon)
  return icon
}

export function eventCategoryColor(category: string): string {
  return EVENT_CATEGORY_COLOR[isEventCategoryKey(category) ? category : 'OTHER']
}

function isEventCategoryKey(value: string): value is EventCategoryKey {
  return value in EVENT_CATEGORY_COLOR
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
