import { Link } from 'react-router-dom'
import { Code, ExternalLink, Users } from 'lucide-react'
import { ProjectRecruitingBadge, ProjectStatusBadge } from './ProjectBadges'
import { getInitials } from '../../../lib/userDisplay'
import { formatProjectRelative } from '../utils/dateUtils'
import type { ProjectResponse } from '../types'

export function ProjectDetailHeader({ project }: Readonly<{ project: ProjectResponse }>) {
  return (
    <header className="space-y-4">
      {project.coverImageUrl && (
        <img
          src={project.coverImageUrl}
          alt=""
          className="aspect-[16/9] w-full rounded-2xl object-cover"
        />
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <ProjectStatusBadge status={project.status} />
        {project.isRecruiting && <ProjectRecruitingBadge />}
      </div>

      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{project.title}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {project.memberCount} {project.memberCount === 1 ? 'member' : 'members'}
          </span>
          <span>Created {formatProjectRelative(project.createdAt)}</span>
        </div>
      </div>

      {project.description && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {project.description}
        </p>
      )}

      {(project.githubUrl || project.demoUrl) && (
        <div className="flex flex-wrap items-center gap-3">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-medium text-gray-700 transition-colors hover:border-primary/40 hover:text-primary dark:border-[#2D1F4D] dark:text-gray-300"
            >
              <Code className="h-3.5 w-3.5" />
              Source
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-medium text-gray-700 transition-colors hover:border-primary/40 hover:text-primary dark:border-[#2D1F4D] dark:text-gray-300"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Live demo
            </a>
          )}
        </div>
      )}

      <Link
        to={`/profile/${project.owner.id}`}
        className="flex items-center gap-3 border-t border-gray-200 pt-4 dark:border-[#2D1F4D]"
      >
        {project.owner.avatarUrl ? (
          <img src={project.owner.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary dark:bg-primary/20">
            {getInitials(project.owner.displayName)}
          </div>
        )}
        <div className="min-w-0 flex-1 text-xs">
          <p className="font-medium text-gray-900 hover:text-primary dark:text-white">
            {project.owner.displayName}
          </p>
          <p className="text-gray-500 dark:text-gray-400">Project owner</p>
        </div>
      </Link>
    </header>
  )
}
