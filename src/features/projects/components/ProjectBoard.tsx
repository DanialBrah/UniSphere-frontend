import { motion } from 'framer-motion'
import { FolderKanban, TriangleAlert } from 'lucide-react'
import { ProjectCard } from './ProjectCard'
import { ProjectGridSkeleton } from './ProjectSkeleton'
import { ProjectErrorState, ProjectStateBlock } from './ProjectStateBlocks'
import { stagger } from '../../../lib/animations'
import type { ProjectSummaryResponse } from '../types'

interface ProjectBoardProps {
  projects: ProjectSummaryResponse[]
  isLoading: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
  emptyTitle: string
  emptyHint?: string
  emptyActionLabel?: string
  onEmptyAction?: () => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void
}

/**
 * The single skeleton -> error -> empty -> cards -> load-more sequence, shared by every list
 * surface: Browse, search results, My Projects and Joined.
 */
export function ProjectBoard({
  projects,
  isLoading,
  isError,
  error,
  onRetry,
  emptyTitle,
  emptyHint,
  emptyActionLabel,
  onEmptyAction,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: Readonly<ProjectBoardProps>) {
  if (isLoading) return <ProjectGridSkeleton />

  if (isError) {
    return (
      <ProjectErrorState
        icon={TriangleAlert}
        title="Couldn't load these projects"
        error={error}
        onRetry={onRetry}
      />
    )
  }

  if (projects.length === 0) {
    return (
      <ProjectStateBlock
        icon={FolderKanban}
        title={emptyTitle}
        hint={emptyHint}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    )
  }

  return (
    <>
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </motion.div>

      {hasNextPage && onLoadMore && (
        <div className="mt-6 text-center">
          <button
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2D1F4D] dark:text-primary-50"
          >
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </>
  )
}
