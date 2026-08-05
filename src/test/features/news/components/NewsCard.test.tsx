import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NewsCard } from '../../../../features/news/components/NewsCard'
import type { NewsArticleLike } from '../../../../features/news/types'

// ── Module mocks ─────────────────────────────────────────────────────────────
vi.mock('../../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: null, isAuthenticated: true, role: null, logout: vi.fn(), isHydrated: true }),
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }))

// ── Helpers ──────────────────────────────────────────────────────────────────
function makeArticle(overrides: Partial<NewsArticleLike> = {}): NewsArticleLike {
  return {
    id: 1,
    author: { id: 9, displayName: 'UniSphere U', avatarUrl: null, role: 'UNIVERSITY' },
    title: 'Exchange Programme Opens',
    summary: 'Applications are now open.',
    coverImageUrl: null,
    category: 'ACADEMIC',
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    universityId: null,
    featured: false,
    viewsCount: 10,
    likesCount: 2,
    commentCount: 1,
    liked: false,
    saved: false,
    tags: [],
    publishedAt: '2026-08-01T10:00:00',
    createdAt: '2026-07-30T09:00:00',
    ...overrides,
  }
}

function renderCard(article: NewsArticleLike, showStatus = false) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <NewsCard article={article} showStatus={showStatus} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe('NewsCard — badges', () => {
  it('shows the category chip', () => {
    renderCard(makeArticle())
    expect(screen.getByText('Academic')).toBeInTheDocument()
  })

  it('shows the Featured badge only when the article is featured', () => {
    renderCard(makeArticle())
    expect(screen.queryByText('Featured')).not.toBeInTheDocument()

    renderCard(makeArticle({ id: 2, featured: true }))
    expect(screen.getByText('Featured')).toBeInTheDocument()
  })

  it('hides the status chip by default, since the feed only returns published articles', () => {
    renderCard(makeArticle())
    expect(screen.queryByText('Published')).not.toBeInTheDocument()
  })

  it('shows the status chip when the Studio asks for it', () => {
    renderCard(makeArticle({ status: 'ARCHIVED' }), true)
    expect(screen.getByText('Archived')).toBeInTheDocument()
  })

  it('derives a Scheduled chip from a draft carrying a scheduledAt', () => {
    // There is no SCHEDULED status in the API — this state only exists in the UI.
    const article = { ...makeArticle({ status: 'DRAFT' }), scheduledAt: '2026-09-01T09:00:00' }
    renderCard(article, true)
    expect(screen.getByText('Scheduled')).toBeInTheDocument()
    expect(screen.queryByText('Draft')).not.toBeInTheDocument()
  })

  it('shows Draft for an unscheduled draft', () => {
    renderCard(makeArticle({ status: 'DRAFT', publishedAt: null }), true)
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })
})

describe('NewsCard — content', () => {
  it('links the title to the article', () => {
    renderCard(makeArticle({ id: 42 }))
    const link = screen.getByRole('link', { name: 'Exchange Programme Opens' })
    expect(link).toHaveAttribute('href', '/news/42')
  })

  it('renders the summary', () => {
    renderCard(makeArticle())
    expect(screen.getByText('Applications are now open.')).toBeInTheDocument()
  })

  it('omits the summary block when there is none', () => {
    renderCard(makeArticle({ summary: null }))
    expect(screen.queryByText('Applications are now open.')).not.toBeInTheDocument()
  })

  it('collapses tags past the fourth into a +N counter', () => {
    renderCard(makeArticle({ tags: ['a', 'b', 'c', 'd', 'e', 'f'] }))
    expect(screen.getByText('#a')).toBeInTheDocument()
    expect(screen.getByText('#d')).toBeInTheDocument()
    expect(screen.queryByText('#e')).not.toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('renders a timestamp for a draft, falling back to createdAt', () => {
    // publishedAt is null on drafts; without the fallback the line would render empty.
    const { container } = renderCard(makeArticle({ status: 'DRAFT', publishedAt: null }), true)
    expect(container.textContent).toMatch(/ago/)
  })
})
