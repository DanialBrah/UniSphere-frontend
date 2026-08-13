import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import type { InfiniteData } from '@tanstack/react-query'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { JobBoard } from '../components/JobBoard'
import { JobFilterBar } from '../components/JobFilterBar'
import { MyJobApplicationsList } from '../components/MyJobApplicationsList'
import { isSearchableJobQuery, useJobFeed, useJobSearch, useMyJobs } from '../hooks/useJobQueries'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import { useAuth } from '../../../hooks/useAuth'
import { canCreateJob } from '../utils/permissions'
import { EMPTY_JOB_FILTERS } from '../types'
import type { JobFilters, JobSummaryResponse, SpringPage } from '../types'

/** Jobs splits its user base asymmetrically (only EMPLOYER posts, only STUDENT/ALUMNI applies), so
 * the tab list is built conditionally on role rather than a fixed constant the way Events' is —
 * CLUB/UNIVERSITY/ADMIN see Browse only, since they can neither post nor apply. */
const BROWSE_TAB = { id: 'browse', label: 'Browse' } as const
const MINE_TAB = { id: 'mine', label: 'My Postings' } as const
const APPLICATIONS_TAB = { id: 'applications', label: 'My Applications' } as const

type TabId = typeof BROWSE_TAB.id | typeof MINE_TAB.id | typeof APPLICATIONS_TAB.id

const flatten = (
  data?: InfiniteData<SpringPage<JobSummaryResponse>>,
): JobSummaryResponse[] => data?.pages.flatMap((page) => page.content) ?? []

export default function JobsBoardPage() {
  const navigate = useNavigate()
  const { user, role } = useAuth()
  const canPost = canCreateJob(user)
  const canSeeMyApplications = role === 'STUDENT' || role === 'ALUMNI'

  const tabs = useMemo(() => {
    const list: Array<{ id: TabId; label: string }> = [BROWSE_TAB]
    if (canPost) list.push(MINE_TAB)
    if (canSeeMyApplications) list.push(APPLICATIONS_TAB)
    return list
  }, [canPost, canSeeMyApplications])

  // The tab lives in the URL so a filtered view is linkable and survives a refresh.
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('view')
  const activeTab: TabId = tabs.some((tab) => tab.id === tabParam) ? (tabParam as TabId) : 'browse'

  const [filters, setFilters] = useState<JobFilters>(EMPTY_JOB_FILTERS)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const isSearching = isSearchableJobQuery(debouncedSearch)

  const isBrowse = activeTab === 'browse'
  const feed = useJobFeed(filters, isBrowse && !isSearching)
  const searchResults = useJobSearch(debouncedSearch, filters.jobType)
  const myJobs = useMyJobs(null, activeTab === 'mine')

  const browseQuery = isSearching ? searchResults : feed
  const listItems = flatten(browseQuery.data)

  const setTab = (tab: TabId) => {
    setSearchParams(tab === 'browse' ? {} : { view: tab }, { replace: true })
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-4xl p-6 lg:p-8">
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Jobs</h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Browse openings, or apply — Easy Apply in UniSphere or on the employer&apos;s own site.
            </p>
          </div>

          {canPost && (
            <button
              onClick={() => navigate('/jobs/new')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              Post a job
            </button>
          )}
        </header>

        {tabs.length > 1 && (
          <nav
            aria-label="Jobs views"
            className="mb-5 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-gray-200 dark:border-[#2D1F4D]"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                aria-current={activeTab === tab.id ? 'page' : undefined}
                className={[
                  '-mb-px whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-primary dark:text-gray-400',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        )}

        {activeTab === 'browse' && (
          <>
            <JobFilterBar
              filters={filters}
              onChange={setFilters}
              search={search}
              onSearchChange={setSearch}
              // jobType/workMode/experienceLevel/status aren't parameters of /jobs/search, so hide
              // the rows rather than render controls that would silently do nothing.
              showFilterRows={!isSearching}
            />

            <JobBoard
              jobs={listItems}
              isLoading={browseQuery.isPending && browseQuery.fetchStatus !== 'idle'}
              isError={browseQuery.isError}
              error={browseQuery.error}
              onRetry={() => browseQuery.refetch()}
              emptyTitle={isSearching ? 'No matches' : 'No jobs yet'}
              emptyHint={
                isSearching
                  ? 'Try a different word, or browse the full board.'
                  : 'Check back soon — new postings appear here.'
              }
              emptyActionLabel={isSearching || !canPost ? undefined : 'Post a job'}
              onEmptyAction={isSearching || !canPost ? undefined : () => navigate('/jobs/new')}
              hasNextPage={browseQuery.hasNextPage}
              isFetchingNextPage={browseQuery.isFetchingNextPage}
              onLoadMore={() => browseQuery.fetchNextPage()}
            />
          </>
        )}

        {activeTab === 'mine' && canPost && (
          <JobBoard
            jobs={flatten(myJobs.data)}
            isLoading={myJobs.isPending && myJobs.fetchStatus !== 'idle'}
            isError={myJobs.isError}
            error={myJobs.error}
            onRetry={() => myJobs.refetch()}
            emptyTitle="You haven't posted any jobs"
            emptyHint="Postings you create appear here, including drafts, closed and filled ones."
            emptyActionLabel="Post a job"
            onEmptyAction={() => navigate('/jobs/new')}
            hasNextPage={myJobs.hasNextPage}
            isFetchingNextPage={myJobs.isFetchingNextPage}
            onLoadMore={() => myJobs.fetchNextPage()}
          />
        )}

        {activeTab === 'applications' && canSeeMyApplications && <MyJobApplicationsList />}
      </div>
    </DashboardLayout>
  )
}
