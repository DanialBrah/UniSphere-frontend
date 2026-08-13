import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import type { InfiniteData } from '@tanstack/react-query'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { ProjectBoard } from '../components/ProjectBoard'
import { ProjectFilterBar } from '../components/ProjectFilterBar'
import { MyProjectApplicationsList } from '../components/MyProjectApplicationsList'
import {
  isSearchableProjectQuery,
  useJoinedProjects,
  useMyProjects,
  useProjectFeed,
  useProjectSearch,
} from '../hooks/useProjectQueries'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import { useAuth } from '../../../hooks/useAuth'
import { canCreateProject } from '../utils/permissions'
import { EMPTY_PROJECT_FILTERS } from '../types'
import type { ProjectFilters, ProjectSummaryResponse, SpringPage } from '../types'

/**
 * Projects splits its user base asymmetrically (STUDENT/ALUMNI/CLUB showcase, only STUDENT/ALUMNI
 * apply), so the tab list is built conditionally on role rather than a fixed constant — same idiom
 * as Jobs' `JobsBoardPage`.
 */
const BROWSE_TAB = { id: 'browse', label: 'Browse' } as const
const MINE_TAB = { id: 'mine', label: 'My Projects' } as const
const JOINED_TAB = { id: 'joined', label: 'Joined' } as const
const APPLICATIONS_TAB = { id: 'applications', label: 'My Applications' } as const

type TabId = typeof BROWSE_TAB.id | typeof MINE_TAB.id | typeof JOINED_TAB.id | typeof APPLICATIONS_TAB.id

const flatten = (
  data?: InfiniteData<SpringPage<ProjectSummaryResponse>>,
): ProjectSummaryResponse[] => data?.pages.flatMap((page) => page.content) ?? []

export default function ProjectsBoardPage() {
  const navigate = useNavigate()
  const { user, role } = useAuth()
  const canCreate = canCreateProject(user)
  const canJoinOrApply = role === 'STUDENT' || role === 'ALUMNI'

  const tabs = useMemo(() => {
    const list: Array<{ id: TabId; label: string }> = [BROWSE_TAB]
    if (canCreate) list.push(MINE_TAB)
    if (canJoinOrApply) list.push(JOINED_TAB, APPLICATIONS_TAB)
    return list
  }, [canCreate, canJoinOrApply])

  // The tab lives in the URL so a filtered view is linkable and survives a refresh.
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('view')
  const activeTab: TabId = tabs.some((tab) => tab.id === tabParam) ? (tabParam as TabId) : 'browse'

  const [filters, setFilters] = useState<ProjectFilters>(EMPTY_PROJECT_FILTERS)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const isSearching = isSearchableProjectQuery(debouncedSearch)

  const isBrowse = activeTab === 'browse'
  const feed = useProjectFeed(filters, isBrowse && !isSearching)
  const searchResults = useProjectSearch(debouncedSearch)
  const myProjects = useMyProjects(null, activeTab === 'mine')
  const joinedProjects = useJoinedProjects(activeTab === 'joined')

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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Projects</h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Showcase what you're building, or apply to join someone else's team.
            </p>
          </div>

          {canCreate && (
            <button
              onClick={() => navigate('/projects/new')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              Showcase a project
            </button>
          )}
        </header>

        {tabs.length > 1 && (
          <nav
            aria-label="Projects views"
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
            <ProjectFilterBar
              filters={filters}
              onChange={setFilters}
              search={search}
              onSearchChange={setSearch}
              // status/recruiting aren't parameters of /projects/search, so hide the rows rather
              // than render controls that would silently do nothing.
              showFilterRows={!isSearching}
            />

            <ProjectBoard
              projects={listItems}
              isLoading={browseQuery.isPending && browseQuery.fetchStatus !== 'idle'}
              isError={browseQuery.isError}
              error={browseQuery.error}
              onRetry={() => browseQuery.refetch()}
              emptyTitle={isSearching ? 'No matches' : 'No projects yet'}
              emptyHint={
                isSearching
                  ? 'Try a different word, or browse the full board.'
                  : 'Check back soon — new projects appear here.'
              }
              emptyActionLabel={isSearching || !canCreate ? undefined : 'Showcase a project'}
              onEmptyAction={isSearching || !canCreate ? undefined : () => navigate('/projects/new')}
              hasNextPage={browseQuery.hasNextPage}
              isFetchingNextPage={browseQuery.isFetchingNextPage}
              onLoadMore={() => browseQuery.fetchNextPage()}
            />
          </>
        )}

        {activeTab === 'mine' && canCreate && (
          <ProjectBoard
            projects={flatten(myProjects.data)}
            isLoading={myProjects.isPending && myProjects.fetchStatus !== 'idle'}
            isError={myProjects.isError}
            error={myProjects.error}
            onRetry={() => myProjects.refetch()}
            emptyTitle="You haven't showcased any projects"
            emptyHint="Projects you create appear here, at every status."
            emptyActionLabel="Showcase a project"
            onEmptyAction={() => navigate('/projects/new')}
            hasNextPage={myProjects.hasNextPage}
            isFetchingNextPage={myProjects.isFetchingNextPage}
            onLoadMore={() => myProjects.fetchNextPage()}
          />
        )}

        {activeTab === 'joined' && canJoinOrApply && (
          <ProjectBoard
            projects={flatten(joinedProjects.data)}
            isLoading={joinedProjects.isPending && joinedProjects.fetchStatus !== 'idle'}
            isError={joinedProjects.isError}
            error={joinedProjects.error}
            onRetry={() => joinedProjects.refetch()}
            emptyTitle="You haven't joined any projects"
            emptyHint="Once an owner accepts your application, the project shows up here."
            emptyActionLabel="Browse projects"
            onEmptyAction={() => navigate('/projects')}
            hasNextPage={joinedProjects.hasNextPage}
            isFetchingNextPage={joinedProjects.isFetchingNextPage}
            onLoadMore={() => joinedProjects.fetchNextPage()}
          />
        )}

        {activeTab === 'applications' && canJoinOrApply && <MyProjectApplicationsList />}
      </div>
    </DashboardLayout>
  )
}
