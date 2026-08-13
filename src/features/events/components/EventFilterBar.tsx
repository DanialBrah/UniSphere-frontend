import { Search, X } from 'lucide-react'
import { EVENT_SEARCH_MIN_LENGTH, isSearchableEventQuery } from '../hooks/useEventQueries'
import { CATEGORY_LABEL, CATEGORY_ORDER } from '../utils/display'
import type { EventFilters } from '../types'

const CHIP_BASE =
  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap'
const CHIP_ACTIVE = 'bg-primary text-white border-primary'
const CHIP_IDLE =
  'bg-white dark:bg-[#1A1226] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2D1F4D] hover:border-primary/40 hover:text-primary'

/**
 * `null` doubles as "Upcoming" — the feed already defaults an omitted `status` to `PUBLISHED`
 * server-side, so there's no need for a distinct explicit value.
 */
const TIME_OPTIONS: Array<{ value: EventFilters['status']; label: string }> = [
  { value: null, label: 'Upcoming' },
  { value: 'COMPLETED', label: 'Past' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const ONLINE_OPTIONS: Array<{ value: EventFilters['isOnline']; label: string }> = [
  { value: null, label: 'Anywhere' },
  { value: false, label: 'In person' },
  { value: true, label: 'Online' },
]

interface EventFilterBarProps {
  filters: EventFilters
  onChange: (filters: EventFilters) => void
  search: string
  onSearchChange: (value: string) => void
  /** Category and time aren't parameters of /events/search, so both rows hide while searching. */
  showFilterRows?: boolean
}

export function EventFilterBar({
  filters,
  onChange,
  search,
  onSearchChange,
  showFilterRows = true,
}: Readonly<EventFilterBarProps>) {
  const showMinLengthHint = search.trim().length > 0 && !isSearchableEventQuery(search)

  return (
    <div className="mb-5 space-y-3">
      <div>
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 transition-colors focus-within:border-primary/50 dark:border-[#2D1F4D] dark:bg-[#1A1226]">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search events…"
            aria-label="Search events"
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

        {showMinLengthHint && (
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            Type at least {EVENT_SEARCH_MIN_LENGTH} characters to search.
          </p>
        )}
      </div>

      {showFilterRows && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {TIME_OPTIONS.map((option) => {
              const active = filters.status === option.value
              return (
                <button
                  key={option.label}
                  onClick={() => onChange({ ...filters, status: option.value })}
                  className={`${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_IDLE}`}
                >
                  {option.label}
                </button>
              )
            })}

            <span className="mx-1 h-4 w-px bg-gray-200 dark:bg-[#2D1F4D]" />

            {ONLINE_OPTIONS.map((option) => {
              const active = filters.isOnline === option.value
              return (
                <button
                  key={option.label}
                  onClick={() => onChange({ ...filters, isOnline: option.value })}
                  className={`${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_IDLE}`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => onChange({ ...filters, category: null })}
              className={[
                'rounded-md px-2 py-1 text-[11px] transition-colors',
                filters.category === null
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:text-primary dark:bg-white/5 dark:text-gray-400',
              ].join(' ')}
            >
              All categories
            </button>
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
        </>
      )}
    </div>
  )
}
