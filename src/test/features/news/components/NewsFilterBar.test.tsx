import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NewsFilterBar } from '../../../../features/news/components/NewsFilterBar'
import {
  isSearchableNewsQuery,
  sanitizeNewsQuery,
  NEWS_SEARCH_MIN_LENGTH,
} from '../../../../features/news/hooks/useNewsQueries'
import { EMPTY_NEWS_FILTERS } from '../../../../features/news/types'
import type { NewsFeedFilters } from '../../../../features/news/types'

// ── Module mocks ─────────────────────────────────────────────────────────────
const mockTags = vi.fn()

vi.mock('../../../../features/news/hooks/useNewsQueries', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('../../../../features/news/hooks/useNewsQueries')
  >()
  return { ...actual, usePopularTags: () => mockTags() }
})

// ── Helpers ──────────────────────────────────────────────────────────────────
function renderBar(overrides: {
  filters?: NewsFeedFilters
  onChange?: (f: NewsFeedFilters) => void
  search?: string
  onSearchChange?: (v: string) => void
} = {}) {
  const onChange = overrides.onChange ?? vi.fn()
  const onSearchChange = overrides.onSearchChange ?? vi.fn()
  render(
    <NewsFilterBar
      filters={overrides.filters ?? EMPTY_NEWS_FILTERS}
      onChange={onChange}
      search={overrides.search ?? ''}
      onSearchChange={onSearchChange}
    />,
  )
  return { onChange, onSearchChange }
}

beforeEach(() => {
  mockTags.mockReturnValue({ data: undefined })
})

// ── Tests ────────────────────────────────────────────────────────────────────
describe('sanitizeNewsQuery', () => {
  it('strips the FULLTEXT boolean operators the server also strips', () => {
    expect(sanitizeNewsQuery('a+b')).toBe('a b')
    expect(sanitizeNewsQuery('+++')).toBe('')
    expect(sanitizeNewsQuery('  exchange  ')).toBe('exchange')
  })

  it('leaves a query that would actually match alone', () => {
    expect(sanitizeNewsQuery('exchange programme')).toBe('exchange programme')
  })
})

describe('isSearchableNewsQuery', () => {
  it('accepts a query with at least one indexable token', () => {
    expect(isSearchableNewsQuery('exchange')).toBe(true)
    expect(isSearchableNewsQuery('a exchange')).toBe(true)
  })

  it('rejects a query whose every token is below the index minimum', () => {
    // MySQL's minimum applies per token, so "a b" is three characters but zero usable words.
    expect(isSearchableNewsQuery('a+b')).toBe(false)
    expect(isSearchableNewsQuery('ex')).toBe(false)
    expect(isSearchableNewsQuery('a b c')).toBe(false)
  })

  it('rejects a query that sanitizes away entirely', () => {
    expect(isSearchableNewsQuery('+++')).toBe(false)
    expect(isSearchableNewsQuery('')).toBe(false)
  })
})

describe('NewsFilterBar — the 3-character search minimum', () => {
  it('warns when the query is too short to match anything', () => {
    // MySQL's full-text index ignores tokens under innodb_ft_min_token_size (3 by default),
    // so without this hint a short query looks like a broken search box.
    renderBar({ search: 'ex' })
    expect(
      screen.getByText(`Type at least ${NEWS_SEARCH_MIN_LENGTH} characters to search.`),
    ).toBeInTheDocument()
  })

  it('warns for a query that only reaches 3 characters via operators', () => {
    // "a+b" is three characters but sanitizes to one usable token.
    renderBar({ search: 'a+b' })
    expect(screen.getByText(/Type at least 3 characters/)).toBeInTheDocument()
  })

  it('does not warn once the sanitized query is long enough', () => {
    renderBar({ search: 'exchange' })
    expect(screen.queryByText(/Type at least 3 characters/)).not.toBeInTheDocument()
  })

  it('does not warn on an empty box', () => {
    renderBar({ search: '' })
    expect(screen.queryByText(/Type at least 3 characters/)).not.toBeInTheDocument()
  })
})

describe('NewsFilterBar — category chips', () => {
  it('emits the selected category', () => {
    const { onChange } = renderBar()
    fireEvent.click(screen.getByText('Sports'))
    expect(onChange).toHaveBeenCalledWith({ category: 'SPORTS', tag: null, featured: null })
  })

  it('clears the filter when the active chip is clicked again', () => {
    const { onChange } = renderBar({
      filters: { category: 'SPORTS', tag: null, featured: null },
    })
    fireEvent.click(screen.getByText('Sports'))
    expect(onChange).toHaveBeenCalledWith({ category: null, tag: null, featured: null })
  })

  it('the All chip clears the category', () => {
    const { onChange } = renderBar({
      filters: { category: 'TECH', tag: null, featured: null },
    })
    fireEvent.click(screen.getByText('All'))
    expect(onChange).toHaveBeenCalledWith({ category: null, tag: null, featured: null })
  })
})

describe('NewsFilterBar — featured toggle', () => {
  it('turns the filter on as true', () => {
    const { onChange } = renderBar()
    fireEvent.click(screen.getByText('Featured'))
    expect(onChange).toHaveBeenCalledWith({ category: null, tag: null, featured: true })
  })

  it('turns it off as null, never false', () => {
    // featured=false is a valid server filter but not a user intent; null means "no filter".
    const { onChange } = renderBar({
      filters: { category: null, tag: null, featured: true },
    })
    fireEvent.click(screen.getByText('Featured'))
    expect(onChange).toHaveBeenCalledWith({ category: null, tag: null, featured: null })
  })
})

describe('NewsFilterBar — tag chips', () => {
  it('renders nothing when there are no tags yet', () => {
    renderBar()
    expect(screen.queryByText(/^#/)).not.toBeInTheDocument()
  })

  it('emits the tag when a chip is clicked', () => {
    mockTags.mockReturnValue({ data: [{ tag: 'exchange', articleCount: 4 }] })
    const { onChange } = renderBar()
    fireEvent.click(screen.getByText(/exchange/))
    expect(onChange).toHaveBeenCalledWith({ category: null, tag: 'exchange', featured: null })
  })
})

describe('NewsFilterBar — search input', () => {
  it('propagates typing', () => {
    const { onSearchChange } = renderBar()
    fireEvent.change(screen.getByLabelText('Search news articles'), {
      target: { value: 'hackathon' },
    })
    expect(onSearchChange).toHaveBeenCalledWith('hackathon')
  })

  it('clears the box', () => {
    const { onSearchChange } = renderBar({ search: 'hackathon' })
    fireEvent.click(screen.getByLabelText('Clear search'))
    expect(onSearchChange).toHaveBeenCalledWith('')
  })
})
