import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ProjectApplicationStatusBadge } from './ProjectBadges'
import { getInitials } from '../../../lib/userDisplay'
import { formatProjectDateTime } from '../utils/dateUtils'
import { APPLICATION_DECISION_ORDER, APPLICATION_STATUS_LABEL } from '../utils/display'
import type { ProjectApplicationResponse, ProjectApplicationStatus } from '../types'

interface ProjectApplicantRowProps {
  application: ProjectApplicationResponse
  onDecide: (target: Extract<ProjectApplicationStatus, 'ACCEPTED' | 'REJECTED'>) => void
  isDeciding?: boolean
}

export function ProjectApplicantRow({ application, onDecide, isDeciding }: Readonly<ProjectApplicantRowProps>) {
  const [expanded, setExpanded] = useState(false)
  const { applicant } = application
  const canDecide = application.status === 'PENDING'

  return (
    <div className="space-y-2.5 rounded-2xl border border-gray-200 bg-white p-3.5 dark:border-[#2D1F4D] dark:bg-[#1A1226]">
      <div className="flex flex-wrap items-center gap-3">
        <Link to={`/profile/${application.applicantId}`} className="shrink-0">
          {applicant.avatarUrl ? (
            <img src={applicant.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary dark:bg-primary/20">
              {getInitials(applicant.displayName)}
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            to={`/profile/${application.applicantId}`}
            className="text-sm font-medium text-gray-900 hover:text-primary dark:text-white"
          >
            {applicant.displayName}
          </Link>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Applied for {application.roleTitle ?? 'a role'} · {formatProjectDateTime(application.createdAt)}
          </p>
        </div>

        <ProjectApplicationStatusBadge status={application.status} />
      </div>

      {application.message && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-primary dark:text-gray-400"
        >
          {expanded ? 'Hide message' : 'Show message'}
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      )}

      {expanded && application.message && (
        <p className="whitespace-pre-wrap rounded-xl bg-gray-50 p-3 text-xs text-gray-700 dark:bg-white/5 dark:text-gray-300">
          {application.message}
        </p>
      )}

      {application.decisionReason && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          &ldquo;{application.decisionReason}&rdquo;
        </p>
      )}

      {canDecide && (
        <div className="flex flex-wrap gap-1.5 border-t border-gray-100 pt-2.5 dark:border-white/5">
          {APPLICATION_DECISION_ORDER.map((target) => (
            <button
              key={target}
              type="button"
              disabled={isDeciding}
              onClick={() => onDecide(target)}
              className="rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-600 transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50 dark:border-[#2D1F4D] dark:text-gray-300"
            >
              {APPLICATION_STATUS_LABEL[target]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
