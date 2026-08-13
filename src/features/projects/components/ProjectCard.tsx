import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FolderKanban, Users } from 'lucide-react'
import { ProjectRecruitingBadge, ProjectStatusBadge } from './ProjectBadges'
import { fadeUp } from '../../../lib/animations'
import { getInitials } from '../../../lib/userDisplay'
import { formatProjectRelative } from '../utils/dateUtils'
import type { ProjectSummaryResponse } from '../types'

export function ProjectCard({ project }: Readonly<{ project: ProjectSummaryResponse }>) {
  const isCompleted = project.status === 'COMPLETED'

  return (
    <motion.article
      variants={fadeUp}
      className={`overflow-hidden rounded-2xl border border-gray-200 bg-white transition-colors hover:border-primary/40 dark:border-[#2D1F4D] dark:bg-[#1A1226] ${
        isCompleted ? 'opacity-70' : ''
      }`}
    >
      <Link to={`/projects/${project.id}`} className="block">
        {project.coverImageUrl ? (
          <img
            // Presigned URL, ~60 min expiry — refetched on window focus so a stale tab re-mints it.
            src={project.coverImageUrl}
            alt=""
            loading="lazy"
            className="aspect-[16/9] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[16/9] w-full items-center justify-center bg-gray-100 text-gray-300 dark:bg-white/5 dark:text-white/20">
            <FolderKanban size={28} />
          </div>
        )}

        <div className="space-y-3 p-4">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white">
                {project.title}
              </h3>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-gray-500 dark:text-gray-400">
                {project.owner.avatarUrl ? (
                  <img src={project.owner.avatarUrl} alt="" className="h-4 w-4 rounded-full object-cover" />
                ) : (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-100 text-[8px] font-semibold text-primary dark:bg-primary/20">
                    {getInitials(project.owner.displayName)}
                  </span>
                )}
                {project.owner.displayName}
              </p>
            </div>
            {project.status !== 'OPEN' && <ProjectStatusBadge status={project.status} />}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {project.isRecruiting && <ProjectRecruitingBadge />}
            {project.openRolesCount > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {project.openRolesCount} open {project.openRolesCount === 1 ? 'role' : 'roles'}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {project.memberCount} {project.memberCount === 1 ? 'member' : 'members'}
            </span>
            <span>{formatProjectRelative(project.createdAt)}</span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
