import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, MapPin } from 'lucide-react'
import { ExperienceLevelBadge, JobStatusBadge, JobTypeBadge, WorkModeBadge } from './JobBadges'
import { fadeUp } from '../../../lib/animations'
import { formatJobRelative } from '../utils/dateUtils'
import { APPLICATION_STATUS_LABEL, formatSalaryRange } from '../utils/display'
import type { JobSummaryResponse } from '../types'

export function JobCard({ job }: Readonly<{ job: JobSummaryResponse }>) {
  const isClosed = job.status === 'CLOSED' || job.status === 'FILLED'
  const salary = formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryCurrency)

  return (
    <motion.article
      variants={fadeUp}
      className={`overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:border-primary/40 dark:border-[#2D1F4D] dark:bg-[#1A1226] ${
        isClosed ? 'opacity-70' : ''
      }`}
    >
      <Link to={`/jobs/${job.id}`} className="block space-y-3">
        <div className="flex items-start gap-3">
          {job.employer.companyLogoUrl ? (
            <img
              // Presigned URL, ~60 min expiry — refetched on window focus so a stale tab re-mints it.
              src={job.employer.companyLogoUrl}
              alt=""
              loading="lazy"
              className="h-11 w-11 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-300 dark:bg-white/5 dark:text-white/20">
              <Building2 size={20} />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white">
              {job.title}
            </h3>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{job.employer.companyName}</p>
          </div>

          {job.status !== 'OPEN' && <JobStatusBadge status={job.status} />}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <JobTypeBadge jobType={job.jobType} />
          <WorkModeBadge workMode={job.workMode} />
          <ExperienceLevelBadge level={job.experienceLevel} />
        </div>

        <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{job.workMode === 'REMOTE' ? 'Remote' : (job.location ?? '—')}</span>
          </p>
          {salary && <p>{salary}</p>}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
          <span>Posted {formatJobRelative(job.createdAt)}</span>
          {job.viewerApplicationStatus && (
            <span className="font-medium text-primary">
              {APPLICATION_STATUS_LABEL[job.viewerApplicationStatus]}
            </span>
          )}
        </div>
      </Link>
    </motion.article>
  )
}
