import { Search, X } from 'lucide-react'
import { isSearchableJobQuery, JOB_SEARCH_MIN_LENGTH } from '../hooks/useJobQueries'
import {
  EXPERIENCE_LEVEL_LABEL,
  EXPERIENCE_LEVEL_ORDER,
  JOB_TYPE_LABEL,
  JOB_TYPE_ORDER,
  WORK_MODE_LABEL,
  WORK_MODE_ORDER,
} from '../utils/display'
import type { JobFilters } from '../types'

const CHIP_BASE =
  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap'
const CHIP_ACTIVE = 'bg-primary text-white border-primary'
const CHIP_IDLE =
  'bg-white dark:bg-[#1A1226] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2D1F4D] hover:border-primary/40 hover:text-primary'

/**
 * `null` doubles as "Open" — the feed already defaults an omitted `status` to `OPEN` server-side,
 * so there's no need for a distinct explicit value.
 */
const STATUS_OPTIONS: Array<{ value: JobFilters['status']; label: string }> = [
  { value: null, label: 'Open' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'FILLED', label: 'Filled' },
]

interface JobFilterBarProps {
  filters: JobFilters
  onChange: (filters: JobFilters) => void
  search: string
  onSearchChange: (value: string) => void
  /** jobType/workMode/experienceLevel and status aren't parameters of /jobs/search, so all rows hide while searching. */
  showFilterRows?: boolean
}

export function JobFilterBar({
  filters,
  onChange,
  search,
  onSearchChange,
  showFilterRows = true,
}: Readonly<JobFilterBarProps>) {
  const showMinLengthHint = search.trim().length > 0 && !isSearchableJobQuery(search)

  return (
    <div className="mb-5 space-y-3">
      <div>
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 transition-colors focus-within:border-primary/50 dark:border-[#2D1F4D] dark:bg-[#1A1226]">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search jobs…"
            aria-label="Search jobs"
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
            Type at least {JOB_SEARCH_MIN_LENGTH} characters to search.
          </p>
        )}
      </div>

      {showFilterRows && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_OPTIONS.map((option) => {
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

            {WORK_MODE_ORDER.map((mode) => {
              const active = filters.workMode === mode
              return (
                <button
                  key={mode}
                  onClick={() => onChange({ ...filters, workMode: active ? null : mode })}
                  className={`${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_IDLE}`}
                >
                  {WORK_MODE_LABEL[mode]}
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => onChange({ ...filters, jobType: null })}
              className={[
                'rounded-md px-2 py-1 text-[11px] transition-colors',
                filters.jobType === null
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:text-primary dark:bg-white/5 dark:text-gray-400',
              ].join(' ')}
            >
              All types
            </button>
            {JOB_TYPE_ORDER.map((jobType) => {
              const active = filters.jobType === jobType
              return (
                <button
                  key={jobType}
                  onClick={() => onChange({ ...filters, jobType: active ? null : jobType })}
                  className={[
                    'rounded-md px-2 py-1 text-[11px] transition-colors',
                    active
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:text-primary dark:bg-white/5 dark:text-gray-400',
                  ].join(' ')}
                >
                  {JOB_TYPE_LABEL[jobType]}
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => onChange({ ...filters, experienceLevel: null })}
              className={[
                'rounded-md px-2 py-1 text-[11px] transition-colors',
                filters.experienceLevel === null
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:text-primary dark:bg-white/5 dark:text-gray-400',
              ].join(' ')}
            >
              All levels
            </button>
            {EXPERIENCE_LEVEL_ORDER.map((level) => {
              const active = filters.experienceLevel === level
              return (
                <button
                  key={level}
                  onClick={() => onChange({ ...filters, experienceLevel: active ? null : level })}
                  className={[
                    'rounded-md px-2 py-1 text-[11px] transition-colors',
                    active
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:text-primary dark:bg-white/5 dark:text-gray-400',
                  ].join(' ')}
                >
                  {EXPERIENCE_LEVEL_LABEL[level]}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
