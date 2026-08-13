import { Search, X } from 'lucide-react'
import { isSearchableProjectQuery, PROJECT_SEARCH_MIN_LENGTH } from '../hooks/useProjectQueries'
import { PROJECT_STATUS_LABEL } from '../utils/display'
import type { ProjectFilters, ProjectStatus } from '../types'

const CHIP_BASE =
  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap'
const CHIP_ACTIVE = 'bg-primary text-white border-primary'
const CHIP_IDLE =
  'bg-white dark:bg-[#1A1226] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2D1F4D] hover:border-primary/40 hover:text-primary'

const STATUS_OPTIONS: Array<{ value: ProjectStatus | null; label: string }> = [
  { value: null, label: 'All' },
  { value: 'OPEN', label: PROJECT_STATUS_LABEL.OPEN },
  { value: 'IN_PROGRESS', label: PROJECT_STATUS_LABEL.IN_PROGRESS },
  { value: 'COMPLETED', label: PROJECT_STATUS_LABEL.COMPLETED },
]

interface ProjectFilterBarProps {
  filters: ProjectFilters
  onChange: (filters: ProjectFilters) => void
  search: string
  onSearchChange: (value: string) => void
  /** status/recruiting aren't parameters of /projects/search, so the filter rows hide while searching. */
  showFilterRows?: boolean
}

export function ProjectFilterBar({
  filters,
  onChange,
  search,
  onSearchChange,
  showFilterRows = true,
}: Readonly<ProjectFilterBarProps>) {
  const showMinLengthHint = search.trim().length > 0 && !isSearchableProjectQuery(search)

  return (
    <div className="mb-5 space-y-3">
      <div>
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 transition-colors focus-within:border-primary/50 dark:border-[#2D1F4D] dark:bg-[#1A1226]">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects…"
            aria-label="Search projects"
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
            Type at least {PROJECT_SEARCH_MIN_LENGTH} characters to search.
          </p>
        )}
      </div>

      {showFilterRows && (
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

          <button
            onClick={() => onChange({ ...filters, recruiting: filters.recruiting ? null : true })}
            className={`${CHIP_BASE} ${filters.recruiting ? CHIP_ACTIVE : CHIP_IDLE}`}
          >
            Recruiting now
          </button>
        </div>
      )}
    </div>
  )
}
