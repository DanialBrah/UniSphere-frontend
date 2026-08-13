import { JobStatusActions } from './JobStatusActions'
import { JobStatsPanel } from './JobStatsPanel'
import { JobApplicantRoster } from './JobApplicantRoster'
import type { JobResponse } from '../types'

/**
 * Owner/ADMIN console: status controls, stats, then the applicant roster. A single stacked section
 * rather than sub-tabbed, same as `EventManageTab` — the content volume here doesn't justify a
 * second tab layer.
 *
 * Renders the same way regardless of `applicationMode` — for an EXTERNAL job, stats/roster just
 * show their normal empty state (in-app applications are structurally impossible for that job),
 * rather than a special case hiding this section the way Events hides check-in for EXTERNAL events.
 */
export function JobManageTab({ job }: Readonly<{ job: JobResponse }>) {
  return (
    <div className="space-y-5">
      <JobStatusActions job={job} />
      <JobStatsPanel jobId={job.id} />
      <JobApplicantRoster jobId={job.id} />
    </div>
  )
}
