import { Search, Star, X } from 'lucide-react'
import {
  usePopularTags,
  isSearchableNewsQuery,
  NEWS_SEARCH_MIN_LENGTH,
} from '../hooks/useNewsQueries'
import { CATEGORY_LABEL, CATEGORY_ORDER } from '../utils/display'
import type { NewsFeedFilters } from '../types'

const CHIP_BASE =
  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap'
const CHIP_ACTIVE = 'bg-primary text-white border-primary'
const CHIP_IDLE =
  'bg-white dark:bg-[#1A1226] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2D1F4D] hover:border-primary/40 hover:text-primary'

interface Props {
  filters: NewsFeedFilters
  onChange: (filters: NewsFeedFilters) => void
  search: string
  onSearchChange: (value: string) => void
}

export function NewsFilterBar({ filters, onChange, search, onSearchChange }: Props) {
  const tags = usePopularTags(20)

  const showMinLengthHint = search.trim().length > 0 && !isSearchableNewsQuery(search)

  return (
    <div className="mb-5 space-y-3">
      <div>
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A1226] border border-gray-200 dark:border-[#2D1F4D] focus-within:border-primary/50 transition-colors">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search articles…"
            aria-label="Search news articles"
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="p-0.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* MySQL's full-text index ignores tokens shorter than 3 characters, so a 1- or 2-letter
            query matches nothing. Without this hint the search box just looks broken. */}
        {showMinLengthHint && (
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            Type at least {NEWS_SEARCH_MIN_LENGTH} characters to search.
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onChange({ ...filters, category: null })}
          className={`${CHIP_BASE} ${filters.category === null ? CHIP_ACTIVE : CHIP_IDLE}`}
        >
          All
        </button>

        {CATEGORY_ORDER.map((category) => {
          const active = filters.category === category
          return (
            <button
              key={category}
              // Clicking the active chip clears it, so the filter is its own toggle.
              onClick={() => onChange({ ...filters, category: active ? null : category })}
              className={`${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_IDLE}`}
            >
              {CATEGORY_LABEL[category]}
            </button>
          )
        })}

        <button
          // Never send featured: false — "explicitly not featured" isn't a user intent, and
          // null (omitted) is what "no filter" means to the API.
          onClick={() => onChange({ ...filters, featured: filters.featured ? null : true })}
          className={`${CHIP_BASE} inline-flex items-center gap-1 ${filters.featured ? CHIP_ACTIVE : CHIP_IDLE}`}
        >
          <Star size={11} className={filters.featured ? 'fill-current' : ''} />
          Featured
        </button>
      </div>

      {/* A fresh install has no tags at all — render nothing rather than an empty row. */}
      {tags.data && tags.data.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {tags.data.map(({ tag, articleCount }) => {
            const active = filters.tag === tag
            return (
              <button
                key={tag}
                onClick={() => onChange({ ...filters, tag: active ? null : tag })}
                className={[
                  'text-[11px] px-2 py-1 rounded-md transition-colors',
                  active
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-primary',
                ].join(' ')}
              >
                #{tag}
                <span className="ml-1 opacity-60">{articleCount}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
