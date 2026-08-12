import { FOUND_COLOR, LOST_COLOR } from '../../../components/map/mapIcons'

const DOT = 'inline-block h-2.5 w-2.5 rounded-full'

/**
 * Explains the pin colours and — more importantly — the dashed ring, which is the only visible
 * trace of the server's privacy guard. A user who doesn't know a FOUND pin is deliberately
 * imprecise will read it as a broken location.
 */
export function LostFoundMapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-gray-200 bg-white/90 px-3 py-2 text-xs text-gray-600 backdrop-blur dark:border-[#2D1F4D] dark:bg-[#1A1226]/90 dark:text-gray-300">
      <span className="flex items-center gap-1.5">
        <span className={DOT} style={{ backgroundColor: LOST_COLOR }} />
        Lost here
      </span>
      <span className="flex items-center gap-1.5">
        <span className={DOT} style={{ backgroundColor: FOUND_COLOR }} />
        Found here
      </span>
      <span className="flex items-center gap-1.5">
        <span
          className={`${DOT} border border-dashed border-gray-500 bg-transparent dark:border-gray-400`}
        />
        Approximate area
      </span>
    </div>
  )
}
