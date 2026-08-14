import { Search, X } from 'lucide-react'
import { isSearchableServiceQuery, SERVICE_SEARCH_MIN_LENGTH } from '../hooks/useServiceQueries'
import { DELIVERY_MODE_LABEL, DELIVERY_MODE_ORDER, PRICING_TYPE_LABEL, PRICING_TYPE_ORDER } from '../utils/display'
import { SERVICE_CATEGORY_SUGGESTIONS } from '../utils/categories'
import type { ServiceFilters } from '../types'

const CHIP_BASE = 'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap'
const CHIP_ACTIVE = 'bg-primary text-white border-primary'
const CHIP_IDLE =
  'bg-white dark:bg-[#1A1226] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2D1F4D] hover:border-primary/40 hover:text-primary'

interface ServiceFilterBarProps {
  filters: ServiceFilters
  onChange: (filters: ServiceFilters) => void
  search: string
  onSearchChange: (value: string) => void
  /** pricingType/deliveryMode aren't parameters of /services/search, so those rows hide while searching. */
  showFilterRows?: boolean
}

export function ServiceFilterBar({
  filters,
  onChange,
  search,
  onSearchChange,
  showFilterRows = true,
}: Readonly<ServiceFilterBarProps>) {
  const showMinLengthHint = search.trim().length > 0 && !isSearchableServiceQuery(search)

  return (
    <div className="mb-5 space-y-3">
      <div>
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 transition-colors focus-within:border-primary/50 dark:border-[#2D1F4D] dark:bg-[#1A1226]">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search services…"
            aria-label="Search services"
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
            Type at least {SERVICE_SEARCH_MIN_LENGTH} characters to search.
          </p>
        )}
      </div>

      {showFilterRows && (
        <>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => onChange({ ...filters, category: null })}
              className={`${CHIP_BASE} ${filters.category === null ? CHIP_ACTIVE : CHIP_IDLE}`}
            >
              All categories
            </button>
            {SERVICE_CATEGORY_SUGGESTIONS.filter((c) => c !== 'Other').map((category) => {
              const active = filters.category === category
              return (
                <button
                  key={category}
                  onClick={() => onChange({ ...filters, category: active ? null : category })}
                  className={`${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_IDLE}`}
                >
                  {category}
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onChange({ ...filters, pricingType: null })}
              className={`${CHIP_BASE} ${filters.pricingType === null ? CHIP_ACTIVE : CHIP_IDLE}`}
            >
              Any pricing
            </button>
            {PRICING_TYPE_ORDER.map((pricingType) => {
              const active = filters.pricingType === pricingType
              return (
                <button
                  key={pricingType}
                  onClick={() => onChange({ ...filters, pricingType: active ? null : pricingType })}
                  className={`${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_IDLE}`}
                >
                  {PRICING_TYPE_LABEL[pricingType]}
                </button>
              )
            })}

            <span className="mx-1 h-4 w-px bg-gray-200 dark:bg-[#2D1F4D]" />

            {DELIVERY_MODE_ORDER.map((mode) => {
              const active = filters.deliveryMode === mode
              return (
                <button
                  key={mode}
                  onClick={() => onChange({ ...filters, deliveryMode: active ? null : mode })}
                  className={`${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_IDLE}`}
                >
                  {DELIVERY_MODE_LABEL[mode]}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
