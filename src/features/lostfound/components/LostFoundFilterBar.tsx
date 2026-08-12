import { Search, X } from 'lucide-react'
import {
  isSearchableLostFoundQuery,
  LOST_FOUND_SEARCH_MIN_LENGTH,
} from '../hooks/useLostFoundQueries'
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  STATUS_LABEL,
  TYPE_LABEL,
  TYPE_ORDER,
} from '../utils/display'
import type { LostFoundFilters, LostFoundItemStatus } from '../types'

const CHIP_BASE =
  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap'
const CHIP_ACTIVE = 'bg-primary text-white border-primary'
const CHIP_IDLE =
  'bg-white dark:bg-[#1A1226] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2D1F4D] hover:border-primary/40 hover:text-primary'

/**
 * Only the statuses worth browsing. `CANCELLED` is a withdrawn listing and `EXPIRED` an abandoned
 * one — neither is something a searcher wants in their results, and both remain reachable from
 * My Reports, which is the surface that legitimately shows every status.
 */
const BROWSABLE_STATUSES: LostFoundItemStatus[] = ['OPEN', 'CLAIMED', 'RESOLVED']

interface LostFoundFilterBarProps {
  filters: LostFoundFilters
  onChange: (filters: LostFoundFilters) => void
  search: string
  onSearchChange: (value: string) => void
  /** Category is not a parameter of /items/search, so the row is hidden while searching. */
  showCategories?: boolean
}

export function LostFoundFilterBar({
  filters,
  onChange,
  search,
  onSearchChange,
  showCategories = true,
}: Readonly<LostFoundFilterBarProps>) {
  const showMinLengthHint = search.trim().length > 0 && !isSearchableLostFoundQuery(search)

  return (
    <div className="mb-5 space-y-3">
      <div>
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 transition-colors focus-within:border-primary/50 dark:border-[#2D1F4D] dark:bg-[#1A1226]">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search lost and found items…"
            aria-label="Search lost and found items"
            className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* MySQL's full-text index ignores tokens shorter than 3 characters, so a 1- or 2-letter
            query matches nothing. Without this hint the search box just looks broken. */}
        {showMinLengthHint && (
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            Type at least {LOST_FOUND_SEARCH_MIN_LENGTH} characters to search.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onChange({ ...filters, type: null })}
          className={`${CHIP_BASE} ${filters.type === null ? CHIP_ACTIVE : CHIP_IDLE}`}
        >
          All items
        </button>
        {TYPE_ORDER.map((type) => {
          const active = filters.type === type
          return (
            <button
              key={type}
              // Clicking the active chip clears it, so the filter is its own toggle.
              onClick={() => onChange({ ...filters, type: active ? null : type })}
              className={`${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_IDLE}`}
            >
              {TYPE_LABEL[type]}
            </button>
          )
        })}

        <span className="mx-1 h-4 w-px bg-gray-200 dark:bg-[#2D1F4D]" />

        {BROWSABLE_STATUSES.map((status) => {
          const active = filters.status === status
          return (
            <button
              key={status}
              onClick={() => onChange({ ...filters, status: active ? null : status })}
              className={`${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_IDLE}`}
            >
              {STATUS_LABEL[status]}
            </button>
          )
        })}
      </div>

      {showCategories && (
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORY_ORDER.map((category) => {
            const active = filters.category === category
            return (
              <button
                key={category}
                onClick={() => onChange({ ...filters, category: active ? null : category })}
                className={[
                  'rounded-md px-2 py-1 text-[11px] transition-colors',
                  active
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:text-primary dark:bg-white/5 dark:text-gray-400',
                ].join(' ')}
              >
                {CATEGORY_LABEL[category]}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
