import { eventCategoryColor } from '../../../components/map/mapIcons'
import { CATEGORY_LABEL, CATEGORY_ORDER } from '../utils/display'

const DOT = 'inline-block h-2.5 w-2.5 rounded-full'

/** Category drives both colour and glyph on the map, so the legend is the key to reading it. */
export function EventsMapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-gray-200 bg-white/90 px-3 py-2 text-xs text-gray-600 backdrop-blur dark:border-[#2D1F4D] dark:bg-[#1A1226]/90 dark:text-gray-300">
      {CATEGORY_ORDER.map((category) => (
        <span key={category} className="flex items-center gap-1.5">
          <span className={DOT} style={{ backgroundColor: eventCategoryColor(category) }} />
          {CATEGORY_LABEL[category]}
        </span>
      ))}
    </div>
  )
}
