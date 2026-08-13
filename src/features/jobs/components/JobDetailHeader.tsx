import { Building2, CalendarClock, ExternalLink, MapPin, ShieldCheck } from 'lucide-react'
import {
  ExperienceLevelBadge,
  JobApplicationModeBadge,
  JobStatusBadge,
  JobTypeBadge,
  WorkModeBadge,
} from './JobBadges'
import { formatJobDeadline, formatJobRelative } from '../utils/dateUtils'
import { formatSalaryRange } from '../utils/display'
import type { JobResponse } from '../types'

export function JobDetailHeader({ job }: Readonly<{ job: JobResponse }>) {
  const salary = formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryCurrency)

  return (
    <header className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <JobTypeBadge jobType={job.jobType} />
        <WorkModeBadge workMode={job.workMode} />
        <ExperienceLevelBadge level={job.experienceLevel} />
        <JobStatusBadge status={job.status} />
        <JobApplicationModeBadge mode={job.applicationMode} />
      </div>

      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {job.workMode === 'REMOTE' ? 'Remote' : (job.location ?? '—')}
          </span>
          {salary && <span>{salary}</span>}
        </div>
      </div>

      {job.applicationDeadline && (
        <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <CalendarClock className="h-3.5 w-3.5" />
          Apply by {formatJobDeadline(job.applicationDeadline)}
        </p>
      )}

      {job.description && (
        <div>
          <h2 className="mb-1.5 text-sm font-semibold text-gray-900 dark:text-white">About the role</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {job.description}
          </p>
        </div>
      )}

      {job.requirements && (
        <div>
          <h2 className="mb-1.5 text-sm font-semibold text-gray-900 dark:text-white">Requirements</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {job.requirements}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-gray-200 pt-4 dark:border-[#2D1F4D]">
        {job.employer.companyLogoUrl ? (
          <img src={job.employer.companyLogoUrl} alt="" className="h-10 w-10 rounded-xl object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-300 dark:bg-white/5 dark:text-white/20">
            <Building2 size={18} />
          </div>
        )}
        <div className="min-w-0 flex-1 text-xs">
          <p className="flex items-center gap-1 font-medium text-gray-900 dark:text-white">
            {job.employer.companyName}
            {job.employer.companyVerified && <ShieldCheck className="h-3.5 w-3.5 text-primary" />}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            {[job.employer.industry, job.employer.companySize].filter(Boolean).join(' · ') || 'Employer'}
            {' · posted '}
            {formatJobRelative(job.createdAt)}
          </p>
        </div>
        {job.employer.websiteUrl && (
          <a
            href={job.employer.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Website
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </header>
  )
}
